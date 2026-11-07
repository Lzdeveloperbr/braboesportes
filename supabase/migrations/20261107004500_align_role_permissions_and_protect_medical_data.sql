-- Align database authorization helpers with the application role model.
-- Keep authorization in RLS; UI visibility alone is never a security boundary.

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('superadmin', 'presidente', 'admin', 'diretor')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('superadmin', 'presidente', 'admin', 'diretor', 'comissao', 'treinador', 'auxiliar')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_president(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('superadmin', 'presidente')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_president(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_president(uuid) TO authenticated, service_role;

-- Medical injury records must not be readable by every authenticated account.
DROP POLICY IF EXISTS injuries_select ON public.injuries;
CREATE POLICY injuries_select ON public.injuries
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
