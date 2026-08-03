import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { askAssistant } from "@/lib/assistant.functions";
import {
  attendanceQuery,
  financeQuery,
  matchesQuery,
  overall,
  playersQuery,
  trainingsQuery,
} from "@/lib/club";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente IA | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Análises inteligentes de elenco, desempenho e finanças do Brabo Esporte Clube.",
      },
      { property: "og:title", content: "Assistente IA | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Relatórios e recomendações táticas geradas por inteligência artificial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistentePage,
});

const SUGGESTIONS = [
  "Faça um resumo executivo da situação do clube.",
  "Quais atletas devem ser titulares no próximo jogo e por quê?",
  "Sugira um plano de treino para as próximas duas semanas.",
  "Analise a saúde financeira do clube e sugira ações.",
];

function AssistentePage() {
  const { data: players = [] } = useQuery(playersQuery);
  const { data: matches = [] } = useQuery(matchesQuery);
  const { data: trainings = [] } = useQuery(trainingsQuery);
  const { data: attendance = [] } = useQuery(attendanceQuery);
  const { data: finance = [] } = useQuery(financeQuery);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const ask = useServerFn(askAssistant);

  const buildContext = () => {
    const roster = players
      .slice(0, 40)
      .map(
        (p) =>
          `${p.shirt_number ?? "-"} ${p.full_name} (${p.position}, ${p.categoria}, overall ${overall(p)})`,
      )
      .join("; ");
    const results = matches
      .slice(-10)
      .map(
        (m) =>
          `${m.opponent} em ${m.match_date}${
            m.goals_for !== null ? ` — ${m.goals_for}x${m.goals_against ?? 0}` : " (a jogar)"
          }`,
      )
      .join("; ");
    const receitas = finance
      .filter((f) => f.kind === "receita")
      .reduce((s, f) => s + Number(f.amount), 0);
    const despesas = finance
      .filter((f) => f.kind === "despesa")
      .reduce((s, f) => s + Number(f.amount), 0);
    const presentes = attendance.filter((a) => a.status === "presente").length;

    return [
      `Elenco (${players.length}): ${roster}`,
      `Jogos: ${results}`,
      `Treinos agendados: ${trainings.length}`,
      `Presenças confirmadas: ${presentes} de ${attendance.length} registros`,
      `Financeiro: receitas R$${receitas.toFixed(2)}, despesas R$${despesas.toFixed(2)}`,
    ].join("\n");
  };

  const run = useMutation({
    mutationFn: async (q: string) => ask({ data: { question: q, context: buildContext() } }),
    onSuccess: (res) => setAnswer(res.text),
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = (q: string) => {
    if (!q.trim()) return;
    setQuestion(q);
    run.mutate(q);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Assistente IA</h1>
          <p className="text-sm text-muted-foreground">
            Análises de elenco, desempenho e finanças com os dados reais do clube.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 shadow-elevated">
          <CardContent className="space-y-3 p-4">
            <Textarea
              rows={3}
              placeholder="Pergunte algo sobre o clube..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="secondary"
                  disabled={run.isPending}
                  onClick={() => submit(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={run.isPending || !question.trim()}
              onClick={() => submit(question)}
            >
              {run.isPending ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" /> Analisando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Perguntar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {answer && (
          <Card className="border-border/60 bg-card/80 shadow-elevated">
            <CardContent className="p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
