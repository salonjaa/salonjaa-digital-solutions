-- Client portal foundation: profiles/auth, plans, assets, domain status,
-- Razorpay orders + payment ledger, and chat. Run this once against a new
-- Supabase project (SQL Editor, MCP, or `supabase db push` once the CLI is
-- linked). See docs/CONTENT.md / CLAUDE.md for the app-level context.
--
-- Design notes:
--   * Every table has RLS enabled, policies scoped `to authenticated` only
--     — nothing here is ever readable by the anon role. Clients can only
--     see/touch rows tied to their own auth.uid(); every policy also
--     allows is_admin() so a single admin role (currently Kumar's login,
--     see the seed comment below) covers everything without hardcoding an
--     email anywhere.
--   * auth.uid() is always wrapped as (select auth.uid()) inside policies —
--     Postgres then evaluates it once as an initPlan instead of once per
--     row, which matters once these tables have more than a handful of rows.
--   * security definer functions set search_path = '' and fully qualify
--     every reference (public.foo) rather than relying on an implicit
--     search_path, so they can't be tricked by a schema shadowing attack.
--   * orders/payment_events have NO client write policy at all — those
--     rows only ever change via a server route running as the admin (still
--     covered by is_admin()) or via the service-role client (the Razorpay
--     webhook, which has no user session).
--   * chat_messages.sender_role is enforced by the INSERT policy itself,
--     not by trusting the client's payload.
--   * Every foreign key that an RLS policy filters on (client_id, thread_id,
--     sender_id, order_id) has an index — RLS runs these filters on every
--     query touching the table, so an unindexed one becomes a seq scan.

-- ---------------------------------------------------------------------
-- profiles — 1:1 with auth.users; both clients and the admin live here.
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  company_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer + fixed search_path so this can be called from any RLS
-- policy without recursively re-checking policies on profiles itself.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = (select auth.uid())), false);
$$;

create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or public.is_admin());

-- Regular users may update their own profile, but never their own
-- is_admin flag — only an existing admin can promote someone.
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id or public.is_admin());

create or replace function public.prevent_self_admin_grant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_admin is distinct from old.is_admin and not public.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_guard_is_admin
  before update on public.profiles
  for each row execute function public.prevent_self_admin_grant();

-- Auto-create a profile row whenever a new Supabase Auth user is created
-- (i.e. whenever admin provisions a client, or seeds the admin account).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- client_plans — snapshotted plan assignment (decoupled from
-- src/content/plans.ts so later pricing/copy changes don't rewrite history).
-- ---------------------------------------------------------------------
create table public.client_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  plan_key text not null,
  plan_name text not null,
  base_price_paise integer not null check (base_price_paise >= 0),
  custom_addons jsonb not null default '[]'::jsonb,
  notes text,
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index client_plans_client_id_idx on public.client_plans (client_id);

alter table public.client_plans enable row level security;

create policy "client_plans_select_own_or_admin" on public.client_plans
  for select to authenticated
  using (client_id = (select auth.uid()) or public.is_admin());

create policy "client_plans_write_admin_only" on public.client_plans
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- client_assets — files/credentials/notes/links admin attaches.
-- Files themselves live in Supabase Storage (bucket: client-assets,
-- private); admin uploads/downloads go through server routes using the
-- service-role client rather than direct-from-browser storage policies.
-- ---------------------------------------------------------------------
create table public.client_assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('file', 'credential', 'note', 'link')),
  title text not null,
  description text,
  storage_path text,
  url text,
  -- Plaintext by design (e.g. a CMS login) — this is not a secrets vault.
  -- Don't put anything here more sensitive than the studio would already
  -- hand a client over email/WhatsApp today.
  secret_value text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index client_assets_client_id_idx on public.client_assets (client_id);

alter table public.client_assets enable row level security;

create policy "client_assets_select_own_or_admin" on public.client_assets
  for select to authenticated
  using (client_id = (select auth.uid()) or public.is_admin());

create policy "client_assets_write_admin_only" on public.client_assets
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- domain_status — domain(s) the studio purchased/manages on a client's
-- behalf, ownership kept by the client. "Expiring soon" is deliberately
-- NOT a stored status (nothing here re-evaluates it on a schedule) — compute
-- it in the UI from renewal_date <= now() + interval '30 days'.
-- ---------------------------------------------------------------------
create table public.domain_status (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  domain_name text not null,
  registrar text,
  status text not null default 'registered' check (status in ('registered', 'dns_pending', 'live', 'expired')),
  purchased_at date,
  renewal_date date,
  auto_renew boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index domain_status_client_id_idx on public.domain_status (client_id);

alter table public.domain_status enable row level security;

create policy "domain_status_select_own_or_admin" on public.domain_status
  for select to authenticated
  using (client_id = (select auth.uid()) or public.is_admin());

create policy "domain_status_write_admin_only" on public.domain_status
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- orders — one row per admin-generated Razorpay payment request. No client
-- write policy at all: only a server route (as the admin, or the
-- service-role client for the webhook) ever changes these rows.
-- ---------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id),
  client_plan_id uuid references public.client_plans (id),
  description text not null,
  line_items jsonb not null default '[]'::jsonb,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created', 'attempted', 'paid', 'failed', 'cancelled')),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  receipt text not null unique,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index orders_client_id_idx on public.orders (client_id);

