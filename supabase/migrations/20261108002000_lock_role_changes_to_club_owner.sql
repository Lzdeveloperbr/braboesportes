-- Only the club owner may directly change user roles.
-- Managers are assigned through the SECURITY DEFINER owner RPC, not by editing user_roles.
DROP POLICY IF EXISTS roles_manage ON public.user_roles;
CREATE POLICY roles_manage ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_president(auth.uid()))
  WITH CHECK (public.is_president(auth.uid()));

-- Keep role changes in the audit trail and prevent self-service privilege escalation.
