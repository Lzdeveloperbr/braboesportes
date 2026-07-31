import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIAS } from "@/lib/brand";
import { age, overall, playersQuery, type Player } from "@/lib/club";

export const Route = createFileRoute("/elenco")({
  head: () => ({
    meta: [
      { title: "Elenco | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Elenco completo do Brabo Esporte Clube com posições, atributos e estatísticas.",
      },
      { property: "og:title", content: "Elenco | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Atletas, atributos técnicos e números de cada jogador do Brabo E.C.",
      },
    ],
  }),
  component: Elenco,
});

const FILTROS = ["Todas", ...CATEGORIAS] as const;

function Elenco() {
  const { isPresident } = useAuth();
  const { data: players = [] } = useQuery(playersQuery);
  const [categoria, setCategoria] = useState<string>("Todas");
  const [selected, setSelected] = useState<Player | null>(null);

  const list = players.filter((p) => categoria === "Todas" || p.categoria === categoria);

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Elenco</h1>
            <p className="text-sm text-muted-foreground">{list.length} atletas</p>
          </div>
          {isPresident && <NewPlayerDialog />}
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTROS.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={categoria === c ? "default" : "outline"}
              onClick={() => setCategoria(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <button key={p.id} className="text-left" onClick={() => setSelected(p)}>
              <Card className="h-full border-border/60 bg-card/80 transition-colors hover:border-primary/60">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-display text-2xl text-primary">
                    {p.shirt_number ?? "-"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.position} · {p.categoria}
                      {age(p.birth_date) ? ` · ${age(p.birth_date)} anos` : ""}
                    </p>
                  </div>
                  <span className="font-display text-2xl text-accent">{overall(p)}</span>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <PlayerDialog player={selected} onClose={() => setSelected(null)} />
    </AppShell>
  );
}

function PlayerDialog({ player, onClose }: { player: Player | null; onClose: () => void }) {
  if (!player) return null;
  const data = [
    { attr: "Velocidade", v: player.speed },
    { attr: "Técnica", v: player.technique },
    { attr: "Finalização", v: player.finishing },
    { attr: "Passe", v: player.passing },
    { attr: "Defesa", v: player.defending },
    { attr: "Físico", v: player.physical },
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{player.full_name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{player.position}</Badge>
          <Badge variant="outline">Camisa {player.shirt_number ?? "-"}</Badge>
          <Badge variant="outline">{player.categoria}</Badge>
          <Badge variant="outline">Pé {player.dominant_foot}</Badge>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="attr"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <Radar
                dataKey="v"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Jogos", player.matches_played],
            ["Gols", player.goals],
            ["Assist.", player.assists],
            ["Amarelos", player.yellow_cards],
            ["Vermelhos", player.red_cards],
            ["Geral", overall(player)],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-lg border border-border/50 py-2">
              <p className="font-display text-2xl">{value as number}</p>
              <p className="text-xs text-muted-foreground">{label as string}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <p>Idade: {age(player.birth_date) ?? "-"}</p>
          <p>Altura: {player.height_cm ? `${player.height_cm} cm` : "-"}</p>
          <p>Peso: {player.weight_kg ? `${player.weight_kg} kg` : "-"}</p>
          <p>Telefone: {player.phone ?? "-"}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewPlayerDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    position: "Meia",
    shirt_number: "",
    categoria: "Adulto",
    birth_date: "",
    dominant_foot: "Direito",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("players").insert({
        full_name: form.full_name,
        position: form.position,
        shirt_number: form.shirt_number ? Number(form.shirt_number) : null,
        categoria: form.categoria as Player["categoria"],
        birth_date: form.birth_date || null,
        dominant_foot: form.dominant_foot,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Atleta cadastrado!");
      qc.invalidateQueries({ queryKey: ["players"] });
      setOpen(false);
      setForm({ ...form, full_name: "", shirt_number: "", birth_date: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Novo atleta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Cadastrar atleta</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-1">
            <Label>Nome completo</Label>
            <Input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Posição</Label>
              <Select
                value={form.position}
                onValueChange={(v) => setForm({ ...form, position: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Camisa</Label>
              <Input
                type="number"
                value={form.shirt_number}
                onChange={(e) => setForm({ ...form, shirt_number: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => setForm({ ...form, categoria: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Nascimento</Label>
              <Input
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            Salvar atleta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
