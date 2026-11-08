import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trophy, MapPin, Calendar, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const { isAdmin } = useAuth();
  const { data: matches = [] } = useQuery(matchesQuery);
  const now = Date.now();
  const upcoming = matches
    .filter((m) => m.goals_for === null && m.goals_against === null && new Date(m.match_date).getTime() > now)
    .slice()
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
  const past = matches
    .filter((m) => m.goals_for !== null && m.goals_against !== null)
    .slice()
    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());

  return (
    <AppShell>
      <div className="space-y-8 animate-stagger">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl tracking-tight lg:text-5xl">Confrontos</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground/80">
              Histórico de batalhas e próximos desafios
            </p>
          </div>
          {isAdmin && <NewMatchDialog />}
        </div>

        <Tabs defaultValue="proximos" className="w-full">
          <TabsList className="bg-card/40 border border-border/40 p-1 rounded-full w-fit mb-6">
            <TabsTrigger value="proximos" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow">Próximos</TabsTrigger>
            <TabsTrigger value="resultados" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow">Resultados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="proximos" className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 mt-0">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
            {upcoming.length === 0 && (
              <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-border/40 bg-card/20">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground/40 italic">Nenhum jogo agendado para o futuro próximo.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resultados" className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 mt-0">
            {past.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
            {past.length === 0 && (
              <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-border/40 bg-card/20">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground/40 italic">O clube ainda não registrou resultados esta temporada.</p>
              </div>
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
    <Card className="group overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-soft">
      <CardContent className="flex items-center gap-5 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
           <Trophy className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl tracking-tight text-foreground/90">
            Brabo E.C. <span className="text-primary mx-1">vs</span> {match.opponent}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
             <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <Calendar className="h-3 w-3" /> {formatDate(match.match_date)}
             </p>
             <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <MapPin className="h-3 w-3" /> {match.venue ?? "Indefinido"}
             </p>
             <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <Layout className="h-3 w-3" /> {match.formation}
             </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 text-[9px] font-bold tracking-wider uppercase">{match.competition ?? "Amistoso"}</Badge>
            <Badge variant="outline" className="border-border/60 text-muted-foreground/80 text-[9px] font-bold tracking-wider uppercase">{match.home ? "Mando de Campo" : "Visitante"}</Badge>
            <Badge variant="outline" className="border-border/60 text-muted-foreground/80 text-[9px] font-bold tracking-wider uppercase">{match.categoria}</Badge>
          </div>
        </div>
        {finished ? (
          <div className="flex flex-col items-end">
            <span
              className={cn(
                "font-display text-4xl shadow-glow",
                win ? "text-accent" : draw ? "text-muted-foreground/60" : "text-primary"
              )}
            >
              {match.goals_for}-{match.goals_against}
            </span>
            <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/30 leading-none">
              {win ? "Vitória" : draw ? "Empate" : "Derrota"}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1", new Date(match.match_date).getTime() > Date.now() ? "bg-accent/10 text-accent border-accent/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20")}>{new Date(match.match_date).getTime() > Date.now() ? "Próximo" : "Pendente"}</Badge>
          </div>
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
