-- Fixes flagged by mcp__supabase__get_advisors right after 0001:
--
--   1. Trigger-only functions (handle_new_user, prevent_self_admin_grant,
--      touch_thread_last_message) were callable directly by anon/
--      authenticated via PostgREST's /rpc/<fn> endpoint, since being
--      SECURITY DEFINER doesn't by itself restrict who can invoke a
--      function — only EXECUTE grants do. Triggers fire regardless of
--      EXECUTE grants (Postgres invokes them internally, not via a normal
--      call), so revoking direct EXECUTE closes the RPC hole without
--      touching trigger behavior.
--   2. is_admin()/mark_thread_read() are meant to be called by logged-in
--      users only — revoke from anon, keep authenticated (RLS policies
--      evaluate these as the querying role, so authenticated needs
--      EXECUTE to keep working).
--   3. client_plans/client_assets/domain_status each had a `for all`
--      admin policy stacked on top of a `for select` policy — both
--      permissive, both evaluated on every SELECT. Split into explicit
--      insert/update/delete so SELECT only ever runs one policy.
--   4. Covering indexes for FK columns the advisor flagged (created_by /
--      client_plan_id) — not RLS-filtered, but queried directly from admin
--      pages ("who created this", "which order came from this plan").

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_self_admin_grant() from public, anon, authenticated;
revoke execute on function public.touch_thread_last_message() from public, anon, authenticated;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.mark_thread_read(uuid) from public, anon;
grant execute on function public.mark_thread_read(uuid) to authenticated;

drop policy "client_plans_write_admin_only" on public.client_plans;
create policy "client_plans_insert_admin_only" on public.client_plans
  for insert to authenticated with check (public.is_admin());
create policy "client_plans_update_admin_only" on public.client_plans
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "client_plans_delete_admin_only" on public.client_plans
  for delete to authenticated using (public.is_admin());

drop policy "client_assets_write_admin_only" on public.client_assets;
create policy "client_assets_insert_admin_only" on public.client_assets
  for insert to authenticated with check (public.is_admin());
create policy "client_assets_update_admin_only" on public.client_assets
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "client_assets_delete_admin_only" on public.client_assets
  for delete to authenticated using (public.is_admin());

drop policy "domain_status_write_admin_only" on public.domain_status;
create policy "domain_status_insert_admin_only" on public.domain_status
  for insert to authenticated with check (public.is_admin());
create policy "domain_status_update_admin_only" on public.domain_status
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "domain_status_delete_admin_only" on public.domain_status
  for delete to authenticated using (public.is_admin());

create index client_plans_created_by_idx on public.client_plans (created_by);
create index client_assets_created_by_idx on public.client_assets (created_by);
create index orders_created_by_idx on public.orders (created_by);
create index orders_client_plan_id_idx on public.orders (client_plan_id);
