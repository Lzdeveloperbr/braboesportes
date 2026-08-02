-- 1. novos perfis
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'comissao';

-- 2. funcoes de permissao (comparacao por texto para nao depender dos novos rotulos nesta transacao)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text IN ('presidente','admin'));
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text IN ('presidente','admin','comissao','treinador'));
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- 3. colunas novas
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS rg text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS history text,
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.trainings
  ADD COLUMN IF NOT EXISTS checkin_code text,
  ADD COLUMN IF NOT EXISTS checkin_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS exercises text,
  ADD COLUMN IF NOT EXISTS load_level integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'agendado';

ALTER TABLE public.training_attendance
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS method text NOT NULL DEFAULT 'manual';

-- 4. configuracoes do clube
CREATE TABLE IF NOT EXISTS public.club_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  club_name text NOT NULL DEFAULT 'Brabo Esporte Clube',
  crest_url text,
  city text,
  stadium text,
  founded_year integer,
  contact_email text,
  contact_phone text,
  instagram text,
  monthly_fee numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.club_settings TO authenticated;
GRANT ALL ON public.club_settings TO service_role;
ALTER TABLE public.club_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY club_settings_select ON public.club_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY club_settings_write ON public.club_settings FOR ALL TO authenticated
  USING (public.is_president(auth.uid())) WITH CHECK (public.is_president(auth.uid()));
INSERT INTO public.club_settings (singleton) VALUES (true) ON CONFLICT DO NOTHING;

-- 5. patrocinadores
CREATE TABLE IF NOT EXISTS public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  tier text NOT NULL DEFAULT 'apoio',
  website text,
  amount numeric NOT NULL DEFAULT 0,
  starts_on date,
  ends_on date,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsors TO authenticated;
GRANT ALL ON public.sponsors TO service_role;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY sponsors_select ON public.sponsors FOR SELECT TO authenticated USING (true);
CREATE POLICY sponsors_write ON public.sponsors FOR ALL TO authenticated
  USING (public.is_president(auth.uid())) WITH CHECK (public.is_president(auth.uid()));

-- 6. documentos
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE,
  title text NOT NULL,
  doc_type text NOT NULL DEFAULT 'outro',
  file_path text NOT NULL,
  expires_on date,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_select ON public.documents FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR player_id IS NULL OR public.owns_player(player_id));
CREATE POLICY documents_write ON public.documents FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 7. estatisticas por partida
CREATE TABLE IF NOT EXISTS public.match_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  minutes integer NOT NULL DEFAULT 0,
  goals integer NOT NULL DEFAULT 0,
  assists integer NOT NULL DEFAULT 0,
  shots integer NOT NULL DEFAULT 0,
  passes integer NOT NULL DEFAULT 0,
  tackles integer NOT NULL DEFAULT 0,
  saves integer NOT NULL DEFAULT 0,
  yellow_cards integer NOT NULL DEFAULT 0,
  red_cards integer NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 0,
  mvp boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, player_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_stats TO authenticated;
GRANT ALL ON public.match_stats TO service_role;
ALTER TABLE public.match_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY match_stats_select ON public.match_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY match_stats_write ON public.match_stats FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 8. financeiro (receitas e despesas)
CREATE TABLE IF NOT EXISTS public.finance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'receita',
  category text NOT NULL DEFAULT 'geral',
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  entry_date date NOT NULL DEFAULT current_date,
  sponsor_id uuid REFERENCES public.sponsors(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_entries TO authenticated;
GRANT ALL ON public.finance_entries TO service_role;
ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY finance_select ON public.finance_entries FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY finance_write ON public.finance_entries FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 9. lesoes
CREATE TABLE IF NOT EXISTS public.injuries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'leve',
  started_on date NOT NULL DEFAULT current_date,
  expected_return date,
  status text NOT NULL DEFAULT 'em_tratamento',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.injuries TO authenticated;
GRANT ALL ON public.injuries TO service_role;
ALTER TABLE public.injuries ENABLE ROW LEVEL SECURITY;
CREATE POLICY injuries_select ON public.injuries FOR SELECT TO authenticated USING (true);
CREATE POLICY injuries_write ON public.injuries FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 10. responsaveis
CREATE TABLE IF NOT EXISTS public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  relationship text NOT NULL DEFAULT 'responsavel',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, player_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardians TO authenticated;
GRANT ALL ON public.guardians TO service_role;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
CREATE POLICY guardians_select ON public.guardians FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY guardians_write ON public.guardians FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 11. auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_select ON public.audit_log FOR SELECT TO authenticated USING (public.is_president(auth.uid()));
CREATE POLICY audit_insert ON public.audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

-- 12. gestao de perfis de usuario (sem escalonamento para presidente)
DROP POLICY IF EXISTS roles_manage ON public.user_roles;
CREATE POLICY roles_manage ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) AND (role::text <> 'presidente' OR public.is_president(auth.uid())))
  WITH CHECK (public.is_admin(auth.uid()) AND (role::text <> 'presidente' OR public.is_president(auth.uid())));
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- 13. escrita ampliada para admin/comissao nos modulos existentes
DROP POLICY IF EXISTS players_write ON public.players;
CREATE POLICY players_write ON public.players FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS matches_write ON public.matches;
CREATE POLICY matches_write ON public.matches FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS trainings_write ON public.trainings;
CREATE POLICY trainings_write ON public.trainings FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS ann_write ON public.announcements;
CREATE POLICY ann_write ON public.announcements FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS eval_write ON public.evaluations;
CREATE POLICY eval_write ON public.evaluations FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS lineup_write ON public.match_lineups;
CREATE POLICY lineup_write ON public.match_lineups FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS pay_select ON public.payments;
CREATE POLICY pay_select ON public.payments FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.owns_player(player_id));
DROP POLICY IF EXISTS pay_write ON public.payments;
CREATE POLICY pay_write ON public.payments FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS att_insert ON public.training_attendance;
CREATE POLICY att_insert ON public.training_attendance FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) OR public.owns_player(player_id));
DROP POLICY IF EXISTS att_update ON public.training_attendance;
CREATE POLICY att_update ON public.training_attendance FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) OR public.owns_player(player_id))
  WITH CHECK (public.is_staff(auth.uid()) OR public.owns_player(player_id));
DROP POLICY IF EXISTS att_delete ON public.training_attendance;
CREATE POLICY att_delete ON public.training_attendance FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- 14. triggers de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_club_settings_updated ON public.club_settings;
CREATE TRIGGER trg_club_settings_updated BEFORE UPDATE ON public.club_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_sponsors_updated ON public.sponsors;
CREATE TRIGGER trg_sponsors_updated BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_documents_updated ON public.documents;
CREATE TRIGGER trg_documents_updated BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_match_stats_updated ON public.match_stats;
CREATE TRIGGER trg_match_stats_updated BEFORE UPDATE ON public.match_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_finance_updated ON public.finance_entries;
CREATE TRIGGER trg_finance_updated BEFORE UPDATE ON public.finance_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_injuries_updated ON public.injuries;
CREATE TRIGGER trg_injuries_updated BEFORE UPDATE ON public.injuries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. politicas do bucket de documentos
DROP POLICY IF EXISTS "club docs read" ON storage.objects;
CREATE POLICY "club docs read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'club-docs');
DROP POLICY IF EXISTS "club docs write" ON storage.objects;
CREATE POLICY "club docs write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'club-docs' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'club-docs' AND public.is_admin(auth.uid()));