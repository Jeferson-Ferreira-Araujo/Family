-- These helper functions are invoked from inside RLS policy expressions,
-- which run as the querying role (authenticated). Revoking EXECUTE from
-- PUBLIC in migration 0002 also removed the implicit ability for
-- `authenticated` to call them, breaking every policy that uses them
-- (e.g. same_family_profile inside profiles_select_self_or_family, which
-- surfaced as "permission denied for function same_family_profile" when
-- creating a family). Grant EXECUTE back to authenticated for all RLS
-- helper functions. This does make them callable directly as RPCs again
-- (e.g. /rest/v1/rpc/my_family_id), but that is harmless: each one only
-- ever returns information about the caller's own profile/family.

grant execute on function public.my_profile_id() to authenticated;
grant execute on function public.my_family_id() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.same_family_profile(uuid) to authenticated;
