ALTER TYPE public.categoria ADD VALUE IF NOT EXISTS 'Sub-9' BEFORE 'Sub-15';
ALTER TYPE public.categoria ADD VALUE IF NOT EXISTS 'Sub-11' BEFORE 'Sub-15';
ALTER TYPE public.categoria ADD VALUE IF NOT EXISTS 'Sub-13' BEFORE 'Sub-15';

CREATE OR REPLACE FUNCTION public.is_president(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'presidente');
$$;

DROP POLICY IF EXISTS players_write ON public.players;
CREATE POLICY players_write ON public.players FOR ALL TO authenticated
  USING (public.is_president(auth.uid())) WITH CHECK (public.is_president(auth.uid()));

DROP POLICY IF EXISTS matches_write ON public.matches;
CREATE POLICY matches_write ON public.matches FOR ALL TO authenticated
  USING (public.is_president(auth.uid())) WITH CHECK (public.is_president(auth.uid()));

DROP POLICY IF EXISTS trainings_write ON public.trainings;
CREATE POLICY trainings_write ON public.trainings FOR ALL TO authenticated
  USING (public.is_president(auth.uid())) WITH CHECK (public.is_president(auth.uid()));

DROP POLICY IF EXISTS ann_write ON public.announcements;
CREATE POLICY ann_write ON public.announcements FOR ALL TO authenticated
  USING (public.is_president(auth.uid())) WITH CHECK (public.is_president(auth.uid()));