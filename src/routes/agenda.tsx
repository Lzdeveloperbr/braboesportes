import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, Dumbbell, MapPin, Trophy } from "lucide-react";

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

  const now = Date.now();
  const eventos: Evento[] = [
    ...trainings.map((t) => ({ kind: "treino" as const, date: t.training_date, training: t })),
    ...matches.map((m) => ({ kind: "jogo" as const, date: m.match_date, match: m })),
  ];

  const lista = eventos
    .filter((e) =>
      aba === "proximos" ? new Date(e.date).getTime() >= now : new Date(e.date).getTime() < now,
    )
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
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Agenda</h1>
          <p className="text-sm text-muted-foreground">Treinos, jogos e campeonatos do clube</p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={aba === "proximos" ? "default" : "outline"}
            onClick={() => setAba("proximos")}
          >
            Próximos
          </Button>
          <Button
            size="sm"
            variant={aba === "anteriores" ? "default" : "outline"}
            onClick={() => setAba("anteriores")}
          >
            Anteriores
          </Button>
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
            <section key={mes} className="space-y-3">
              <h2 className="font-display text-xl capitalize tracking-wide text-muted-foreground">
                {mes}
              </h2>
              {itens.map((e) =>
                e.kind === "treino" ? (
                  <Card
                    key={`t-${e.training.id}`}
                    className="border-border/60 bg-card/80 transition-shadow hover:shadow-elevated"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                          <Dumbbell className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{e.training.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(e.training.training_date)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="secondary">{e.training.training_type}</Badge>
                            <Badge variant="outline">{e.training.categoria}</Badge>
                            {e.training.location && (
                              <Badge variant="outline" className="gap-1">
                                <MapPin className="h-3 w-3" /> {e.training.location}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <AttendanceControls training={e.training} />
                    </CardContent>
                  </Card>
                ) : (
                  <Card
                    key={`m-${e.match.id}`}
                    className="border-border/60 bg-card/80 transition-shadow hover:shadow-elevated"
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Trophy className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          Brabo E.C. <span className="text-muted-foreground">x</span>{" "}
                          {e.match.opponent}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(e.match.match_date)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{e.match.competition ?? "Amistoso"}</Badge>
                          <Badge variant="outline">
                            {e.match.home ? "Mando nosso" : "Fora de casa"}
                          </Badge>
                          {e.match.venue && (
                            <Badge variant="outline" className="gap-1">
                              <MapPin className="h-3 w-3" /> {e.match.venue}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {e.match.goals_for !== null && e.match.goals_against !== null && (
                        <span className="font-display text-2xl">
                          {e.match.goals_for} - {e.match.goals_against}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ),
              )}
            </section>
          ))
        )}

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-4 w-4" /> Confirme sua presença nos treinos direto por aqui.
        </p>
      </div>
    </AppShell>
  );
}
