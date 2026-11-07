import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Brain, Clock3, Dumbbell, Flame, HeartPulse, ShieldCheck, Sparkles, Timer, Trophy, Zap } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { playersQuery } from "@/lib/club";

export const Route = createFileRoute("/academia")({
  head: () => ({
    meta: [
      { title: "Academia | Brabo Esporte Clube" },
      { name: "description", content: "Centro de desenvolvimento físico, técnico e mental dos atletas do Brabo E.C." },
    ],
  }),
  component: Academia,
});

const quotes = [
  { text: "Talento vence jogos. Trabalho em equipe e inteligência vencem campeonatos.", author: "Mentalidade de equipe" },
  { text: "A disciplina é fazer hoje o que seu futuro vai agradecer.", author: "Mentalidade Brabo" },
  { text: "Não existe evolução sem constância. Um treino de cada vez.", author: "Mentalidade Brabo" },
  { text: "O escudo pesa. A preparação precisa ser maior.", author: "Brabo E.C." },
  { text: "Treine com propósito. Jogue com coragem. Respeite o processo.", author: "Mentalidade Brabo" },
  { text: "A melhor versão do atleta é construída longe dos holofotes.", author: "Mentalidade Brabo" },
];

const programs = [
  { title: "Força e potência", tag: "FORÇA", icon: Dumbbell, color: "from-red-500/25 to-red-950/10", focus: "Base de força, estabilidade e potência para ações do jogo.", exercises: ["Agachamento com peso corporal — 3×10", "Avanço alternado — 3×8 por perna", "Elevação de panturrilha — 3×15", "Ponte de glúteos — 3×12"], note: "Priorize técnica e controle. Carga externa somente com supervisão." },
  { title: "Velocidade e aceleração", tag: "VELOCIDADE", icon: Zap, color: "from-amber-400/20 to-orange-950/10", focus: "Primeiros passos, reação e aceleração em distâncias curtas.", exercises: ["Saídas de 5–10 m — 5 repetições", "Aceleração de 15 m — 4 repetições", "Deslocamento lateral — 3×20 s", "Recuperação completa entre tiros"], note: "Faça após aquecimento; encerre se a técnica ou a velocidade cair." },
  { title: "Agilidade e coordenação", tag: "AGILIDADE", icon: Activity, color: "from-sky-400/20 to-blue-950/10", focus: "Mudança de direção, equilíbrio e domínio corporal.", exercises: ["Zigue-zague entre cones — 4 voltas", "Deslocamento lateral — 3×15 m", "Apoio unipodal — 3×20 s por lado", "Condução de bola com mudança de direção — 4×30 s"], note: "Movimentos controlados antes de aumentar a velocidade." },
  { title: "Core e prevenção", tag: "ESTABILIDADE", icon: ShieldCheck, color: "from-emerald-400/20 to-emerald-950/10", focus: "Estabilidade do tronco e controle de quadril e joelho.", exercises: ["Prancha — 3×20–30 s", "Prancha lateral — 2×20 s por lado", "Bird dog — 3×8 por lado", "Equilíbrio em uma perna — 3×20 s"], note: "Sem dor e sem compensações. Adapte ao histórico de cada atleta." },
];

const weekly = [
  ["SEG", "Força geral + core", "30–40 min"],
  ["TER", "Velocidade + técnica com bola", "25–35 min"],
  ["QUA", "Mobilidade + recuperação ativa", "15–25 min"],
  ["QUI", "Agilidade + potência", "25–35 min"],
  ["SEX", "Ativação leve pré-jogo", "15–20 min"],
  ["SÁB", "Jogo ou atividade orientada", "Conforme agenda"],
  ["DOM", "Descanso e recuperação", "Livre"],
];

