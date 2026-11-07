import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarCheck, Download, FileSpreadsheet, ShieldAlert, Wallet } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  attendanceQuery,
  evaluationsQuery,
  financeQuery,
  formatMoney,
  matchStatsQuery,
  playersQuery,
  trainingsQuery,
  type Player,
  type Training,
} from "@/lib/club";

const EMPTY_PLAYERS: Player[] = [];
const EMPTY_TRAININGS: Training[] = [];

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios | Brabo Esporte Clube" },
      { name: "description", content: "Relatórios e exportações operacionais do Brabo Esporte Clube." },
    ],
  }),
  component: Relatorios,
});

function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const csv = rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  }).join(";")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Relatorios() {
  const { isStaff, isAdmin } = useAuth();
  const playersQueryResult = useQuery({ ...playersQuery, enabled: isStaff });
  const evaluationsQueryResult = useQuery({ ...evaluationsQuery, enabled: isStaff });
  const attendanceQueryResult = useQuery({ ...attendanceQuery, enabled: isStaff });
  const trainingsQueryResult = useQuery({ ...trainingsQuery, enabled: isStaff });
  const statsQueryResult = useQuery({ ...matchStatsQuery, enabled: isStaff });
  const financeQueryResult = useQuery({ ...financeQuery, enabled: isStaff && isAdmin });

  const players = playersQueryResult.data ?? EMPTY_PLAYERS;
  const evaluations = evaluationsQueryResult.data ?? [];
  const attendance = attendanceQueryResult.data ?? [];
  const trainings = trainingsQueryResult.data ?? EMPTY_TRAININGS;
  const stats = statsQueryResult.data ?? [];
  const finance = financeQueryResult.data ?? [];

  const playerNames = useMemo(() => new Map(players.map((player) => [player.id, player.full_name])), [players]);
  const trainingNames = useMemo(() => new Map(trainings.map((training) => [training.id, training.title])), [trainings]);

  const present = attendance.filter((item) => item.status === "presente").length;
  const attendanceDecisions = attendance.filter((item) => item.status === "presente" || item.status === "ausente").length;
  const attendanceRate = attendanceDecisions ? Math.round((present / attendanceDecisions) * 100) : null;
  const averageEvaluation = evaluations.length
    ? evaluations.reduce((sum, item) => sum + item.speed + item.technique + item.finishing + item.passing + item.defending + item.physical + item.attitude, 0) / (evaluations.length * 7)
    : null;
  const revenue = finance.filter((item) => item.kind === "receita").reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = finance.filter((item) => item.kind === "despesa").reduce((sum, item) => sum + Number(item.amount), 0);

  const exportEvaluations = () => downloadCsv("brabo-avaliacoes-tecnicas.csv", [
    ["Atleta", "Data", "Velocidade", "Técnica", "Finalização", "Passe", "Marcação", "Físico", "Atitude", "Média"],
    ...evaluations.map((item) => [
      playerNames.get(item.player_id) ?? "Atleta não encontrado",
      item.evaluated_on,
      item.speed,
      item.technique,
      item.finishing,
      item.passing,
      item.defending,
      item.physical,
      item.attitude,
      ((item.speed + item.technique + item.finishing + item.passing + item.defending + item.physical + item.attitude) / 7).toFixed(1),
    ]),
  ]);

  const exportAttendance = () => downloadCsv("brabo-presencas-treinos.csv", [
    ["Atleta", "Treino", "Status", "Data do registro", "Observação"],
    ...attendance.map((item) => [
      playerNames.get(item.player_id) ?? "Atleta não encontrado",
      trainingNames.get(item.training_id) ?? "Treino não encontrado",
      item.status,
      item.checked_in_at ?? item.created_at,
      item.note,
    ]),
  ]);

  const exportStats = () => downloadCsv("brabo-estatisticas-individuais.csv", [
    ["Atleta", "Minutos", "Gols", "Assistências", "Finalizações", "Desarmes", "Amarelos", "Vermelhos", "Nota"],
    ...stats.map((item) => [
      playerNames.get(item.player_id) ?? "Atleta não encontrado",
      item.minutes,
      item.goals,
      item.assists,
      item.shots,
      item.tackles,
      item.yellow_cards,
      item.red_cards,
      item.rating,
    ]),
  ]);

  const exportFinance = () => downloadCsv("brabo-financeiro.csv", [
    ["Data", "Tipo", "Categoria", "Descrição", "Valor"],
    ...finance.map((item) => [item.entry_date, item.kind, item.category, item.description, item.amount]),
  ]);

  if (!isStaff) {
    return <AppShell><Card className="surface-panel"><CardContent className="flex flex-col items-center p-10 text-center"><ShieldAlert className="h-10 w-10 text-primary" /><h1 className="mt-3 font-display text-2xl">Acesso restrito</h1><p className="mt-1 text-sm text-muted-foreground">Os relatórios estão disponíveis para a comissão técnica e a gestão do clube.</p></CardContent></Card></AppShell>;
  }

  const loading = playersQueryResult.isLoading || evaluationsQueryResult.isLoading || attendanceQueryResult.isLoading || trainingsQueryResult.isLoading || statsQueryResult.isLoading;

  return (
    <AppShell>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(ellipse_at_90%_0%,rgba(220,38,38,.22),transparent_42%),linear-gradient(125deg,#090b0f,#17191e_65%,#310e13)] p-6 sm:p-8">
          <Badge className="border-red-300/20 bg-red-500/15 text-red-200">BRABO • GESTÃO PRO</Badge>
          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-red-300">Dados organizados para decisões melhores</p><h1 className="mt-2 font-display text-5xl leading-none text-white sm:text-6xl">CENTRAL DE RELATÓRIOS</h1><p className="mt-3 max-w-2xl text-sm text-white/60">Consulte indicadores e exporte arquivos CSV compatíveis com Excel e Google Planilhas.</p></div>
            <FileSpreadsheet className="hidden h-16 w-16 text-white/20 sm:block" />
          </div>
        </section>

        {loading ? <Card className="surface-panel"><CardContent className="p-8 text-center text-sm text-muted-foreground">Consolidando dados do clube...</CardContent></Card> : (
          <>
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Card className="surface-panel"><CardContent className="p-4"><BarChart3 className="h-5 w-5 text-primary" /><p className="mt-3 font-display text-3xl">{evaluations.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avaliações técnicas</p></CardContent></Card>
              <Card className="surface-panel"><CardContent className="p-4"><CalendarCheck className="h-5 w-5 text-primary" /><p className="mt-3 font-display text-3xl">{attendanceRate === null ? "—" : attendanceRate + "%"}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Presença registrada</p></CardContent></Card>
              <Card className="surface-panel"><CardContent className="p-4"><FileSpreadsheet className="h-5 w-5 text-primary" /><p className="mt-3 font-display text-3xl">{stats.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Registros de partidas</p></CardContent></Card>
              <Card className="surface-panel"><CardContent className="p-4"><BarChart3 className="h-5 w-5 text-primary" /><p className="mt-3 font-display text-3xl">{averageEvaluation === null ? "—" : averageEvaluation.toFixed(1)}</p><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Média das avaliações</p></CardContent></Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <ReportCard title="Desenvolvimento dos atletas" description="Notas individuais por fundamento e média técnica. Não inclui dados pessoais sensíveis." count={evaluations.length + " avaliações"} onExport={exportEvaluations} disabled={!evaluations.length} />
              <ReportCard title="Presença nos treinamentos" description="Histórico de presença, atleta, sessão e observações registradas." count={attendance.length + " registros"} onExport={exportAttendance} disabled={!attendance.length} />
              <ReportCard title="Estatísticas de jogo" description="Minutos, gols, assistências, finalizações, desarmes e cartões por atleta." count={stats.length + " registros"} onExport={exportStats} disabled={!stats.length} />
              {isAdmin && <ReportCard title="Movimentação financeira" description="Lançamentos de receitas e despesas do clube. Visível somente para administradores." count={finance.length + " lançamentos"} onExport={exportFinance} disabled={!finance.length} />}
            </section>

            {isAdmin && <Card className="surface-panel"><CardHeader><CardTitle className="flex items-center gap-2 font-display text-xl"><Wallet className="h-5 w-5 text-primary" /> Resumo financeiro</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4"><div><p className="text-xs text-muted-foreground">Receitas registradas</p><p className="mt-1 font-display text-2xl text-emerald-400">{formatMoney(revenue)}</p></div><div><p className="text-xs text-muted-foreground">Despesas registradas</p><p className="mt-1 font-display text-2xl text-red-400">{formatMoney(expenses)}</p></div><div className="col-span-2 border-t border-white/10 pt-3"><p className="text-xs text-muted-foreground">Saldo dos lançamentos</p><p className="mt-1 font-display text-3xl">{formatMoney(revenue - expenses)}</p></div></CardContent></Card>}
            <p className="text-[10px] leading-5 text-muted-foreground">Os relatórios refletem somente informações já cadastradas no sistema. A exportação não cria nem altera registros. O acesso financeiro é limitado à administração do clube.</p>
          </>
        )}
      </div>
    </AppShell>
  );
}

function ReportCard({ title, description, count, onExport, disabled }: { title: string; description: string; count: string; onExport: () => void; disabled: boolean }) {
  return (
    <Card className="surface-panel">
      <CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div><CardTitle className="font-display text-xl">{title}</CardTitle><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p></div><FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" /></div></CardHeader>
      <CardContent className="flex items-center justify-between gap-3 border-t border-white/[.06] pt-4"><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{count}</span><Button size="sm" onClick={onExport} disabled={disabled}><Download className="mr-2 h-4 w-4" /> Exportar CSV</Button></CardContent>
    </Card>
  );
}
