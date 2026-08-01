DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DELETE FROM public.user_roles ur
WHERE ur.role = 'presidente'
  AND NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = ur.user_id AND lower(u.email) = 'admin@braboesportes.com'
  );