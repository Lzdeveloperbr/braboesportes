TRUNCATE TABLE public.match_lineups, public.training_attendance, public.evaluations, public.payments, public.announcements, public.matches, public.trainings, public.players RESTART IDENTITY CASCADE;

ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS joined_on date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ativo';

ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_status_check;
ALTER TABLE public.players ADD CONSTRAINT players_status_check CHECK (status IN ('ativo','inativo'));

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN lower(NEW.email) = 'admin@braboesportes.com'
      THEN 'presidente'::public.app_role
      ELSE 'jogador'::public.app_role
    END
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'presidente'::public.app_role FROM auth.users WHERE lower(email) = 'admin@braboesportes.com'
ON CONFLICT (user_id, role) DO NOTHING;

DROP POLICY IF EXISTS "Fotos publicas" ON storage.objects;
CREATE POLICY "Fotos publicas" ON storage.objects
FOR SELECT USING (bucket_id = 'player-photos');

DROP POLICY IF EXISTS "Envio de fotos" ON storage.objects;
CREATE POLICY "Envio de fotos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'player-photos' AND (public.is_president(auth.uid()) OR (storage.foldername(name))[1] = auth.uid()::text));

DROP POLICY IF EXISTS "Atualizacao de fotos" ON storage.objects;
CREATE POLICY "Atualizacao de fotos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'player-photos' AND (public.is_president(auth.uid()) OR (storage.foldername(name))[1] = auth.uid()::text));

DROP POLICY IF EXISTS "Remocao de fotos" ON storage.objects;
CREATE POLICY "Remocao de fotos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'player-photos' AND public.is_president(auth.uid()));