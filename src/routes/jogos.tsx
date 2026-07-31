import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, matchesQuery, type Match } from "@/lib/club";

export const Route = createFileRoute("/jogos")({
  head: () => ({
    meta: [
      { title: "Jogos | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Calendário de jogos, resultados e formações do Brabo Esporte Clube.",
      },
      { property: "og:title", content: "Jogos | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Próximas partidas, placares e escalação tática do Brabo E.C.",
      },
    ],
  }),
  component: Jogos,
});

function Jogos() {
  const { isPresident } = useAuth();
  const { data: matches = [] } = useQuery(matchesQuery);
  const now = Date.now();
  const upcoming = matches.filter((m) => new Date(m.match_date).getTime() > now);
  const past = matches
    .filter((m) => new Date(m.match_date).getTime() <= now)
    .slice()
    .reverse();

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Jogos</h1>
            <p className="text-sm text-muted-foreground">Calendário e resultados</p>
          </div>
          {isPresident && <NewMatchDialog />}
        </div>

        <Tabs defaultValue="proximos">
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="proximos">Próximos</TabsTrigger>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
          </TabsList>
          <TabsContent value="proximos" className="space-y-3 pt-4">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum jogo agendado.</p>
            )}
          </TabsContent>
          <TabsContent value="resultados" className="space-y-3 pt-4">
            {past.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
            {past.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum jogo disputado.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function MatchCard({ match }: { match: Match }) {
  const finished = match.goals_for !== null && match.goals_against !== null;
  const win = (match.goals_for ?? 0) > (match.goals_against ?? 0);
  const draw = match.goals_for === match.goals_against;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl">
            Brabo E.C. <span className="text-muted-foreground">x</span> {match.opponent}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(match.match_date)} · {match.venue ?? "Local a definir"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{match.competition ?? "Amistoso"}</Badge>
            <Badge variant="outline">{match.home ? "Casa" : "Fora"}</Badge>
            <Badge variant="outline">{match.formation}</Badge>
            <Badge variant="outline">{match.categoria}</Badge>
          </div>
        </div>
        {finished ? (
          <span
            className={
              "font-display text-3xl " +
              (win ? "text-success" : draw ? "text-accent" : "text-primary")
            }
          >
            {match.goals_for}-{match.goals_against}
          </span>
        ) : (
          <Badge className="surface-primary text-primary-foreground">Agendado</Badge>
        )}
      </CardContent>
    </Card>
  );
}

function NewMatchDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    opponent: "",
    competition: "",
    match_date: "",
    venue: "",
    home: "true",
    formation: "4-3-3",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("matches").insert({
        opponent: form.opponent,
        competition: form.competition || null,
        match_date: new Date(form.match_date).toISOString(),
        venue: form.venue || null,
        home: form.home === "true",
        formation: form.formation,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Jogo cadastrado!");
      qc.invalidateQueries({ queryKey: ["matches"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Novo jogo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Cadastrar jogo</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-1">
            <Label>Adversário</Label>
            <Input
              required
              value={form.opponent}
              onChange={(e) => setForm({ ...form, opponent: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Campeonato</Label>
            <Input
              value={form.competition}
              onChange={(e) => setForm({ ...form, competition: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Data e hora</Label>
              <Input
                type="datetime-local"
                required
                value={form.match_date}
                onChange={(e) => setForm({ ...form, match_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Local</Label>
              <Input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Mando</Label>
              <Select value={form.home} onValueChange={(v) => setForm({ ...form, home: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Casa</SelectItem>
                  <SelectItem value="false">Fora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Formação</Label>
              <Select
                value={form.formation}
                onValueChange={(v) => setForm({ ...form, formation: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            Salvar jogo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
