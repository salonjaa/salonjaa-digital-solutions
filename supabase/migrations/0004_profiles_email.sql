-- profiles needs a queryable email column: auth.users.email isn't exposed
-- to PostgREST/RLS-scoped queries, but the admin panel (client list,
-- payment-request notifications) needs to read and display it via the
-- same RLS-scoped session used everywhere else, not a service-role read.
alter table public.profiles add column email text;

-- Backfill existing profiles (this migration runs with full privileges,
-- unlike normal app queries, so it can join auth.users here).
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- Populate it automatically for every future signup/admin-created user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;
