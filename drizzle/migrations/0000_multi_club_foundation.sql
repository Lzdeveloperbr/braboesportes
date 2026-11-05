ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'diretor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'auxiliar';

CREATE TABLE public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  crest_url text,
  primary_color text NOT NULL DEFAULT '#E11D2E',
  status text NOT NULL DEFAULT 'ativo',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clubs TO authenticated;
GRANT ALL ON public.clubs TO service_role;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (club_id, user_id)
);
CREATE INDEX club_members_user_idx ON public.club_members(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.club_members TO authenticated;
GRANT ALL ON public.club_members TO service_role;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text = 'superadmin');
$$;

CREATE OR REPLACE FUNCTION public.is_club_member(_club_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.club_members WHERE club_id = _club_id AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.current_club_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT club_id FROM public.club_members WHERE user_id = auth.uid() ORDER BY created_at LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid), public.is_club_member(uuid), public.current_club_id() TO authenticated;

-- is_admin / is_staff passam a incluir diretor e auxiliar
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text IN ('presidente','admin','diretor','superadmin'));
$$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text IN ('presidente','admin','diretor','superadmin','comissao','treinador','auxiliar'));
$$;

CREATE POLICY clubs_select ON public.clubs FOR SELECT TO authenticated USING (public.is_club_member(id));
CREATE POLICY clubs_update ON public.clubs FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()) OR (public.is_club_member(id) AND public.is_president(auth.uid())))
  WITH CHECK (public.is_super_admin(auth.uid()) OR (public.is_club_member(id) AND public.is_president(auth.uid())));
CREATE POLICY clubs_insert ON public.clubs FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY clubs_delete ON public.clubs FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));

CREATE POLICY members_select ON public.club_members FOR SELECT TO authenticated USING (public.is_club_member(club_id));
CREATE POLICY members_write ON public.club_members FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR (public.is_club_member(club_id) AND public.is_admin(auth.uid())))
  WITH CHECK (public.is_super_admin(auth.uid()) OR (public.is_club_member(club_id) AND public.is_admin(auth.uid())));

CREATE TRIGGER trg_clubs_updated BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Clube nº 1: Brabo
INSERT INTO public.clubs (id, name, slug) VALUES ('00000000-0000-0000-0000-00000000b4b0', 'Brabo Esporte Clube', 'brabo');
INSERT INTO public.club_members (club_id, user_id)
  SELECT DISTINCT '00000000-0000-0000-0000-00000000b4b0'::uuid, user_id FROM public.user_roles
  ON CONFLICT DO NOTHING;

-- club_id em todas as tabelas do clube + isolamento
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['announcements','audit_log','club_settings','documents','evaluations','finance_entries','guardians','injuries','match_lineups','match_stats','matches','payments','players','sponsors','training_attendance','trainings'] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE', t);
    EXECUTE format('UPDATE public.%I SET club_id = %L', t, '00000000-0000-0000-0000-00000000b4b0');
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN club_id SET DEFAULT public.current_club_id()', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN club_id SET NOT NULL', t);
    EXECUTE format('CREATE INDEX %I ON public.%I(club_id)', t || '_club_idx', t);
    EXECUTE format('CREATE POLICY club_isolation ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_club_member(club_id)) WITH CHECK (public.is_club_member(club_id))', t);
  END LOOP;
END $$;

-- Novos cadastros entram no clube Brabo como jogador (comportamento atual)
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN lower(NEW.email) = 'admin@braboesportes.com'
      THEN 'presidente'::public.app_role ELSE 'jogador'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.club_members (club_id, user_id)
  VALUES ('00000000-0000-0000-0000-00000000b4b0', NEW.id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;