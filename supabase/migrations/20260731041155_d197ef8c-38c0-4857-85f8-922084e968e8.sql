REVOKE EXECUTE ON FUNCTION public.owns_player(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_president(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.owns_player(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_president(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;