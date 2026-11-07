import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, Dumbbell, MapPin, Trophy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { AppShell } from "@/components/AppShell";
import { AttendanceControls } from "@/components/AttendanceControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDate,
  matchesQuery,
  trainingsQuery,
  type Match,
  type Training,
} from "@/lib/club";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Calendário do Brabo Esporte Clube com treinos, jogos e confirmação de presença.",
      },
      { property: "og:title", content: "Agenda | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Todos os treinos e partidas do clube em um calendário único.",
      },
    ],
  }),
  component: Agenda,
});

type Evento =
  | { kind: "treino"; date: string; training: Training }
  | { kind: "jogo"; date: string; match: Match };

function Agenda() {
  const { data: trainings = [], isLoading: lt } = useQuery(trainingsQuery);
  const { data: matches = [], isLoading: lm } = useQuery(matchesQuery);
  const [aba, setAba] = useState<"proximos" | "anteriores">("proximos");
  const [tipo, setTipo] = useState<"todos" | "treino" | "jogo">("todos");

  const now = Date.now();
  const eventos: Evento[] = [
    ...trainings.map((t) => ({ kind: "treino" as const, date: t.training_date, training: t })),
    ...matches.map((m) => ({ kind: "jogo" as const, date: m.match_date, match: m })),
  ];

  const lista = eventos
    .filter((e) =>
      aba === "proximos" ? new Date(e.date).getTime() >= now : new Date(e.date).getTime() < now,
    )
    .filter((e) => tipo === "todos" || e.kind === tipo)
    .sort((a, b) =>
      aba === "proximos"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

  const grupos = new Map<string, Evento[]>();
  for (const e of lista) {
    const key = new Date(e.date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    grupos.set(key, [...(grupos.get(key) ?? []), e]);
  }

  return (
    <AppShell>
      <div className="space-y-8 animate-stagger">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl tracking-tight lg:text-5xl">Agenda do Clube</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground/80">
              Treinos, confrontos e eventos oficiais
            </p>
          </div>
          <div className="flex gap-2 bg-card/40 p-1 rounded-full border border-border/40">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAba("proximos")}
              className={cn(
                "rounded-full px-6 transition-all",
                aba === "proximos" ? "bg-primary text-white shadow-glow" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Próximos
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAba("anteriores")}
              className={cn(
                "rounded-full px-6 transition-all",
                aba === "anteriores" ? "bg-primary text-white shadow-glow" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Anteriores
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold text-muted-foreground">Exibir:</span>
          {([
            ["todos", "Todos"],
            ["treino", "Treinos"],
            ["jogo", "Jogos"],
          ] as const).map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={tipo === value ? "default" : "outline"}
              onClick={() => setTipo(value)}
              className="rounded-full px-4"
            >
              {label}
            </Button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{lista.length} {lista.length === 1 ? "evento" : "eventos"}</span>
        </div>

        {lt || lm ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-border/50 bg-card/60" />
            ))}
          </div>
        ) : lista.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/50">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Nenhum evento {aba === "proximos" ? "agendado" : "anterior"}.
            </CardContent>
          </Card>
        ) : (
          [...grupos.entries()].map(([mes, itens]) => (
            <section key={mes} className="space-y-4">
              <h2 className="font-display text-xl capitalize tracking-widest text-primary/80 pl-2">
                {mes}
              </h2>
              <div className="grid gap-4">
                {itens.map((e) =>
                  e.kind === "treino" ? (
                    <Card
                      key={`t-${e.training.id}`}
                      className="group overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:shadow-soft"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex items-center gap-4 p-5 flex-1">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform group-hover:scale-110">
                              <Dumbbell className="h-6 w-6" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold tracking-tight text-foreground/90">{e.training.title}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                {formatDate(e.training.training_date)}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/20 text-[9px] font-bold uppercase tracking-wider">{e.training.training_type}</Badge>
                                <Badge variant="outline" className="border-border/60 text-muted-foreground/80 text-[9px] font-bold uppercase tracking-wider">{e.training.categoria}</Badge>
                                {e.training.location && (
                                  <Badge variant="outline" className="gap-1 border-border/60 text-muted-foreground/80 text-[9px] font-bold uppercase tracking-wider">
                                    <MapPin className="h-3 w-3" /> {e.training.location}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="bg-secondary/10 p-5 sm:w-64 border-t sm:border-t-0 sm:border-l border-border/40">
                             <AttendanceControls training={e.training} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card
                      key={`m-${e.match.id}`}
                      className="group overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-soft"
                    >
                      <CardContent className="flex items-center gap-4 p-5">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                          <Trophy className="h-6 w-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold tracking-tight text-foreground/90">
                            Brabo E.C. <span className="text-primary mx-1">vs</span> {e.match.opponent}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            {formatDate(e.match.match_date)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 text-[9px] font-bold uppercase tracking-wider">{e.match.competition ?? "Amistoso"}</Badge>
                            <Badge variant="outline" className="border-border/60 text-muted-foreground/80 text-[9px] font-bold uppercase tracking-wider">
                              {e.match.home ? "Mando de Campo" : "Visitante"}
                            </Badge>
                            {e.match.venue && (
                              <Badge variant="outline" className="gap-1 border-border/60 text-muted-foreground/80 text-[9px] font-bold uppercase tracking-wider">
                                <MapPin className="h-3 w-3" /> {e.match.venue}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {e.match.goals_for !== null && e.match.goals_against !== null ? (
                          <div className="flex flex-col items-end">
                            <span className="font-display text-4xl text-accent shadow-glow">
                              {e.match.goals_for} - {e.match.goals_against}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/30 leading-none">Placar Final</span>
                          </div>
                        ) : (
                           <div className="hidden sm:block">
                             <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5 text-[9px] font-bold uppercase tracking-widest">Detalhes</Button>
                           </div>
                        )}
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </section>
          ))
        )}

        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-[10px] font-bold uppercase tracking-widest text-primary/80">
          <CheckCircle2 className="h-4 w-4" /> 
          Lembrete: Mantenha sua confirmação de presença atualizada para facilitar o planejamento técnico.
        </div>
      </div>
    </AppShell>
  );
}
