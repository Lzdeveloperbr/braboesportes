import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Goal,
  Handshake,
  Megaphone,
  RectangleVertical,
  Trophy,
  UserX,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  announcementsQuery,
  attendanceQuery,
  formatDate,
  matchesQuery,
  overall,
  playersQuery,
  trainingsQuery,
} from "@/lib/club";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel | Brabo Esporte Clube" },
      {
        name: "description",
        content:
          "Painel do Brabo Esporte Clube com próximo jogo, próximo treino, presenças, gols, assistências, cartões e avisos.",
      },
      { property: "og:title", content: "Painel | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Painel do Brabo Esporte Clube com próximo jogo, próximo treino, estatísticas e avisos.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const players = useQuery(playersQuery);
  const matches = useQuery(matchesQuery);
  const trainings = useQuery(trainingsQuery);
  const announcements = useQuery(announcementsQuery);
  const attendance = useQuery(attendanceQuery);

  const now = Date.now();
  const all = matches.data ?? [];
  const nextMatch = all.find((m) => new Date(m.match_date).getTime() > now);
  const played = all
    .filter((m) => m.goals_for !== null && m.goals_against !== null)
    .slice()
    .reverse();
  const nextTraining = (trainings.data ?? []).find(
    (t) => new Date(t.training_date).getTime() > now,
  );

  const roster = players.data ?? [];
  const ranking = roster
    .slice()
    .sort((a, b) => overall(b) - overall(a))
    .slice(0, 5);

  const wins = played.filter((m) => (m.goals_for ?? 0) > (m.goals_against ?? 0)).length;
  const goals = roster.reduce((s, p) => s + p.goals, 0);
  const assists = roster.reduce((s, p) => s + p.assists, 0);
  const cards = roster.reduce((s, p) => s + p.yellow_cards + p.red_cards, 0);
  const rows = attendance.data ?? [];
  const presencas = rows.filter((a) => a.status === "presente").length;
  const faltas = rows.filter((a) => a.status === "ausente").length;

  return (
    <AppShell>
      <div className="space-y-8 animate-stagger">
        <section className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-tight lg:text-5xl">Painel Executivo</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground/80">Temporada 2026 · Gestão Pro X</p>
          </div>
          <div className="hidden lg:block">
            <Badge variant="outline" className="border-primary/20 bg-primary/5 px-3 py-1 text-primary">
              Status: Operacional
            </Badge>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Atletas Ativos" value={roster.length} icon={Users} />
          <StatCard label="Taxa de Vitórias" value={`${Math.round((wins / (played.length || 1)) * 100)}%`} hint={`${wins}V / ${played.length}J`} icon={Trophy} />
          <StatCard label="Sessões de Treino" value={trainings.data?.length ?? 0} icon={Dumbbell} />
          <StatCard label="Presença Geral" value={`${Math.round((presencas / (presencas + faltas || 1)) * 100)}%`} icon={CheckCircle2} />
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Gols Marcados" value={goals} icon={Goal} />
          <StatCard label="Assistências" value={assists} icon={Handshake} />
          <StatCard label="Indisciplina" value={cards} icon={RectangleVertical} />
          <StatCard label="Faltas Registradas" value={faltas} icon={UserX} />
        </section>


        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="col-span-2 overflow-hidden border-border/40 bg-card/40 backdrop-blur-md shadow-elevated">
            <div className="flex items-center justify-between border-b border-border/40 bg-primary/5 px-6 py-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Próximo Compromisso</span>
              <Badge variant="outline" className="border-primary/30 text-primary">Matchday</Badge>
            </div>
            <CardContent className="p-8">
              {nextMatch ? (
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-4">
                      <p className="font-display text-4xl lg:text-5xl">
                        Brabo E.C. <span className="text-muted-foreground/40 font-sans text-2xl font-light mx-2">VS</span> {nextMatch.opponent}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-6 text-sm font-medium text-muted-foreground">
                      <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {formatDate(nextMatch.match_date)}</span>
                      <span className="flex items-center gap-2 uppercase tracking-wider">{nextMatch.venue ?? "Local a definir"}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                    <Badge variant="secondary" className="bg-secondary/60 text-foreground px-4 py-1">{nextMatch.competition ?? "Amistoso"}</Badge>
                    <Badge variant="outline" className="border-border/60 text-muted-foreground">{nextMatch.formation}</Badge>
                  </div>
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                  <Activity className="mb-2 h-8 w-8 opacity-20" />
                  <p className="text-sm font-medium italic">Calendário sem jogos próximos.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-md">
            <CardHeader className="border-b border-border/40 px-6 py-4">
              <CardTitle className="flex items-center gap-2 font-display text-lg tracking-widest text-muted-foreground/80">
                <Dumbbell className="h-4 w-4 text-primary" /> Próximo Treino
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {nextTraining ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xl font-bold tracking-tight">{nextTraining.title}</p>
                    <p className="mt-1 text-sm font-medium text-muted-foreground/70">
                      {formatDate(nextTraining.training_date)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30">{nextTraining.training_type}</Badge>
                    <Badge variant="outline" className="border-accent/40 text-accent">{nextTraining.categoria}</Badge>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm font-medium text-muted-foreground/50 italic">Nenhum treino agendado.</p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/60 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <CalendarDays className="h-5 w-5 text-primary" /> Últimos resultados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {played.slice(0, 4).map((m) => {
                const win = (m.goals_for ?? 0) > (m.goals_against ?? 0);
                const draw = m.goals_for === m.goals_against;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.opponent}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(m.match_date)}</p>
                    </div>
                    <span
                      className={
                        "font-display text-xl " +
                        (win ? "text-success" : draw ? "text-accent" : "text-primary")
                      }
                    >
                      {m.goals_for} - {m.goals_against}
                    </span>
                  </div>
                );
              })}
              {played.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem jogos disputados ainda.</p>
              )}
              <Link to="/jogos" className="inline-block pt-1 text-sm text-primary hover:underline">
                Ver todos os jogos
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <Trophy className="h-5 w-5 text-accent" /> Ranking dos atletas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ranking.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-5 font-display text-lg text-muted-foreground">{i + 1}</span>
                  <PlayerAvatar
                    path={p.photo_url}
                    name={p.full_name}
                    shirt={p.shirt_number}
                    className="h-9 w-9 text-base"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.position} · {p.goals} gols · {p.assists} assist.
                    </p>
                  </div>
                  <span className="font-display text-xl text-accent">{overall(p)}</span>
                </div>
              ))}
              {ranking.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum atleta cadastrado ainda.</p>
              )}

              <Link to="/elenco" className="inline-block pt-1 text-sm text-primary hover:underline">
                Ver elenco completo
              </Link>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-border/60 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <Megaphone className="h-5 w-5 text-primary" /> Avisos do clube
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(announcements.data ?? []).slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-lg border border-border/50 p-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{a.title}</p>
                    {a.pinned && <Badge className="bg-accent text-accent-foreground">Fixado</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                </div>
              ))}
              {(announcements.data ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum aviso publicado.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
