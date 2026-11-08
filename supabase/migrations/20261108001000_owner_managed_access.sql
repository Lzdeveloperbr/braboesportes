-- Owner-controlled manager access. Guardians remain scoped to their linked athletes.
CREATE OR REPLACE FUNCTION public.set_club_manager(_email text, _role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id uuid;
  normalized_email text := lower(trim(_email));
BEGIN
  IF NOT public.is_president(auth.uid()) THEN
    RAISE EXCEPTION 'Somente o dono do clube pode gerenciar acessos administrativos.';
  END IF;

  IF normalized_email = '' OR normalized_email IS NULL THEN
    RAISE EXCEPTION 'Informe um e-mail válido.';
  END IF;

  IF _role NOT IN ('admin', 'diretor', 'remover') THEN
    RAISE EXCEPTION 'Perfil inválido. Use administrador, diretor ou remover.';
  END IF;

  SELECT id INTO target_user_id
  FROM auth.users
  WHERE lower(email) = normalized_email
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Conta não encontrada. Peça para a pessoa criar a conta no Brabo e tente novamente.';
  END IF;

  IF target_user_id = auth.uid() AND _role = 'remover' THEN
    RAISE EXCEPTION 'O dono do clube não pode remover o próprio acesso.';
  END IF;

  IF _role = 'remover' THEN
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id
      AND role::text IN ('admin', 'diretor');
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = target_user_id AND role::text = _role
    ) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (target_user_id, _role::public.app_role);
    END IF;
  END IF;

  INSERT INTO public.audit_log (actor_id, actor_email, action, entity, entity_id, details)
  SELECT auth.uid(), actor.email,
    CASE WHEN _role = 'remover' THEN 'revogar_acesso' ELSE 'conceder_acesso' END,
    'user_role', target_user_id::text,
    jsonb_build_object('email', normalized_email, 'role', _role)
  FROM auth.users actor
  WHERE actor.id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.list_club_managers()
RETURNS TABLE (user_id uuid, email text, role text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_president(auth.uid()) THEN
    RAISE EXCEPTION 'Somente o dono do clube pode consultar a lista de gestores.';
  END IF;

  RETURN QUERY
  SELECT ur.user_id, au.email::text, ur.role::text
  FROM public.user_roles ur
  JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role::text IN ('admin', 'diretor')
  ORDER BY lower(au.email), ur.role::text;
END;
$$;

REVOKE ALL ON FUNCTION public.set_club_manager(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_club_managers() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_club_manager(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_club_managers() TO authenticated;