alter table public.orders enable row level security;

create policy "orders_select_own_or_admin" on public.orders
  for select to authenticated
  using (client_id = (select auth.uid()) or public.is_admin());

create policy "orders_insert_admin_only" on public.orders
  for insert to authenticated
  with check (public.is_admin());

-- Deliberately no client-facing UPDATE policy — status transitions to
-- 'paid'/'failed' happen only via api/payments/verify and
-- api/payments/webhook, both running with elevated access (admin session /
-- service-role client), never as the paying client.
create policy "orders_update_admin_only" on public.orders
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- payment_events — append-only audit/idempotency ledger for Razorpay
-- webhook + client-side verify calls. dedupe_key stops a retried webhook
-- delivery from double-applying a status change.
-- ---------------------------------------------------------------------
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  dedupe_key text not null unique,
  event_type text not null check (event_type in ('payment.captured', 'payment.failed', 'order.paid', 'client_verify')),
  raw_payload jsonb not null,
  received_at timestamptz not null default now()
);

create index payment_events_order_id_idx on public.payment_events (order_id);

alter table public.payment_events enable row level security;

create policy "payment_events_select_admin_only" on public.payment_events
  for select to authenticated
  using (public.is_admin());

-- No INSERT policy for ordinary sessions — rows are written by
-- api/payments/verify and api/payments/webhook via the service-role client,
-- which bypasses RLS entirely.

-- ---------------------------------------------------------------------
-- chat_threads / chat_messages — one thread per client, realtime-enabled.
-- ---------------------------------------------------------------------
create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.profiles (id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.chat_threads enable row level security;

create policy "chat_threads_select_own_or_admin" on public.chat_threads
  for select to authenticated
  using (client_id = (select auth.uid()) or public.is_admin());

create policy "chat_threads_update_own_or_admin" on public.chat_threads
  for update to authenticated
  using (client_id = (select auth.uid()) or public.is_admin());

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  sender_role text not null check (sender_role in ('client', 'admin')),
  body text not null check (char_length(body) <= 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index chat_messages_thread_id_idx on public.chat_messages (thread_id);
create index chat_messages_sender_id_idx on public.chat_messages (sender_id);

alter table public.chat_messages enable row level security;

create policy "chat_messages_select_own_thread_or_admin" on public.chat_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.chat_threads t
      where t.id = thread_id and (t.client_id = (select auth.uid()) or public.is_admin())
    )
  );

-- sender_role is trusted from is_admin(), never from the client's payload —
-- this is what actually stops a client from posting as 'admin'.
create policy "chat_messages_insert_own_thread" on public.chat_messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and sender_role = (case when public.is_admin() then 'admin' else 'client' end)
    and exists (
      select 1 from public.chat_threads t
      where t.id = thread_id and (t.client_id = (select auth.uid()) or public.is_admin())
    )
  );

-- Read receipts go through this RPC rather than an open UPDATE policy, so
-- "what counts as unread" lives in one place. Marks every message in the
-- thread NOT sent by the caller as read.
create or replace function public.mark_thread_read(p_thread_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.chat_threads t
    where t.id = p_thread_id and (t.client_id = (select auth.uid()) or public.is_admin())
  ) then
    raise exception 'not authorized for this thread';
  end if;

  update public.chat_messages
  set read_at = now()
  where thread_id = p_thread_id
    and sender_id <> (select auth.uid())
    and read_at is null;
end;
$$;

-- Bump last_message_at on the thread whenever a message is inserted, so
-- the admin inbox can order/list by it without a join+max() every time.
create or replace function public.touch_thread_last_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_threads set last_message_at = new.created_at where id = new.thread_id;
  return new;
end;
$$;

create trigger chat_messages_touch_thread
  after insert on public.chat_messages
  for each row execute function public.touch_thread_last_message();

-- Required for the browser client's postgres_changes subscription to
-- receive INSERTs at all — easy to forget, fails silently if skipped.
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.chat_threads;

-- ---------------------------------------------------------------------
-- Seed: after creating the studio's own Supabase Auth user for Kumar
-- (kumarprasannajitsahu@gmail.com) — e.g. via the dashboard's
-- Authentication -> Add user, or Supabase Admin API — flip that profile to
-- admin. Swapping the admin later (e.g. to Saroj or Snehanjali) is just
-- running this same statement against their profile id; no code change.
--
--   update public.profiles set is_admin = true where id = '<kumar-auth-uid>';
