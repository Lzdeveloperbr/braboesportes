import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Goal,
  Handshake,
  HeartPulse,
  Megaphone,
  RectangleVertical,
  Trophy,
  UserX,
  Wallet,
  Zap,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { BRAND } from "@/lib/brand";
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
  const draws = played.filter((m) => m.goals_for === m.goals_against).length;
  const losses = played.length - wins - draws;
  const goalsFor = played.reduce((total, match) => total + (match.goals_for ?? 0), 0);
  const goalsAgainst = played.reduce((total, match) => total + (match.goals_against ?? 0), 0);
  const goalDifference = goalsFor - goalsAgainst;
  const winRate = played.length ? Math.round((wins / played.length) * 100) : null;
  const recentForm = played.slice(0, 5).map((match) => {
    if ((match.goals_for ?? 0) > (match.goals_against ?? 0)) return "V";
    if (match.goals_for === match.goals_against) return "E";
    return "D";
  });
  const goals = roster.reduce((s, p) => s + p.goals, 0);
  const assists = roster.reduce((s, p) => s + p.assists, 0);
  const cards = roster.reduce((s, p) => s + p.yellow_cards + p.red_cards, 0);
  const rows = attendance.data ?? [];
  const presencas = rows.filter((a) => a.status === "presente").length;
  const faltas = rows.filter((a) => a.status === "ausente").length;
  const attendanceTotal = presencas + faltas;
  const attendanceRate = attendanceTotal
    ? Math.round((presencas / attendanceTotal) * 100)
    : null;

  return (
    <AppShell>
      <div className="space-y-8 animate-stagger">
        <section className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.09] bg-[radial-gradient(ellipse_at_90%_0%,rgba(220,38,38,0.25),transparent_38%),linear-gradient(125deg,#090b0f_0%,#15171c_58%,#351014_100%)] px-6 py-7 shadow-[0_28px_80px_-38px_rgba(0,0,0,0.95)] sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute -right-12 -top-16 -z-10 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 -z-10 h-52 w-52 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <img src={BRAND.crest} alt="Escudo do Brabo Esporte Clube" className="h-16 w-16 shrink-0 drop-shadow-xl sm:h-20 sm:w-20" />
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200">Centro de comando</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Temporada 2026</span>
                </div>
                <h1 className="font-display text-4xl leading-[0.92] tracking-[0.035em] text-white sm:text-5xl lg:text-7xl">BRABO ESPORTE CLUBE</h1>
                <p className="mt-2 max-w-xl text-sm text-white/65">Gestão de alto desempenho. Elenco, comissão e diretoria trabalhando com o mesmo objetivo.</p>
                <p className="mt-3 flex items-center gap-2 text-[11px] font-medium capitalize text-white/45"><CalendarClock className="h-3.5 w-3.5" /> {new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "long" })}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Link to="/jogos" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90"><Activity className="h-4 w-4" /> Central de jogos <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              <Link to="/treinos" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"><Dumbbell className="h-4 w-4" /> Planejar treino</Link>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            <div><p className="font-display text-3xl leading-none text-white">{roster.length.toString().padStart(2, "0")}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">Atletas no elenco</p></div>
            <div><p className="font-display text-3xl leading-none text-white">{played.length.toString().padStart(2, "0")}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">Jogos registrados</p></div>
            <div><p className="font-display text-3xl leading-none text-white">{winRate === null ? "—" : `${winRate}%`}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">Aproveitamento em vitórias</p></div>
          </div>
        </section>
        <section className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl tracking-tight lg:text-4xl">Visão executiva</h2>
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
          <StatCard label="Taxa de Vitórias" value={winRate === null ? "—" : `${winRate}%`} hint={played.length ? `${wins}V / ${played.length}J` : "Sem jogos finalizados"} icon={Trophy} />
          <StatCard label="Sessões de Treino" value={trainings.data?.length ?? 0} icon={Dumbbell} />
          <StatCard label="Presença Geral" value={attendanceRate === null ? "—" : `${attendanceRate}%`} icon={CheckCircle2} />
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Gols Marcados" value={goals} icon={Goal} />
          <StatCard label="Assistências" value={assists} icon={Handshake} />
          <StatCard label="Indisciplina" value={cards} icon={RectangleVertical} />
          <StatCard label="Faltas Registradas" value={faltas} icon={UserX} />
        </section>


        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="border-b border-border/40 pb-3">
              <CardTitle className="font-display text-xl tracking-wider">Desempenho da equipe</CardTitle>
              <p className="text-xs text-muted-foreground">Resumo baseado nos resultados registrados</p>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 p-4 sm:gap-5">
              <div><p className="font-display text-3xl text-success">{wins}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vitórias</p></div>
              <div><p className="font-display text-3xl text-amber-400">{draws}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Empates</p></div>
              <div><p className="font-display text-3xl text-primary">{losses}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Derrotas</p></div>
              <div className="col-span-3 grid grid-cols-3 gap-3 border-t border-border/40 pt-3">
                <div><p className="text-lg font-bold">{goalsFor}</p><p className="text-[9px] uppercase tracking-wider text-muted-foreground">Gols pró</p></div>
                <div><p className="text-lg font-bold">{goalsAgainst}</p><p className="text-[9px] uppercase tracking-wider text-muted-foreground">Gols contra</p></div>
                <div><p className={cn("text-lg font-bold", goalDifference > 0 ? "text-success" : goalDifference < 0 ? "text-primary" : "text-foreground")}>{goalDifference > 0 ? "+" : ""}{goalDifference}</p><p className="text-[9px] uppercase tracking-wider text-muted-foreground">Saldo</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="border-b border-border/40 pb-3">
              <CardTitle className="font-display text-xl tracking-wider">Últimos 5 jogos</CardTitle>
              <p className="text-xs text-muted-foreground">Forma recente do Brabo</p>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-2 p-5">
              {recentForm.length ? recentForm.slice().reverse().map((result, index) => (
                <span key={index} className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-black", result === "V" ? "bg-success/15 text-success" : result === "E" ? "bg-amber-500/15 text-amber-400" : "bg-primary/15 text-primary")}>{result}</span>
              )) : <p className="py-3 text-center text-xs text-muted-foreground">Registre resultados para acompanhar a sequência.</p>}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden border-border/40 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
              <div><CardTitle className="font-display text-xl tracking-wider">Momento do time</CardTitle><p className="mt-1 text-xs text-muted-foreground">Últimos resultados registrados</p></div>
              <Link to="/estatisticas" className="text-xs font-semibold text-primary hover:underline">Análise completa</Link>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                {played.slice(0, 5).reverse().map((m) => {
                  const win = (m.goals_for ?? 0) > (m.goals_against ?? 0);
                  const draw = m.goals_for === m.goals_against;
                  return <div key={m.id} className="min-w-[88px] flex-1 rounded-xl border border-border/50 bg-secondary/30 px-3 py-3 text-center"><span className={cn("mx-auto flex h-8 w-8 items-center justify-center rounded-full font-display text-lg", win ? "bg-emerald-500/15 text-emerald-400" : draw ? "bg-amber-500/15 text-amber-400" : "bg-primary/15 text-primary")}>{win ? "V" : draw ? "E" : "D"}</span><p className="mt-2 font-display text-xl">{m.goals_for}–{m.goals_against}</p><p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{m.opponent}</p></div>;
                })}
                {played.length === 0 && <p className="w-full py-5 text-center text-sm text-muted-foreground">Registre os jogos para acompanhar a evolução do time.</p>}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Vitória</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Empate</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Derrota</span></div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/60">
            <CardHeader className="border-b border-border/40 pb-4"><CardTitle className="flex items-center gap-2 font-display text-xl tracking-wider"><Zap className="h-4 w-4 text-accent" /> Acesso rápido</CardTitle><p className="text-xs text-muted-foreground">Atalhos para a rotina da diretoria</p></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 p-4">
              {[
                { to: "/elenco", label: "Gerenciar elenco", icon: Users },
                { to: "/escalacao", label: "Montar escalação", icon: ClipboardList },
                { to: "/agenda", label: "Ver agenda", icon: CalendarDays },
                { to: "/financeiro", label: "Financeiro", icon: Wallet },
                { to: "/medico", label: "Departamento médico", icon: HeartPulse },
                { to: "/avisos", label: "Comunicados", icon: Megaphone },
              ].map((item) => { const Icon = item.icon; return <Link key={item.to} to={item.to} className="group flex min-h-[76px] flex-col justify-between rounded-xl border border-border/40 bg-secondary/20 p-3 transition hover:border-primary/40 hover:bg-primary/5"><Icon className="h-4 w-4 text-primary transition group-hover:scale-110" /><span className="flex items-center justify-between gap-1 text-[11px] font-semibold leading-tight">{item.label}<ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground transition group-hover:text-primary" /></span></Link>; })}
            </CardContent>
          </Card>
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

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/40 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="flex items-center justify-between font-display text-xl tracking-wider">
                <div className="flex items-center gap-2 text-muted-foreground/80">
                  <CalendarDays className="h-5 w-5 text-primary" /> Histórico Recente
                </div>
                <Link to="/jogos" className="text-xs font-sans font-medium text-primary hover:underline">
                  Ver todos
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {played.slice(0, 4).map((m) => {
                const win = (m.goals_for ?? 0) > (m.goals_against ?? 0);
                const draw = m.goals_for === m.goals_against;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 p-4 transition-all hover:bg-secondary/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold tracking-tight">{m.opponent}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">{formatDate(m.match_date)}</p>
                    </div>
                    <span
                      className={cn(
                        "font-display text-2xl ",
                        win ? "text-success" : draw ? "text-accent" : "text-primary"
                      )}
                    >
                      {m.goals_for} - {m.goals_against}
                    </span>
                  </div>
                );
              })}
              {played.length === 0 && (
                <div className="py-8 text-center text-sm font-medium text-muted-foreground/40 italic">Nenhum registro de partida.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="flex items-center justify-between font-display text-xl tracking-wider">
                <div className="flex items-center gap-2 text-muted-foreground/80">
                  <Trophy className="h-5 w-5 text-accent" /> Top Performances
                </div>
                <Link to="/elenco" className="text-xs font-sans font-medium text-primary hover:underline">
                  Ver elenco
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {ranking.map((p, i) => (
                <div key={p.id} className="group flex items-center gap-4 rounded-xl p-2 transition-all hover:bg-secondary/20">
                  <span className="w-4 font-display text-lg text-muted-foreground/40 group-hover:text-accent transition-colors">{i + 1}</span>
                  <PlayerAvatar
                    path={p.photo_url}
                    name={p.full_name}
                    shirt={p.shirt_number}
                    className="h-10 w-10 text-base shadow-sm ring-primary/10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold tracking-tight">{p.full_name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                      {p.position} · {p.goals} Gols · {p.assists} Assist.
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-display text-2xl text-accent">{overall(p)}</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/40 leading-none">Rating</span>
                  </div>
                </div>
              ))}
              {ranking.length === 0 && (
                <div className="py-8 text-center text-sm font-medium text-muted-foreground/40 italic">Sem dados de atletas.</div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-border/40 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 font-display text-xl tracking-wider text-muted-foreground/80">
                <Megaphone className="h-5 w-5 text-primary" /> Comunicados Oficiais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
              {(announcements.data ?? []).slice(0, 3).map((a) => (
                <div key={a.id} className="relative overflow-hidden rounded-xl border border-border/40 bg-secondary/20 p-5 transition-all hover:bg-secondary/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Notificação</span>
                    {a.pinned && <Badge className="h-5 bg-accent text-accent-foreground text-[9px] uppercase font-bold tracking-tighter">Fixado</Badge>}
                  </div>
                  <p className="text-sm font-bold tracking-tight mb-2">{a.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground/80 line-clamp-3">{a.body}</p>
                  {/* Decorative element */}
                  <div className="absolute -bottom-2 -right-2 opacity-5">
                    <Megaphone className="h-12 w-12 text-primary rotate-12" />
                  </div>
                </div>
              ))}
              {(announcements.data ?? []).length === 0 && (
                <div className="col-span-full py-12 text-center text-sm font-medium text-muted-foreground/30 italic">Nenhum aviso no mural.</div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
