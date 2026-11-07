import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowLeftRight, Crosshair, ShieldCheck, Sparkles } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { evaluationsQuery, playersQuery } from "@/lib/club";

export const Route = createFileRoute("/comparativo")({
  head: () => ({
    meta: [
      { title: "Comparativo técnico | Brabo Esporte Clube" },
      { name: "description", content: "Compare atributos e evolução técnica dos atletas do Brabo." },
    ],
  }),
  component: Comparativo,
});

const attributes = [
  { key: "speed", label: "Velocidade" },
  { key: "technique", label: "Técnica" },
  { key: "finishing", label: "Finalização" },
  { key: "passing", label: "Passe" },
  { key: "defending", label: "Marcação" },
  { key: "physical", label: "Físico" },
  { key: "attitude", label: "Atitude" },
] as const;

function Comparativo() {
  const { isStaff } = useAuth();
  const playersQueryResult = useQuery({ ...playersQuery, enabled: isStaff });
  const evaluationsQueryResult = useQuery({ ...evaluationsQuery, enabled: isStaff });
  const players = playersQueryResult.data ?? [];
  const evaluations = evaluationsQueryResult.data ?? [];
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [third, setThird] = useState("");

  const selectedIds = [first, second, third].filter(Boolean);
  const selectedPlayers = selectedIds.map((id) => players.find((player) => player.id === id)).filter((player): player is (typeof players)[number] => Boolean(player));

  const chartData = useMemo(() => attributes.map((attribute) => {
    const row: Record<string, string | number> = { attribute: attribute.label };
    for (const player of selectedPlayers) {
      const latest = evaluations
        .filter((item) => item.player_id === player.id)
        .slice()
        .sort((a, b) => new Date(b.evaluated_on).getTime() - new Date(a.evaluated_on).getTime())[0];
      const value = latest ? latest[attribute.key] : player[attribute.key as "speed" | "technique" | "finishing" | "passing" | "defending" | "physical"];
      row[player.id] = attribute.key === "attitude" && !latest ? 0 : value;
    }
    return row;
  }), [selectedPlayers, evaluations]);

  const latestDates = useMemo(() => new Map(selectedPlayers.map((player) => {
    const latest = evaluations
      .filter((item) => item.player_id === player.id)
      .slice()
      .sort((a, b) => new Date(b.evaluated_on).getTime() - new Date(a.evaluated_on).getTime())[0];
    return [player.id, latest?.evaluated_on ?? null] as const;
  })), [selectedPlayers, evaluations]);

  if (!isStaff) {
    return <AppShell><Card className="surface-panel"><CardContent className="p-10 text-center"><ShieldCheck className="mx-auto h-9 w-9 text-primary" /><h1 className="mt-3 font-display text-2xl">Acesso da comissão técnica</h1><p className="mt-1 text-sm text-muted-foreground">O comparativo técnico é reservado à equipe responsável pelo desenvolvimento dos atletas.</p></CardContent></Card></AppShell>;
  }

  const loading = playersQueryResult.isLoading || evaluationsQueryResult.isLoading;
  const selector = (label: string, value: string, setValue: (value: string) => void, slot: number) => (
    <div className="space-y-2"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><Select value={value} onValueChange={setValue}><SelectTrigger><SelectValue placeholder="Selecionar atleta" /></SelectTrigger><SelectContent>{players.map((player) => <SelectItem key={player.id} value={player.id} disabled={selectedIds.includes(player.id) && player.id !== value}>{player.full_name} · {player.position}</SelectItem>)}</SelectContent></Select></div>
  );

  return (
    <AppShell>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(ellipse_at_90%_0%,rgba(220,38,38,.22),transparent_42%),linear-gradient(125deg,#090b0f,#17191e_65%,#310e13)] p-6 sm:p-8">
          <Badge className="border-red-300/20 bg-red-500/15 text-red-200">BRABO • PERFORMANCE</Badge>
          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-red-300">Análise da comissão técnica</p><h1 className="mt-2 font-display text-5xl leading-none text-white sm:text-6xl">COMPARATIVO TÉCNICO</h1><p className="mt-3 max-w-2xl text-sm text-white/60">Compare até três atletas por fundamento. O gráfico prioriza a avaliação mais recente de cada jogador.</p></div><ArrowLeftRight className="hidden h-16 w-16 text-white/20 sm:block" /></div>
        </section>

        {loading ? <Card className="surface-panel"><CardContent className="p-8 text-center text-sm text-muted-foreground">Carregando elenco e avaliações...</CardContent></Card> : players.length === 0 ? <Card className="surface-panel"><CardContent className="p-10 text-center"><Crosshair className="mx-auto h-9 w-9 text-muted-foreground" /><h2 className="mt-3 font-display text-2xl">Elenco ainda não cadastrado</h2><p className="mt-1 text-sm text-muted-foreground">Cadastre atletas para começar a análise comparativa.</p></CardContent></Card> : (
          <>
            <Card className="surface-panel"><CardHeader><CardTitle className="font-display text-xl">Escolha os atletas</CardTitle><p className="text-xs text-muted-foreground">Selecione dois ou três jogadores para visualizar os fundamentos lado a lado.</p></CardHeader><CardContent className="grid gap-4 md:grid-cols-3">{selector("Atleta 1", first, setFirst, 0)}{selector("Atleta 2", second, setSecond, 1)}{selector("Atleta 3 (opcional)", third, setThird, 2)}</CardContent></Card>
            {selectedPlayers.length >= 2 ? (
              <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
                <Card className="surface-panel"><CardHeader><CardTitle className="flex items-center gap-2 font-display text-xl"><Crosshair className="h-5 w-5 text-primary" /> Mapa de atributos</CardTitle><p className="text-xs text-muted-foreground">Escala de 0 a 100. Sem avaliação individual, o fundamento aparece como não avaliado.</p></CardHeader><CardContent className="h-[360px] p-2 sm:h-[440px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={chartData} outerRadius="72%"><PolarGrid stroke="var(--color-border)" /><PolarAngleAxis dataKey="attribute" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 9 }} /><Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />{selectedPlayers.map((player) => <Radar key={player.id} name={player.full_name} dataKey={player.id} stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={selectedPlayers.length > 1 ? 0.08 : 0.18} />)}</RadarChart></ResponsiveContainer></CardContent></Card>
                <Card className="surface-panel"><CardHeader><CardTitle className="flex items-center gap-2 font-display text-xl"><Sparkles className="h-5 w-5 text-primary" /> Ficha comparativa</CardTitle></CardHeader><CardContent className="space-y-3">{selectedPlayers.map((player) => {const date=latestDates.get(player.id);const rating=attributes.reduce((sum,attribute)=>sum+Number(chartData.find((row)=>row.attribute===attribute.label)?.[player.id]??0),0)/(date?7:6);return <div key={player.id} className="rounded-xl border border-white/[.07] bg-white/[.025] p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold">{player.full_name}</p><p className="text-xs text-muted-foreground">{player.position} · Camisa {player.shirt_number ?? "—"}</p></div><span className="font-display text-3xl text-primary">{rating.toFixed(1)}</span></div><p className="mt-2 text-[10px] text-muted-foreground">{date ? `Avaliação mais recente: ${new Date(date + "T12:00:00").toLocaleDateString("pt-BR")}` : "Sem avaliação registrada; valores atuais do cadastro usados quando disponíveis."}</p></div>})}</CardContent></Card>
              </section>
            ) : <Card className="surface-panel"><CardContent className="flex flex-col items-center p-10 text-center"><ArrowLeftRight className="h-9 w-9 text-muted-foreground" /><h2 className="mt-3 font-display text-2xl">Selecione pelo menos dois atletas</h2><p className="mt-1 text-sm text-muted-foreground">O comparativo será montado com as avaliações existentes no sistema.</p></CardContent></Card>}
            <p className="text-[10px] leading-5 text-muted-foreground">O gráfico utiliza a avaliação mais recente registrada. Quando não existe avaliação, são utilizados os atributos disponíveis no cadastro do atleta; atitude não é estimada. A comparação é um apoio à análise, não uma decisão automática de escalação.</p>
          </>
        )}
      </div>
    </AppShell>
  );
}
