import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
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
      <div className="space-y-8 animate-stagger">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl tracking-tight lg:text-5xl">Elenco Oficial</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground/80">
              {list.length} {list.length === 1 ? "Atleta Registrado" : "Atletas Registrados"}
            </p>
          </div>
          {isPresident && (
            <Button onClick={() => setEditing(null)} className="bg-primary hover:bg-primary/90 text-white shadow-glow transition-all active:scale-[0.98]">
              <Plus className="mr-2 h-4 w-4" /> Novo Atleta
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border-border/40 bg-card/40 backdrop-blur-sm sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={categoria === c ? "default" : "outline"}
                onClick={() => setCategoria(c)}
                className={cn(
                  "rounded-full px-4 transition-all",
                  categoria === c ? "shadow-glow" : "border-border/40 bg-card/20 hover:bg-card/40"
                )}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <button key={p.id} className="group text-left" onClick={() => setSelected(p)}>
                <Card className="h-full border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft">
                  <CardContent className="flex items-center gap-4 p-5">
                    <PlayerAvatar 
                      path={p.photo_url} 
                      name={p.full_name} 
                      shirt={p.shirt_number} 
                      className="rounded-xl shadow-sm ring-primary/5 transition-transform group-hover:scale-105"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold tracking-tight text-foreground/90">{p.full_name}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                        {p.position} · {p.categoria}
                        {age(p.birth_date) ? ` · ${age(p.birth_date)} ANOS` : ""}
                      </p>
                      {p.status === "inativo" && (
                        <Badge variant="outline" className="mt-2 border-muted/30 text-muted-foreground/50 text-[9px] uppercase font-bold tracking-tighter">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-display text-3xl text-accent transition-colors group-hover:text-primary">{overall(p)}</span>
                      <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/30 leading-none">Rating</span>
                    </div>
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
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/40 bg-card/90 backdrop-blur-xl p-0">
        <div className="surface-pitch h-32 relative overflow-hidden">
           {/* Abstract decorative element */}
           <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-10" />
           <div className="absolute inset-0 flex items-center justify-between px-8">
              <div className="flex items-center gap-6">
                <PlayerAvatar
                  path={player.photo_url}
                  name={player.full_name}
                  shirt={player.shirt_number}
                  className="h-24 w-24 rounded-2xl ring-4 ring-background shadow-glow"
                />
                <div>
                  <h2 className="font-display text-4xl tracking-tight text-white">{player.full_name}</h2>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 text-[9px] font-bold tracking-widest uppercase">{player.position}</Badge>
                    <Badge variant="outline" className="border-white/20 text-white/80 text-[9px] font-bold tracking-widest uppercase">{player.categoria}</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-5xl text-accent shadow-glow">{overall(player)}</p>
                <p className="text-[9px] font-black uppercase tracking-tighter text-white/40">Geral OVR</p>
              </div>
           </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Análise de Atributos</h3>
              <div className="h-64 rounded-2xl border border-border/40 bg-secondary/5 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data} outerRadius="70%">
                    <PolarGrid stroke="var(--border)" strokeOpacity={0.2} />
                    <PolarAngleAxis
                      dataKey="attr"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 600 }}
                    />
                    <Radar dataKey="v" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Resumo da Temporada</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Partidas", player.matches_played],
                  ["Gols", player.goals],
                  ["Assistências", player.assists],
                  ["Amarelos", player.yellow_cards],
                  ["Vermelhos", player.red_cards],
                  ["Presença", frequencia !== null ? `${frequencia}%` : "-"],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-xl border border-border/40 bg-secondary/10 p-4 text-center transition-all hover:bg-secondary/20">
                    <p className="font-display text-2xl text-foreground">{value as string | number}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{label as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-8 rounded-2xl border border-border/40 bg-secondary/5 p-6 sm:grid-cols-2">
             <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Ficha Biométrica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">Dominância</Label>
                    <p className="text-sm font-bold text-foreground/80">{player.dominant_foot}</p>
                  </div>
                  <div>
                    <Label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">Altura</Label>
                    <p className="text-sm font-bold text-foreground/80">{player.height_cm ? `${player.height_cm} cm` : "-"}</p>
                  </div>
                  <div>
                    <Label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">Peso</Label>
                    <p className="text-sm font-bold text-foreground/80">{player.weight_kg ? `${player.weight_kg} kg` : "-"}</p>
                  </div>
                  <div>
                    <Label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">Idade</Label>
                    <p className="text-sm font-bold text-foreground/80">{age(player.birth_date) ?? "-"}</p>
                  </div>
                </div>
             </div>
             <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Informações de Contato</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <Label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">Telefone</Label>
                    <p className="text-xs font-bold">{player.phone ?? "-"}</p>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <Label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">E-mail</Label>
                    <p className="text-xs font-bold">{player.email ?? "-"}</p>
                  </div>
                  {isPresident && (
                    <div className="flex justify-between items-center">
                      <Label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">CPF</Label>
                      <p className="text-xs font-bold">{player.cpf ?? "-"}</p>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {isPresident && (
            <div className="flex gap-4 pt-4">
              <Button variant="secondary" className="flex-1 bg-secondary/80 hover:bg-secondary text-[10px] font-bold uppercase tracking-widest py-6" onClick={() => onEdit(player)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
              </Button>
              <Button
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/5 text-[10px] font-bold uppercase tracking-widest py-6 px-6"
                disabled={remove.isPending}
                onClick={() => {
                  if (confirm(`Excluir ${player.full_name}?`)) remove.mutate(player.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
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
