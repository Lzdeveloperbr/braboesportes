import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Goal, ShieldCheck, Trophy, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, matchesQuery } from "@/lib/club";

export const Route = createFileRoute("/competicoes")({
  head: () => ({
    meta: [
      { title: "Competições | Brabo Esporte Clube" },
      { name: "description", content: "Acompanhamento de competições, calendário e desempenho do Brabo E.C." },
    ],
  }),
  component: Competicoes,
});

function Competicoes() {
  const { data: matches = [], isLoading, isError } = useQuery(matchesQuery);
  const now = Date.now();

  const competitions = useMemo(() => {
    const grouped = new Map<string, typeof matches>();
    for (const match of matches) {
      const name = match.competition?.trim() || "Amistosos";
      const items = grouped.get(name) ?? [];
      items.push(match);
      grouped.set(name, items);
    }

    return [...grouped.entries()].map(([name, items]) => {
      const played = items.filter((match) => match.goals_for !== null && match.goals_against !== null);
      const upcoming = items.filter((match) => new Date(match.match_date).getTime() >= now && (match.goals_for === null || match.goals_against === null));
      const wins = played.filter((match) => (match.goals_for ?? 0) > (match.goals_against ?? 0)).length;
      const draws = played.filter((match) => match.goals_for === match.goals_against).length;
      const losses = played.length - wins - draws;
      const goalsFor = played.reduce((sum, match) => sum + (match.goals_for ?? 0), 0);
      const goalsAgainst = played.reduce((sum, match) => sum + (match.goals_against ?? 0), 0);
      return {
        name,
        items: items.slice().sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()),
        played: played.length,
        upcoming: upcoming.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        points: wins * 3 + draws,
        goalDifference: goalsFor - goalsAgainst,
      };
    }).sort((a, b) => b.played - a.played || a.name.localeCompare(b.name, "pt-BR"));
  }, [matches, now]);

  const totalPlayed = competitions.reduce((sum, item) => sum + item.played, 0);
  const totalUpcoming = competitions.reduce((sum, item) => sum + item.upcoming, 0);

  return (
    <AppShell>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(ellipse_at_90%_0%,rgba(220,38,38,.24),transparent_40%),linear-gradient(125deg,#090b0f,#17191e_65%,#310e13)] p-6 shadow-elevated sm:p-8">
          <Badge className="border-red-300/20 bg-red-500/15 text-red-200">BRABO • COMPETIÇÕES</Badge>
          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-red-300">Temporada e desempenho</p>
              <h1 className="mt-2 font-display text-5xl leading-none text-white sm:text-6xl">CENTRAL DE COMPETIÇÕES</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/60">Acompanhe os torneios cadastrados, o calendário e o desempenho do Brabo em cada competição.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-56">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="font-display text-3xl text-white">{competitions.length}</p><p className="text-[9px] font-bold uppercase tracking-wider text-white/45">Competições</p></div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="font-display text-3xl text-white">{totalUpcoming}</p><p className="text-[9px] font-bold uppercase tracking-wider text-white/45">Jogos futuros</p></div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card className="surface-panel"><CardContent className="p-4"><Trophy className="h-5 w-5 text-primary" /><p className="mt-3 font-display text-3xl">{totalPlayed}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Jogos finalizados</p></CardContent></Card>
          <Card className="surface-panel"><CardContent className="p-4"><CalendarDays className="h-5 w-5 text-primary" /><p className="mt-3 font-display text-3xl">{totalUpcoming}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Próximos jogos</p></CardContent></Card>
          <Card className="surface-panel"><CardContent className="p-4"><Goal className="h-5 w-5 text-primary" /><p className="mt-3 font-display text-3xl">{competitions.reduce((sum, item) => sum + item.goalsFor, 0)}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gols marcados</p></CardContent></Card>
          <Card className="surface-panel"><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-primary" /><p className="mt-3 font-display text-3xl">{competitions.reduce((sum, item) => sum + item.points, 0)}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pontos conquistados*</p></CardContent></Card>
        </section>

        {isLoading ? <Card className="surface-panel"><CardContent className="p-8 text-center text-sm text-muted-foreground">Carregando competições...</CardContent></Card> : isError ? <Card className="surface-panel"><CardContent className="p-8 text-center text-sm text-destructive">Não foi possível carregar os jogos. Tente novamente.</CardContent></Card> : competitions.length === 0 ? (
          <Card className="surface-panel"><CardContent className="flex flex-col items-center p-10 text-center"><Trophy className="h-9 w-9 text-muted-foreground" /><h2 className="mt-3 font-display text-2xl">Nenhuma competição cadastrada</h2><p className="mt-1 max-w-md text-sm text-muted-foreground">Cadastre jogos e informe o nome da competição para montar o histórico automaticamente.</p></CardContent></Card>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {competitions.map((competition) => (
              <Card key={competition.name} className="surface-panel overflow-hidden">
                <CardHeader className="border-b border-white/[.06] pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-[9px] font-black uppercase tracking-[.2em] text-primary">Competição registrada</p><CardTitle className="mt-1 font-display text-2xl">{competition.name}</CardTitle></div>
                    <Badge variant="outline" className="border-primary/30 text-primary">{competition.played} jogos</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-emerald-500/10 p-3 text-center"><p className="font-display text-2xl text-emerald-400">{competition.wins}</p><p className="text-[9px] font-bold uppercase text-muted-foreground">Vitórias</p></div>
                    <div className="rounded-lg bg-amber-500/10 p-3 text-center"><p className="font-display text-2xl text-amber-400">{competition.draws}</p><p className="text-[9px] font-bold uppercase text-muted-foreground">Empates</p></div>
                    <div className="rounded-lg bg-red-500/10 p-3 text-center"><p className="font-display text-2xl text-red-400">{competition.losses}</p><p className="text-[9px] font-bold uppercase text-muted-foreground">Derrotas</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-y border-white/[.06] py-3 text-center">
                    <div><p className="font-bold">{competition.goalsFor}</p><p className="text-[9px] uppercase text-muted-foreground">Gols pró</p></div>
                    <div><p className="font-bold">{competition.goalsAgainst}</p><p className="text-[9px] uppercase text-muted-foreground">Gols contra</p></div>
                    <div><p className="font-bold">{competition.goalDifference > 0 ? "+" : ""}{competition.goalDifference}</p><p className="text-[9px] uppercase text-muted-foreground">Saldo</p></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> {competition.points} pontos em resultados</span><span>{competition.upcoming} por jogar</span></div>
                  <div className="space-y-2">
                    {competition.items.slice(0, 5).map((match) => {
                      const played = match.goals_for !== null && match.goals_against !== null;
                      return <div key={match.id} className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.02] p-3">
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Brabo E.C. <span className="text-primary">vs</span> {match.opponent}</p><p className="text-[10px] text-muted-foreground">{formatDate(match.match_date)} · {match.home ? "Casa" : "Fora"}</p></div>
                        {played ? <span className="font-display text-xl">{match.goals_for}–{match.goals_against}</span> : <Badge variant="outline">Agendado</Badge>}
                      </div>;
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
        <p className="text-[10px] leading-5 text-muted-foreground">* Pontos calculados apenas pelos resultados do Brabo (3 por vitória e 1 por empate). Esta visão não representa uma classificação oficial do campeonato, pois depende do cadastro dos resultados das demais equipes.</p>
      </div>
    </AppShell>
  );
}
