CREATE TYPE public.app_role AS ENUM ('presidente','treinador','jogador','responsavel');
CREATE TYPE public.categoria AS ENUM ('Sub-15','Sub-17','Sub-20','Adulto');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('presidente','treinador'));
$$;

CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'jogador'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  photo_url text,
  birth_date date,
  phone text,
  position text NOT NULL DEFAULT 'Meia',
  shirt_number int,
  categoria public.categoria NOT NULL DEFAULT 'Adulto',
  height_cm int,
  weight_kg int,
  dominant_foot text NOT NULL DEFAULT 'Direito',
  speed int NOT NULL DEFAULT 50,
  technique int NOT NULL DEFAULT 50,
  finishing int NOT NULL DEFAULT 50,
  passing int NOT NULL DEFAULT 50,
  defending int NOT NULL DEFAULT 50,
  physical int NOT NULL DEFAULT 50,
  matches_played int NOT NULL DEFAULT 0,
  goals int NOT NULL DEFAULT 0,
  assists int NOT NULL DEFAULT 0,
  yellow_cards int NOT NULL DEFAULT 0,
  red_cards int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_select" ON public.players FOR SELECT TO authenticated USING (true);
CREATE POLICY "players_write" ON public.players FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER players_updated BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opponent text NOT NULL,
  competition text,
  match_date timestamptz NOT NULL,
  venue text,
  home boolean NOT NULL DEFAULT true,
  categoria public.categoria NOT NULL DEFAULT 'Adulto',
  goals_for int,
  goals_against int,
  formation text NOT NULL DEFAULT '4-3-3',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_select" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "matches_write" ON public.matches FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  training_type text NOT NULL DEFAULT 'Técnico',
  training_date timestamptz NOT NULL,
  location text,
  categoria public.categoria NOT NULL DEFAULT 'Adulto',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainings TO authenticated;
GRANT ALL ON public.trainings TO service_role;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trainings_select" ON public.trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY "trainings_write" ON public.trainings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ann_select" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "ann_write" ON public.announcements FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

INSERT INTO public.players (full_name, position, shirt_number, categoria, birth_date, height_cm, weight_kg, dominant_foot, speed, technique, finishing, passing, defending, physical, matches_played, goals, assists, yellow_cards, red_cards) VALUES
('Rafael Moura','Goleiro',1,'Adulto','1995-03-12',190,86,'Direito',62,70,30,64,88,80,18,0,0,2,0),
('Diego Alves','Zagueiro',3,'Adulto','1997-07-02',186,82,'Direito',70,68,42,66,89,85,17,2,1,5,1),
('Lucas Prado','Zagueiro',4,'Adulto','1999-01-25',184,80,'Esquerdo',72,70,40,70,86,83,16,1,0,3,0),
('Bruno Tavares','Lateral',2,'Adulto','2000-11-08',176,72,'Direito',88,76,55,78,74,84,18,1,6,4,0),
('Igor Menezes','Lateral',6,'Adulto','2001-05-19',175,70,'Esquerdo',87,78,52,80,72,82,15,0,4,2,0),
('Thiago Ramos','Volante',5,'Adulto','1996-09-30',180,78,'Direito',74,80,58,84,82,86,18,3,5,6,0),
('Caio Bernardes','Meia',8,'Adulto','1998-04-14',178,74,'Direito',78,90,74,90,60,76,18,7,11,3,0),
('Vinícius Sales','Meia',10,'Adulto','1999-12-01',174,70,'Esquerdo',84,93,82,88,52,72,17,12,9,2,0),
('Matheus Lira','Atacante',9,'Adulto','1997-02-21',182,79,'Direito',90,84,93,72,44,85,18,21,6,3,1),
('Pedro Henrique','Atacante',7,'Adulto','2002-08-05',177,73,'Esquerdo',93,86,84,74,42,78,16,14,10,1,0),
('Gustavo Nunes','Atacante',11,'Sub-20','2005-06-17',175,68,'Direito',91,82,80,70,40,72,12,9,7,0,0),
('Enzo Carvalho','Meia',18,'Sub-17','2008-10-09',170,62,'Direito',82,85,70,84,50,64,10,4,8,1,0);

INSERT INTO public.matches (opponent, competition, match_date, venue, home, categoria, goals_for, goals_against, formation) VALUES
('União FC','Campeonato Regional', now() - interval '21 days','Estádio Municipal',true,'Adulto',3,1,'4-3-3'),
('Atlético Serrano','Campeonato Regional', now() - interval '14 days','Arena Serrano',false,'Adulto',2,2,'4-2-3-1'),
('Grêmio do Vale','Copa Cidade', now() - interval '7 days','Estádio Municipal',true,'Adulto',4,0,'4-3-3'),
('Real Esperança','Campeonato Regional', now() - interval '3 days','Campo da Esperança',false,'Adulto',1,2,'4-4-2'),
('Sport Aurora','Campeonato Regional', now() + interval '4 days','Estádio Municipal',true,'Adulto',NULL,NULL,'4-3-3'),
('Nova Aliança','Copa Cidade', now() + interval '11 days','Arena Aliança',false,'Adulto',NULL,NULL,'3-5-2');

INSERT INTO public.trainings (title, training_type, training_date, location, categoria, notes) VALUES
('Trabalho de posse e saída de bola','Tático', now() + interval '1 day','CT Brabo - Campo 1','Adulto','Foco em construção pelo lado esquerdo.'),
('Finalização e cruzamentos','Finalização', now() + interval '3 days','CT Brabo - Campo 2','Adulto','Duplas de atacantes e alas.'),
('Resistência e força','Físico', now() + interval '5 days','Academia do clube','Adulto',NULL),
('Bola parada ofensiva','Bola parada', now() + interval '6 days','CT Brabo - Campo 1','Sub-20','Ensaiar escanteios curtos.');

INSERT INTO public.announcements (title, body, pinned) VALUES
('Convocação para o clássico','Lista de relacionados para o jogo contra o Sport Aurora será divulgada na sexta-feira após o treino.', true),
('Nova parceria de material esportivo','O clube fechou patrocínio de uniformes para a temporada. Entrega dos novos kits na próxima semana.', false),
('Exames médicos da base','Atletas do Sub-17 devem entregar os exames atualizados até o fim do mês.', false);