import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Camera, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABEL, useAuth } from "@/hooks/useAuth";
import { useMyPlayer } from "@/hooks/useMyPlayer";
import { supabase } from "@/integrations/supabase/client";
import {
  age,
  attendanceQuery,
  formatDate,
  formatDay,
  matchesQuery,
  overall,
  trainingsQuery,
} from "@/lib/club";
import { uploadPhoto } from "@/lib/photos";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Seus dados, estatísticas, frequência nos treinos e configurações de conta.",
      },
      { property: "og:title", content: "Meu perfil | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Acompanhe suas estatísticas e atualize sua foto e senha no Brabo E.C.",
      },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { user, roles, isPresident } = useAuth();
  const player = useMyPlayer();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");

  const { data: attendance = [] } = useQuery(attendanceQuery);
  const { data: trainings = [] } = useQuery(trainingsQuery);
  const { data: matches = [] } = useQuery(matchesQuery);

  const rows = player ? attendance.filter((a) => a.player_id === player.id) : [];
  const presentes = rows.filter((a) => a.status === "presente").length;
  const ausentes = rows.filter((a) => a.status === "ausente").length;
  const frequencia = rows.length ? Math.round((presentes / rows.length) * 100) : 0;

  const now = Date.now();
  const proximos = [
    ...trainings
      .filter((t) => new Date(t.training_date).getTime() > now)
      .map((t) => ({ id: t.id, label: t.title, date: t.training_date })),
    ...matches
      .filter((m) => new Date(m.match_date).getTime() > now)
      .map((m) => ({ id: m.id, label: `Jogo vs ${m.opponent}`, date: m.match_date })),
  ]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const savePhoto = useMutation({
    mutationFn: async (path: string) => {
      if (!player) throw new Error("Sua conta ainda não está vinculada a um atleta.");
      const { error } = await supabase.from("players").update({ photo_url: path }).eq("id", player.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Foto atualizada!");
      qc.invalidateQueries({ queryKey: ["players"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onPickFile(file?: File) {
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = await uploadPhoto(file, user.id);
      await savePhoto.mutateAsync(path);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) return toast.error("A senha precisa ter ao menos 6 caracteres.");
    if (senha !== senha2) return toast.error("As senhas não conferem.");
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) return toast.error(error.message);
    setSenha("");
    setSenha2("");
    toast.success("Senha alterada com sucesso!");
  }

  return (
    <AppShell>
      <div className="space-y-8 animate-stagger">
        <section>
          <h1 className="font-display text-4xl tracking-tight lg:text-5xl">Meu Perfil</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground/80 font-sans">{user?.email}</p>
        </section>

        <Card className="overflow-hidden border-border/40 bg-card/40 backdrop-blur-md shadow-elevated">
          <div className="surface-primary h-24 relative overflow-hidden">
            {/* Abstract decorative element */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-10" />
          </div>
          <CardContent className="-mt-12 space-y-6 p-6 relative z-10">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
              <PlayerAvatar
                path={player?.photo_url ?? null}
                name={player?.full_name ?? user?.email ?? "?"}
                shirt={player?.shirt_number}
                className="h-32 w-32 text-5xl ring-4 ring-background shadow-glow rounded-2xl"
              />
              <div className="flex-1 text-center sm:text-left">
                <p className="font-display text-3xl tracking-wide lg:text-4xl">{player?.full_name ?? "Perfil de Gestão"}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {roles.map((r) => (
                    <Badge key={r} variant="outline" className="border-accent/40 bg-accent/5 text-accent uppercase text-[9px] font-bold tracking-[0.1em] px-3">
                      <ShieldCheck className="mr-1 h-3 w-3" /> {ROLE_LABEL[r]}
                    </Badge>
                  ))}
                  {player && <Badge variant="secondary" className="bg-primary/20 text-primary uppercase text-[9px] font-bold tracking-[0.1em] px-3 border-primary/20">{player.position}</Badge>}
                  {player && <Badge variant="outline" className="border-border/60 text-muted-foreground uppercase text-[9px] font-bold tracking-[0.1em] px-3">{player.categoria}</Badge>}
                </div>
              </div>
              {player && (
                <div className="flex w-full justify-center sm:w-auto">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0])}
                  />
                  <Button
                    variant="outline"
                    className="w-full border-primary/20 bg-primary/5 hover:bg-primary/10 sm:w-auto"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4 text-primary" />
                    {uploading ? "Enviando..." : "Atualizar Foto"}
                  </Button>
                </div>
              )}
            </div>

            {player ? (
              <div className="space-y-8 pt-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    ["Partidas", player.matches_played],
                    ["Gols", player.goals],
                    ["Assistências", player.assists],
                    ["Amarelos", player.yellow_cards],
                    ["Vermelhos", player.red_cards],
                    ["Rating", overall(player)],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-xl border border-border/40 bg-secondary/20 p-4 text-center transition-all hover:bg-secondary/30">
                      <p className="font-display text-3xl text-primary">{value as number}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{label as string}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 rounded-xl border border-border/40 bg-secondary/10 p-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Informações Biométricas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground/60">Idade</Label>
                        <p className="text-sm font-semibold">{age(player.birth_date) ?? "-"}</p>
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground/60">Dominância</Label>
                        <p className="text-sm font-semibold">{player.dominant_foot}</p>
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground/60">Estatura</Label>
                        <p className="text-sm font-semibold">{player.height_cm ? `${player.height_cm} cm` : "-"}</p>
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground/60">Peso</Label>
                        <p className="text-sm font-semibold">{player.weight_kg ? `${player.weight_kg} kg` : "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Status no Clube</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground/60">Ingresso</Label>
                        <p className="text-sm font-semibold">{player.joined_on ? formatDay(player.joined_on) : "-"}</p>
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground/60">Situação</Label>
                        <p className="text-sm font-semibold capitalize">{player.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-secondary/10 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Frequência em Treinos</h3>
                    <span className="font-display text-2xl text-accent">{frequencia}%</span>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary/40">
                    <div
                      className="h-full rounded-full bg-primary shadow-glow transition-all duration-1000 ease-out"
                      style={{ width: `${frequencia}%` }}
                    />
                  </div>
                  <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    <span>{presentes} Presenças</span>
                    <span>{ausentes} Faltas</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldCheck className="mb-4 h-12 w-12 text-primary opacity-20" />
                <p className="max-w-xs text-sm font-medium leading-relaxed text-muted-foreground/60">
                  {isPresident
                    ? "Conta de administração de elite. Sem ficha de atleta vinculada a este perfil."
                    : "Identidade de atleta não encontrada. Solicite o vínculo ao Presidente do clube."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/40 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="font-display text-xl tracking-wider text-muted-foreground/80">
                <CalendarDays className="mr-2 h-5 w-5 inline text-primary" /> Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {proximos.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-secondary/20 p-4 transition-all hover:bg-secondary/30"
                >
                  <p className="truncate text-sm font-bold tracking-tight">{e.label}</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{formatDate(e.date)}</span>
                </div>
              ))}
              {proximos.length === 0 && (
                <div className="py-8 text-center text-sm font-medium text-muted-foreground/40 italic">Nada agendado para você.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 font-display text-xl tracking-wider text-muted-foreground/80">
                <KeyRound className="h-5 w-5 text-primary" /> Segurança da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="space-y-5" onSubmit={changePassword}>
                <div className="space-y-2">
                  <Label htmlFor="nova" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Nova Senha</Label>
                  <Input
                    id="nova"
                    type="password"
                    minLength={6}
                    className="border-border/40 bg-secondary/20 transition-all focus:ring-primary/20"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nova2" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Confirmar Senha</Label>
                  <Input
                    id="nova2"
                    type="password"
                    minLength={6}
                    className="border-border/40 bg-secondary/20 transition-all focus:ring-primary/20"
                    placeholder="••••••••"
                    value={senha2}
                    onChange={(e) => setSenha2(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] py-6 shadow-glow transition-all active:scale-[0.98]">
                  Salvar Alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
