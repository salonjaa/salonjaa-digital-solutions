-- Admin can delete payment requests (orders) directly through their own
-- RLS-scoped session, same shape as orders_update_admin_only — but never a
-- 'paid' one. That's enforced here at the DB level (not just in the API
-- route) so a paid order — and the payment_events audit rows that cascade
-- with it — can't be lost to a bug or a future write path.
create policy "orders_delete_admin_only" on public.orders
  for delete to authenticated
  using (public.is_admin() and status <> 'paid');
