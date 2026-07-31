-- helper: player owned by current user
CREATE OR REPLACE FUNCTION public.owns_player(_player_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.players p WHERE p.id = _player_id AND p.user_id = auth.uid());
$$;

-- ATTENDANCE
CREATE TABLE public.training_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'presente',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (training_id, player_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_attendance TO authenticated;
GRANT ALL ON public.training_attendance TO service_role;
ALTER TABLE public.training_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY att_select ON public.training_attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY att_insert ON public.training_attendance FOR INSERT TO authenticated
  WITH CHECK (public.is_president(auth.uid()) OR public.owns_player(player_id));
CREATE POLICY att_update ON public.training_attendance FOR UPDATE TO authenticated
  USING (public.is_president(auth.uid()) OR public.owns_player(player_id))
  WITH CHECK (public.is_president(auth.uid()) OR public.owns_player(player_id));
CREATE POLICY att_delete ON public.training_attendance FOR DELETE TO authenticated
  USING (public.is_president(auth.uid()));
CREATE TRIGGER trg_att_updated BEFORE UPDATE ON public.training_attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PAYMENTS
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  due_date date,
  paid_at date,
  status text NOT NULL DEFAULT 'pendente',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY pay_select ON public.payments FOR SELECT TO authenticated
  USING (public.is_president(auth.uid()) OR public.owns_player(player_id));
CREATE POLICY pay_write ON public.payments FOR ALL TO authenticated
  USING (public.is_president(auth.uid())) WITH CHECK (public.is_president(auth.uid()));
CREATE TRIGGER trg_pay_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EVALUATIONS
CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  evaluated_on date NOT NULL DEFAULT current_date,
  speed integer NOT NULL DEFAULT 50,
  technique integer NOT NULL DEFAULT 50,
  finishing integer NOT NULL DEFAULT 50,
  passing integer NOT NULL DEFAULT 50,
  defending integer NOT NULL DEFAULT 50,
  physical integer NOT NULL DEFAULT 50,
  attitude integer NOT NULL DEFAULT 50,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evaluations TO authenticated;
GRANT ALL ON public.evaluations TO service_role;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY eval_select ON public.evaluations FOR SELECT TO authenticated USING (true);
CREATE POLICY eval_write ON public.evaluations FOR ALL TO authenticated
  USING (public.is_president(auth.uid())) WITH CHECK (public.is_president(auth.uid()));

-- LINEUPS
CREATE TABLE public.match_lineups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  slot text NOT NULL DEFAULT 'Titular',
  spot integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, player_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_lineups TO authenticated;
GRANT ALL ON public.match_lineups TO service_role;
ALTER TABLE public.match_lineups ENABLE ROW LEVEL SECURITY;
CREATE POLICY lineup_select ON public.match_lineups FOR SELECT TO authenticated USING (true);
CREATE POLICY lineup_write ON public.match_lineups FOR ALL TO authenticated
  USING (public.is_president(auth.uid())) WITH CHECK (public.is_president(auth.uid()));