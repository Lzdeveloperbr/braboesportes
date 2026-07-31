REVOKE ALL ON FUNCTION public.is_president(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_president(uuid) TO authenticated, service_role;