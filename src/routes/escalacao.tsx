import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { TacticalPitch } from "@/components/TacticalPitch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  FORMATIONS,
  formatDate,
  lineupsQuery,
  matchesQuery,
  overall,
  playersQuery,
  type Player,
} from "@/lib/club";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/escalacao")({
  head: () => ({
    meta: [
      { title: "Escalação | Brabo Esporte Clube" },
      {
        name: "description",
        content:
          "Monte a escalação do Brabo Esporte Clube por partida: titulares, reservas e formação tática.",
      },
      { property: "og:title", content: "Escalação | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Time titular, banco de reservas e formação tática de cada jogo do Brabo E.C.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Escalacao,
});

function Escalacao() {
  const { isStaff } = useAuth();
  const qc = useQueryClient();
  const { data: matches = [] } = useQuery(matchesQuery);
  const { data: players = [] } = useQuery(playersQuery);
  const { data: lineups = [] } = useQuery(lineupsQuery);

  const now = Date.now();
  const ordered = useMemo(
    () =>
      matches
        .slice()
        .sort(
          (a, b) =>
            Math.abs(new Date(a.match_date).getTime() - now) -
            Math.abs(new Date(b.match_date).getTime() - now),
        ),
    [matches, now],
  );
  const [matchId, setMatchId] = useState<string>("");
  const current = ordered.find((m) => m.id === matchId) ?? ordered[0];

  const rows = lineups.filter((l) => l.match_id === current?.id);
  const starters = rows.filter((l) => l.slot === "Titular");
  const bench = rows.filter((l) => l.slot === "Reserva");
  const byId = new Map(players.map((p) => [p.id, p]));

  const setSlot = useMutation({
    mutationFn: async ({ player, slot }: { player: Player; slot: string | null }) => {
      if (!current) return;
      if (slot === null) {
        const { error } = await supabase
          .from("match_lineups")
          .delete()
          .eq("match_id", current.id)
          .eq("player_id", player.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("match_lineups")
        .upsert(
          { match_id: current.id, player_id: player.id, slot },
          { onConflict: "match_id,player_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["match_lineups"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const setFormation = useMutation({
    mutationFn: async (formation: string) => {
      if (!current) return;
      const { error } = await supabase
        .from("matches")
        .update({ formation })
        .eq("id", current.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Formação atualizada!");
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const starterPlayers = starters
    .map((l) => byId.get(l.player_id))
    .filter((p): p is Player => Boolean(p));


  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Escalação</h1>
          <p className="text-sm text-muted-foreground">
            {isStaff ? "Monte o time para cada partida" : "Time escalado pelo clube"}
          </p>
        </div>

        <Select value={current?.id ?? ""} onValueChange={setMatchId}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Escolha a partida" />
          </SelectTrigger>
          <SelectContent>
            {ordered.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.opponent} · {formatDate(m.match_date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!current && <p className="text-sm text-muted-foreground">Nenhuma partida cadastrada.</p>}

        {current && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="overflow-hidden border-border/60 bg-card/80 shadow-elevated">
              <div className="surface-primary px-5 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
                Brabo E.C. x {current.opponent} · {current.formation}
              </div>
              <CardContent className="p-4">
                <div className="mb-4 space-y-3">
                  {isStaff && (
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <p className="min-w-0 truncate text-xs uppercase tracking-wide text-muted-foreground">
                        Formação tática
                      </p>
                      <Select
                        value={current.formation}
                        onValueChange={(v) => setFormation.mutate(v)}
                      >
                        <SelectTrigger className="w-32 shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(FORMATIONS).map((f) => (
                            <SelectItem key={f.label} value={f.label}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <TacticalPitch formation={current.formation} starters={starterPlayers} />
                </div>

                <div className="rounded-xl border border-border/60 bg-success/10 p-3">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Titulares ({starters.length}/11)
                  </p>
                  <div className="space-y-2">
                    {starters.map((l) => {
                      const p = byId.get(l.player_id);
                      if (!p) return null;
                      return (
                        <div
                          key={l.id}
                          className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/60 px-3 py-2"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 font-display text-lg text-primary">
                            {p.shirt_number ?? "-"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{p.full_name}</p>
                            <p className="text-xs text-muted-foreground">{p.position}</p>
                          </div>
                          {isStaff && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSlot.mutate({ player: p, slot: null })}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                      );
                    })}
                    {starters.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum titular definido.</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Banco ({bench.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {bench.map((l) => {
                      const p = byId.get(l.player_id);
                      if (!p) return null;
                      return (
                        <Badge key={l.id} variant="outline">
                          {p.shirt_number ?? "-"} {p.full_name}
                        </Badge>
                      );
                    })}
                    {bench.length === 0 && (
                      <p className="text-sm text-muted-foreground">Banco vazio.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-xl">Elenco disponível</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {players.map((p) => {
                  const row = rows.find((l) => l.player_id === p.id);
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2",
                        row?.slot === "Titular" && "border-primary/50 bg-primary/10",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.position} · {p.categoria} · geral {overall(p)}
                        </p>
                      </div>
                      {isStaff ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={row?.slot === "Titular" ? "default" : "outline"}
                            onClick={() => setSlot.mutate({ player: p, slot: "Titular" })}
                          >
                            Titular
                          </Button>
                          <Button
                            size="sm"
                            variant={row?.slot === "Reserva" ? "default" : "outline"}
                            onClick={() => setSlot.mutate({ player: p, slot: "Reserva" })}
                          >
                            Banco
                          </Button>
                        </div>
                      ) : (
                        row && <Badge variant="outline">{row.slot}</Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
