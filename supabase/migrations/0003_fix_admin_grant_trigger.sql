-- Bug found during manual testing: prevent_self_admin_grant (0001) was meant
-- to stop a logged-in non-admin from promoting themselves via a client-side
-- update, but it also silently blocked the service-role key from setting
-- is_admin on a brand-new profile (e.g. seeding the first admin) — a
-- service-role call has no auth.uid(), so public.is_admin() evaluated
-- false, and the trigger reverted the write with no error.
--
-- Fix: also allow the write through when the caller's JWT role is
-- 'service_role' (auth.role() reads that from the request JWT claims).
create or replace function public.prevent_self_admin_grant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and auth.role() is distinct from 'service_role'
     and not public.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