function Academia() {
  const { data: players = [] } = useQuery(playersQuery);
  const today = new Date();
  const quote = quotes[(Number(today.toISOString().slice(0, 10).replaceAll("-", "")) % quotes.length)];
  const metrics = [
    { label: "Velocidade", key: "speed" as const },
    { label: "Técnica", key: "technique" as const },
    { label: "Finalização", key: "finishing" as const },
    { label: "Passe", key: "passing" as const },
    { label: "Defesa", key: "defending" as const },
    { label: "Físico", key: "physical" as const },
  ];
  const averages = metrics.map((metric) => ({
    ...metric,
    value: players.length ? Math.round(players.reduce((sum, player) => sum + Number(player[metric.key] ?? 0), 0) / players.length) : 0,
  }));

  return (
    <AppShell>
      <div className="space-y-7">
        <section className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(ellipse_at_85%_10%,rgba(220,38,38,.28),transparent_38%),linear-gradient(125deg,#090b0f,#17191e_62%,#310e13)] p-6 shadow-[0_28px_80px_-38px_rgba(0,0,0,.95)] sm:p-8 lg:p-10">
          <div className="absolute -right-10 -top-16 -z-10 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
          <div className="flex flex-wrap items-center gap-2"><Badge className="border-red-400/30 bg-red-500/15 text-red-200">BRABO PERFORMANCE</Badge><span className="text-[10px] font-bold uppercase tracking-[.2em] text-white/45">Centro de desenvolvimento</span></div>
          <div className="mt-5 grid gap-7 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.25em] text-red-300">Mentalidade de campeão</p>
              <h1 className="mt-2 max-w-3xl font-display text-5xl leading-[.9] tracking-wide text-white sm:text-6xl lg:text-7xl">O PRÓXIMO NÍVEL<br />COMEÇA NO TREINO.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">Um espaço para desenvolver força, velocidade, técnica e mentalidade. Evolução com consistência, responsabilidade e espírito de equipe.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur">
              <Sparkles className="h-5 w-5 text-red-300" />
              <p className="mt-3 text-[10px] font-black uppercase tracking-[.22em] text-red-200">Frase do dia</p>
              <p className="mt-2 font-display text-2xl leading-tight text-white">“{quote.text}”</p>
              <p className="mt-3 text-xs text-white/45">{quote.author}</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            <div><p className="font-display text-3xl text-white">{players.length.toString().padStart(2, "0")}</p><p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Atletas no elenco</p></div>
            <div><p className="font-display text-3xl text-white">04</p><p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Pilares físicos</p></div>
            <div><p className="font-display text-3xl text-white">07</p><p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Dias de planejamento</p></div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
          <Card className="surface-panel overflow-hidden rounded-2xl">
            <CardHeader><div className="flex items-center justify-between gap-3"><div><p className="text-eyebrow">Radar de desempenho</p><CardTitle className="mt-1 font-display text-2xl">Mapa de atributos do elenco</CardTitle></div><Badge variant="outline" className="border-red-400/30 text-red-300">VISÃO 3D</Badge></div></CardHeader>
            <CardContent>
              {players.length ? <div className="rounded-xl border border-white/[.06] bg-black/20 p-4">
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-6">
                  {averages.map((item) => <div key={item.key} className="flex flex-col items-center">
                    <div className="relative flex h-36 w-full items-end justify-center" style={{ perspective: "420px" }}>
                      <div className="relative h-full w-8 overflow-visible" style={{ transform: "rotateX(-12deg) rotateY(-18deg)", transformStyle: "preserve-3d" }}>
                        <div className="absolute bottom-0 left-0 w-8 rounded-t-md bg-gradient-to-t from-red-950 via-red-600 to-red-300 shadow-[0_0_22px_rgba(220,38,38,.2)]" style={{ height: Math.max(5, Math.min(100, item.value)) + "%" }} />
                        <div className="absolute bottom-0 left-8 w-3 origin-left rounded-r-sm bg-red-950/90" style={{ height: Math.max(5, Math.min(100, item.value)) + "%", transform: "skewY(-35deg)" }} />
                        <div className="absolute left-0 top-0 h-3 w-8 origin-bottom bg-red-300/70" style={{ bottom: (100 - Math.max(5, Math.min(100, item.value))) + "%", transform: "skewX(-45deg)" }} />
                      </div>
                    </div>
                    <span className="mt-2 font-display text-2xl text-white">{item.value || "—"}</span>
                    <span className="text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</span>
                  </div>)}
                </div>
                <p className="mt-5 text-center text-[10px] text-muted-foreground">Média dos atributos cadastrados no elenco · escala de 0 a 100</p>
              </div> : <div className="rounded-xl border border-dashed border-white/10 p-8 text-center"><Trophy className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">O radar aparecerá quando houver atletas cadastrados.</p><p className="mt-1 text-xs text-muted-foreground">Preencha as avaliações individuais para acompanhar a evolução coletiva.</p></div>}
            </CardContent>
          </Card>
          <Card className="surface-panel rounded-2xl">
            <CardHeader><p className="text-eyebrow">Pilares do atleta</p><CardTitle className="font-display text-2xl">Performance completa</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: Dumbbell, title: "Preparação física", desc: "Força, resistência, velocidade e mobilidade." },
                { icon: Brain, title: "Mentalidade", desc: "Foco, confiança, disciplina e tomada de decisão." },
                { icon: HeartPulse, title: "Recuperação", desc: "Sono, hidratação, alimentação e descanso." },
                { icon: Trophy, title: "Consistência", desc: "Pequenos avanços construídos semana após semana." },
              ].map((item) => <div key={item.title} className="flex gap-3 rounded-xl border border-white/[.06] bg-white/[.025] p-3"><div className="rounded-lg bg-red-500/10 p-2 text-red-300"><item.icon className="h-5 w-5" /></div><div><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.desc}</p></div></div>)}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div><p className="text-eyebrow">Biblioteca de preparação</p><h2 className="mt-1 font-display text-3xl">Treinos para evoluir</h2><p className="text-sm text-muted-foreground">Sessões orientativas para complementar o trabalho da comissão técnica.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            {programs.map((program) => <Card key={program.title} className="surface-panel overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-red-500/30">
              <div className={`h-1.5 bg-gradient-to-r ${program.color}`} />
              <CardHeader><div className="flex items-start justify-between"><div className="rounded-xl border border-red-400/15 bg-red-500/10 p-3 text-red-300"><program.icon className="h-6 w-6" /></div><Badge variant="outline" className="border-white/10 text-muted-foreground">{program.tag}</Badge></div><CardTitle className="mt-2 font-display text-2xl">{program.title}</CardTitle><p className="text-sm text-muted-foreground">{program.focus}</p></CardHeader>
              <CardContent><ul className="space-y-2">{program.exercises.map((exercise) => <li key={exercise} className="flex gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />{exercise}</li>)}</ul><div className="mt-4 rounded-lg border border-white/[.06] bg-white/[.025] p-3 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-400" />{program.note}</div></CardContent>
            </Card>)}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_.8fr]">
          <Card className="surface-panel rounded-2xl">
            <CardHeader><p className="text-eyebrow">Rotina sugerida</p><CardTitle className="font-display text-2xl">Semana de preparação</CardTitle></CardHeader>
            <CardContent className="space-y-2">{weekly.map(([day, activity, duration]) => <div key={day} className="flex items-center gap-3 rounded-xl border border-white/[.05] bg-white/[.02] p-3"><span className="w-12 rounded-lg bg-red-500/10 py-2 text-center font-display text-lg text-red-300">{day}</span><span className="min-w-0 flex-1 text-sm font-semibold">{activity}</span><span className="whitespace-nowrap text-[10px] text-muted-foreground">{duration}</span></div>)}</CardContent>
          </Card>
          <div className="space-y-4">
            <Card className="surface-panel rounded-2xl"><CardHeader><div className="flex items-center gap-2"><Flame className="h-5 w-5 text-red-300" /><CardTitle className="font-display text-2xl">Hábitos de alto rendimento</CardTitle></div></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex gap-3"><Clock3 className="h-4 w-4 shrink-0 text-red-300" /><p><b>Sono:</b> mantenha horários regulares e priorize noites bem dormidas.</p></div><div className="flex gap-3"><HeartPulse className="h-4 w-4 shrink-0 text-red-300" /><p><b>Hidratação:</b> beba água ao longo do dia e durante os treinos.</p></div><div className="flex gap-3"><Timer className="h-4 w-4 shrink-0 text-red-300" /><p><b>Recuperação:</b> respeite pausas e dias leves; evolução também acontece descansando.</p></div><div className="flex gap-3"><Brain className="h-4 w-4 shrink-0 text-red-300" /><p><b>Foco:</b> estabeleça uma meta técnica simples para cada sessão.</p></div></CardContent></Card>
            <Card className="overflow-hidden rounded-2xl border-red-500/20 bg-[radial-gradient(ellipse_at_100%_0%,rgba(220,38,38,.2),transparent_55%),linear-gradient(135deg,#17191e,#090b0f)]"><CardContent className="p-5"><p className="text-[10px] font-black uppercase tracking-[.22em] text-red-300">Compromisso Brabo</p><p className="mt-2 font-display text-3xl leading-tight text-white">RESPEITE O PROCESSO.<br />SUPERE SEUS LIMITES.</p><p className="mt-3 text-xs leading-5 text-white/55">Os treinos desta biblioteca são exemplos gerais. A comissão técnica deve ajustar volume e intensidade à idade, condição física, calendário, histórico de lesões e orientação profissional de cada atleta. Interrompa a atividade diante de dor, tontura ou mal-estar.</p></CardContent></Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
