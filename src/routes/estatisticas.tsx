import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { formatDate, matchStatsQuery, matchesQuery, playersQuery } from "@/lib/club";

export const Route = createFileRoute("/estatisticas")({
  head: () => ({
    meta: [
      { title: "Estatísticas | Brabo Esporte Clube" },
      {
        name: "description",
        content:
          "Estatísticas detalhadas de atletas do Brabo E.C.: gols, assistências, minutos, cartões e notas por partida.",
      },
      { property: "og:title", content: "Estatísticas | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Gols, assistências, minutos, cartões e notas por partida do Brabo E.C.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Estatisticas,
});

function Estatisticas() {
  const { isStaff } = useAuth();
  const { data: players = [] } = useQuery(playersQuery);
  const { data: stats = [] } = useQuery(matchStatsQuery);
  const { data: matches = [] } = useQuery(matchesQuery);

  const rows = useMemo(() => {
    return players
      .map((p) => {
        const mine = stats.filter((s) => s.player_id === p.id);
        const games = mine.length;
        const sum = (k: keyof (typeof mine)[number]) =>
          mine.reduce((acc, s) => acc + Number(s[k] ?? 0), 0);
        return {
          id: p.id,
          name: p.full_name,
          position: p.position,
          games,
          minutes: sum("minutes"),
          goals: sum("goals"),
          assists: sum("assists"),
          shots: sum("shots"),
          tackles: sum("tackles"),
          yellow: sum("yellow_cards"),
          red: sum("red_cards"),
          mvp: mine.filter((s) => s.mvp).length,
          rating: games ? Number((sum("rating") / games).toFixed(1)) : 0,
        };
      })
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists);
  }, [players, stats]);

  const scorers = rows.filter((r) => r.goals > 0).slice(0, 8);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Estatísticas</h1>
            <p className="text-sm text-muted-foreground">Desempenho individual por partida</p>
          </div>
          {isStaff && <StatDialog />}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/60 bg-card/80 shadow-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-xl tracking-wide">Artilharia</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {scorers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum gol registrado ainda.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scorers} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      interval={0}
                      angle={-20}
                      height={50}
                      textAnchor="end"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        color: "var(--color-popover-foreground)",
                      }}
                    />
                    <Bar dataKey="goals" name="Gols" radius={[6, 6, 0, 0]}>
                      {scorers.map((s) => (
                        <Cell key={s.id} fill="var(--color-primary)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 shadow-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-xl tracking-wide">
                Melhores em campo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rows
                .filter((r) => r.games > 0)
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 6)
                .map((r, i) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2"
                  >
                    <span className="font-display text-lg text-accent">{i + 1}º</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.games} jogos · {r.minutes}&apos; em campo
                      </p>
                    </div>
                    {r.mvp > 0 && (
                      <Badge variant="outline" className="border-accent/50 text-accent">
                        <Trophy className="mr-1 h-3 w-3" /> {r.mvp}
                      </Badge>
                    )}
                    <span className="font-display text-xl">{r.rating.toFixed(1)}</span>
                  </div>
                ))}
              {rows.every((r) => r.games === 0) && (
                <p className="text-sm text-muted-foreground">
                  Registre as estatísticas das partidas para ver o ranking.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 bg-card/80 shadow-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-xl tracking-wide">Tabela geral</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead className="text-center">J</TableHead>
                  <TableHead className="text-center">Min</TableHead>
                  <TableHead className="text-center">G</TableHead>
                  <TableHead className="text-center">A</TableHead>
                  <TableHead className="text-center">Fin</TableHead>
                  <TableHead className="text-center">Des</TableHead>
                  <TableHead className="text-center">CA</TableHead>
                  <TableHead className="text-center">CV</TableHead>
                  <TableHead className="text-center">Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {r.name}
                      <span className="ml-2 text-xs text-muted-foreground">{r.position}</span>
                    </TableCell>
                    <TableCell className="text-center">{r.games}</TableCell>
                    <TableCell className="text-center">{r.minutes}</TableCell>
                    <TableCell className="text-center font-semibold text-primary">
                      {r.goals}
                    </TableCell>
                    <TableCell className="text-center">{r.assists}</TableCell>
                    <TableCell className="text-center">{r.shots}</TableCell>
                    <TableCell className="text-center">{r.tackles}</TableCell>
                    <TableCell className="text-center">{r.yellow}</TableCell>
                    <TableCell className="text-center">{r.red}</TableCell>
                    <TableCell className="text-center">{r.rating.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                      Cadastre atletas para acompanhar as estatísticas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {matches.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Última partida registrada: {formatDate(matches[matches.length - 1].match_date)}
          </p>
        )}
      </div>
    </AppShell>
  );
}

function StatDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: players = [] } = useQuery(playersQuery);
  const { data: matches = [] } = useQuery(matchesQuery);
  const [form, setForm] = useState({
    match_id: "",
    player_id: "",
    minutes: 0,
    goals: 0,
    assists: 0,
    shots: 0,
    passes: 0,
    tackles: 0,
    saves: 0,
    yellow_cards: 0,
    red_cards: 0,
    rating: 6,
    mvp: false,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("match_stats")
        .upsert(form, { onConflict: "match_id,player_id" });
      if (error) throw error;
      await logAudit("registrou_estatistica", "match_stats", form.player_id, {
        match_id: form.match_id,
      });
    },
    onSuccess: () => {
      toast.success("Estatística registrada!");
      qc.invalidateQueries({ queryKey: ["match_stats"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const num = (k: keyof typeof form, label: string) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        step={k === "rating" ? "0.1" : "1"}
        value={String(form[k])}
        onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Registrar súmula
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Estatística da partida</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.match_id || !form.player_id) {
              toast.error("Selecione a partida e o atleta.");
              return;
            }
            mutation.mutate();
          }}
        >
          <div className="space-y-1">
            <Label>Partida</Label>
            <Select
              value={form.match_id}
              onValueChange={(v) => setForm({ ...form, match_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {matches.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.opponent} · {formatDate(m.match_date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Atleta</Label>
            <Select
              value={form.player_id}
              onValueChange={(v) => setForm({ ...form, player_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {players.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.shirt_number ? `#${p.shirt_number} ` : ""}
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {num("minutes", "Minutos")}
            {num("goals", "Gols")}
            {num("assists", "Assist.")}
            {num("shots", "Finaliz.")}
            {num("passes", "Passes")}
            {num("tackles", "Desarmes")}
            {num("saves", "Defesas")}
            {num("yellow_cards", "Amarelos")}
            {num("red_cards", "Vermelhos")}
            {num("rating", "Nota")}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
            <Label htmlFor="mvp">Craque da partida</Label>
            <Switch
              id="mvp"
              checked={form.mvp}
              onCheckedChange={(v) => setForm({ ...form, mvp: v })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            Salvar estatística
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
