import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Camera, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { AppShell } from "@/components/AppShell";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  age,
  attendanceQuery,
  formatDay,
  overall,
  playersQuery,
  type Player,
} from "@/lib/club";
import { uploadPhoto } from "@/lib/photos";

export const Route = createFileRoute("/elenco")({
  head: () => ({
    meta: [
      { title: "Elenco | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Elenco completo do Brabo Esporte Clube com fichas, atributos e estatísticas.",
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

const POSICOES = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];
const FILTROS = ["Todas", ...CATEGORIAS] as const;

const EMPTY = {
  full_name: "",
  position: "Meia",
  shirt_number: "",
  categoria: "Adulto",
  birth_date: "",
  dominant_foot: "Direito",
  cpf: "",
  phone: "",
  email: "",
  height_cm: "",
  weight_kg: "",
  joined_on: "",
  status: "ativo",
  photo_url: "" as string | null,
};

type FormState = typeof EMPTY;

function Elenco() {
  const { isPresident } = useAuth();
  const { data: players = [], isLoading } = useQuery(playersQuery);
  const [categoria, setCategoria] = useState<string>("Todas");
  const [busca, setBusca] = useState("");
  const [selected, setSelected] = useState<Player | null>(null);
  const [editing, setEditing] = useState<Player | null | undefined>(undefined);

  const list = players
    .filter((p) => categoria === "Todas" || p.categoria === categoria)
    .filter((p) => p.full_name.toLowerCase().includes(busca.trim().toLowerCase()));

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Elenco</h1>
            <p className="text-sm text-muted-foreground">
              {list.length} {list.length === 1 ? "atleta" : "atletas"}
            </p>
          </div>
          {isPresident && (
            <Button onClick={() => setEditing(null)} className="transition-transform hover:scale-[1.02]">
              <Plus className="mr-1 h-4 w-4" /> Novo atleta
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar atleta..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="sm:max-w-xs"
          />
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
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border border-border/50 bg-card/60" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/50">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Nenhum atleta cadastrado ainda.
              {isPresident && " Use o botão “Novo atleta” para começar."}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <button key={p.id} className="text-left" onClick={() => setSelected(p)}>
                <Card className="h-full border-border/60 bg-card/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-elevated">
                  <CardContent className="flex items-center gap-3 p-4">
                    <PlayerAvatar path={p.photo_url} name={p.full_name} shirt={p.shirt_number} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.position} · {p.categoria}
                        {age(p.birth_date) ? ` · ${age(p.birth_date)} anos` : ""}
                      </p>
                      {p.status === "inativo" && (
                        <Badge variant="outline" className="mt-1 border-muted text-muted-foreground">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <span className="font-display text-2xl text-accent">{overall(p)}</span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      <PlayerDialog
        player={selected}
        onClose={() => setSelected(null)}
        onEdit={(p) => {
          setSelected(null);
          setEditing(p);
        }}
      />
      {editing !== undefined && (
        <PlayerForm player={editing} onClose={() => setEditing(undefined)} />
      )}
    </AppShell>
  );
}

function PlayerDialog({
  player,
  onClose,
  onEdit,
}: {
  player: Player | null;
  onClose: () => void;
  onEdit: (p: Player) => void;
}) {
  const { isPresident } = useAuth();
  const qc = useQueryClient();
  const { data: attendance = [] } = useQuery(attendanceQuery);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("players").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Atleta removido.");
      qc.invalidateQueries({ queryKey: ["players"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!player) return null;

  const rows = attendance.filter((a) => a.player_id === player.id);
  const presentes = rows.filter((a) => a.status === "presente").length;
  const frequencia = rows.length ? Math.round((presentes / rows.length) * 100) : null;

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
          <DialogTitle className="flex items-center gap-3 font-display text-2xl">
            <PlayerAvatar
              path={player.photo_url}
              name={player.full_name}
              shirt={player.shirt_number}
              className="h-14 w-14"
            />
            {player.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{player.position}</Badge>
          <Badge variant="outline">Camisa {player.shirt_number ?? "-"}</Badge>
          <Badge variant="outline">{player.categoria}</Badge>
          <Badge variant="outline">Pé {player.dominant_foot}</Badge>
          <Badge variant={player.status === "ativo" ? "default" : "outline"}>
            {player.status === "ativo" ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="attr"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <Radar dataKey="v" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} />
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
          <p className="truncate">E-mail: {player.email ?? "-"}</p>
          <p>Entrada: {player.joined_on ? formatDay(player.joined_on) : "-"}</p>
          <p>Frequência: {frequencia !== null ? `${frequencia}%` : "-"}</p>
          {isPresident && <p>CPF: {player.cpf ?? "-"}</p>}
        </div>

        {isPresident && (
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => onEdit(player)}>
              <Pencil className="mr-1 h-4 w-4" /> Editar
            </Button>
            <Button
              variant="outline"
              className="text-primary"
              disabled={remove.isPending}
              onClick={() => {
                if (confirm(`Excluir ${player.full_name}?`)) remove.mutate(player.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PlayerForm({ player, onClose }: { player: Player | null; onClose: () => void }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(
    player
      ? {
          full_name: player.full_name,
          position: player.position,
          shirt_number: player.shirt_number?.toString() ?? "",
          categoria: player.categoria,
          birth_date: player.birth_date ?? "",
          dominant_foot: player.dominant_foot,
          cpf: player.cpf ?? "",
          phone: player.phone ?? "",
          email: player.email ?? "",
          height_cm: player.height_cm?.toString() ?? "",
          weight_kg: player.weight_kg?.toString() ?? "",
          joined_on: player.joined_on ?? "",
          status: player.status,
          photo_url: player.photo_url,
        }
      : EMPTY,
  );

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        full_name: form.full_name,
        position: form.position,
        shirt_number: form.shirt_number ? Number(form.shirt_number) : null,
        categoria: form.categoria as Player["categoria"],
        birth_date: form.birth_date || null,
        dominant_foot: form.dominant_foot,
        cpf: form.cpf || null,
        phone: form.phone || null,
        email: form.email || null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        joined_on: form.joined_on || null,
        status: form.status,
        photo_url: form.photo_url || null,
      };
      const { error } = player
        ? await supabase.from("players").update(payload).eq("id", player.id)
        : await supabase.from("players").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(player ? "Atleta atualizado!" : "Atleta cadastrado!");
      qc.invalidateQueries({ queryKey: ["players"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onPickFile(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadPhoto(file, `atletas/${player?.id ?? "novos"}`);
      set({ photo_url: path });
      toast.success("Foto enviada!");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {player ? "Editar atleta" : "Cadastrar atleta"}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="flex items-center gap-3">
            <PlayerAvatar
              path={form.photo_url}
              name={form.full_name || "?"}
              className="h-16 w-16"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="mr-1 h-4 w-4" /> {uploading ? "Enviando..." : "Foto"}
            </Button>
          </div>

          <div className="space-y-1">
            <Label>Nome completo</Label>
            <Input required value={form.full_name} onChange={(e) => set({ full_name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Posição</Label>
              <Select value={form.position} onValueChange={(v) => set({ position: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSICOES.map((p) => (
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
                onChange={(e) => set({ shirt_number: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => set({ categoria: v })}>
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
                onChange={(e) => set({ birth_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Pé dominante</Label>
              <Select value={form.dominant_foot} onValueChange={(v) => set({ dominant_foot: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Direito", "Esquerdo", "Ambidestro"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Situação</Label>
              <Select value={form.status} onValueChange={(v) => set({ status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Altura (cm)</Label>
              <Input
                type="number"
                value={form.height_cm}
                onChange={(e) => set({ height_cm: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                value={form.weight_kg}
                onChange={(e) => set({ weight_kg: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>CPF (opcional)</Label>
              <Input value={form.cpf} onChange={(e) => set({ cpf: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Data de entrada</Label>
              <Input
                type="date"
                value={form.joined_on}
                onChange={(e) => set({ joined_on: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={save.isPending || uploading}>
            {save.isPending ? "Salvando..." : "Salvar atleta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
