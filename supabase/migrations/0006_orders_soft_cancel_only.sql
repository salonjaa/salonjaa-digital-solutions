-- Payment requests are cancelled, never hard-deleted, so a client's payment
-- history (and the payment_events audit trail that cascades with a row) is
-- never lost to an admin-side mistake. Superseded by 0005's approach.
drop policy "orders_delete_admin_only" on public.orders;

-- Tightened so an admin's own session can never touch an already-'paid'
-- order at all (not even flip it back), on top of the existing rule that no
-- write here ever sets 'paid' in the first place (that only ever happens
-- via api/payments/verify or api/payments/webhook, both on the
-- service-role client, which bypasses RLS entirely and is unaffected by
-- this policy).
drop policy "orders_update_admin_only" on public.orders;
create policy "orders_update_admin_only" on public.orders
  for update to authenticated
  using (public.is_admin() and status <> 'paid')
  with check (public.is_admin());
