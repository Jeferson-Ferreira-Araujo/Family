-- Postgres grants EXECUTE to PUBLIC by default on function creation, so
-- revoking from anon/authenticated alone does not remove client access.
-- This migration closes that gap and re-grants EXECUTE only on the RPCs
-- that the app is meant to call directly from authenticated clients.

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.my_profile_id() from public;
revoke execute on function public.my_family_id() from public;
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_family_member(uuid) from public;
revoke execute on function public.same_family_profile(uuid) from public;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.seed_default_categories() from public;
revoke execute on function public.touch_updated_at() from public;

revoke execute on function public.create_family(text) from public;
revoke execute on function public.create_family_invite(int) from public;
revoke execute on function public.join_family_with_code(text) from public;
revoke execute on function public.add_child_profile(text, text, text) from public;
revoke execute on function public.complete_routine(uuid, date) from public;
revoke execute on function public.uncomplete_routine(uuid, date) from public;

-- Re-grant only to authenticated for the RPCs the app actually calls from the client.
grant execute on function public.create_family(text) to authenticated;
grant execute on function public.create_family_invite(int) to authenticated;
grant execute on function public.join_family_with_code(text) to authenticated;
grant execute on function public.add_child_profile(text, text, text) to authenticated;
grant execute on function public.complete_routine(uuid, date) to authenticated;
grant execute on function public.uncomplete_routine(uuid, date) to authenticated;
