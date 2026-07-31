import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CheckCircle2, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  PAYMENT_LABEL,
  PAYMENT_STATUS,
  formatDay,
  formatMoney,
  monthLabel,
  paymentsQuery,
  playersQuery,
  type Payment,
} from "@/lib/club";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro | Brabo Esporte Clube" },
      {
        name: "description",
        content:
          "Controle de mensalidades, pagamentos e pendências dos atletas do Brabo Esporte Clube.",
      },
      { property: "og:title", content: "Financeiro | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Mensalidades, recebimentos e pendências do Brabo E.C. em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  const { isPresident } = useAuth();
  const qc = useQueryClient();
  const { data: payments = [] } = useQuery(paymentsQuery);
  const { data: players = [] } = useQuery(playersQuery);
  const [filter, setFilter] = useState<string>("todos");

  const nameOf = useMemo(
    () => new Map(players.map((p) => [p.id, p.full_name])),
    [players],
  );

  const list = payments.filter((p) => filter === "todos" || p.status === filter);
  const total = payments.reduce((s, p) => s + Number(p.amount), 0);
  const recebido = payments
    .filter((p) => p.status === "pago")
    .reduce((s, p) => s + Number(p.amount), 0);
  const pendente = total - recebido;

  const markPaid = useMutation({
    mutationFn: async (p: Payment) => {
      const { error } = await supabase
        .from("payments")
        .update({ status: "pago", paid_at: new Date().toISOString().slice(0, 10) })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pagamento confirmado!");
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Financeiro</h1>
            <p className="text-sm text-muted-foreground">
              {isPresident ? "Mensalidades de todo o clube" : "Suas mensalidades"}
            </p>
          </div>
          {isPresident && <NewPaymentDialog />}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Previsto" value={formatMoney(total)} icon={Wallet} />
          <StatCard label="Recebido" value={formatMoney(recebido)} icon={CheckCircle2} />
          <StatCard label="Em aberto" value={formatMoney(pendente)} icon={Wallet} />
        </div>

        <div className="flex flex-wrap gap-2">
          {["todos", ...PAYMENT_STATUS].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? "default" : "outline"}
              onClick={() => setFilter(s)}
            >
              {s === "todos" ? "Todos" : PAYMENT_LABEL[s]}
            </Button>
          ))}
        </div>

        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-xl">Mensalidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {list.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{nameOf.get(p.player_id) ?? "Atleta"}</p>
                  <p className="text-xs text-muted-foreground">
                    {monthLabel(p.reference_month)}
                    {p.due_date ? ` · vence ${formatDay(p.due_date)}` : ""}
                  </p>
                </div>
                <span className="font-display text-xl">{formatMoney(Number(p.amount))}</span>
                <Badge
                  variant={p.status === "pago" ? "default" : "outline"}
                  className={p.status === "atrasado" ? "border-primary text-primary" : undefined}
                >
                  {PAYMENT_LABEL[p.status] ?? p.status}
                </Badge>
                {isPresident && p.status !== "pago" && (
                  <Button size="sm" variant="secondary" onClick={() => markPaid.mutate(p)}>
                    Dar baixa
                  </Button>
                )}
              </div>
            ))}
            {list.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma mensalidade registrada.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function NewPaymentDialog() {
  const qc = useQueryClient();
  const { data: players = [] } = useQuery(playersQuery);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    player_id: "",
    amount: "100",
    reference_month: new Date().toISOString().slice(0, 7),
    due_date: "",
    status: "pendente",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("payments").insert({
        player_id: form.player_id,
        amount: Number(form.amount),
        reference_month: `${form.reference_month}-01`,
        due_date: form.due_date || null,
        status: form.status,
        paid_at: form.status === "pago" ? new Date().toISOString().slice(0, 10) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mensalidade lançada!");
      qc.invalidateQueries({ queryKey: ["payments"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Nova mensalidade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Lançar mensalidade</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.player_id) return toast.error("Escolha o atleta");
            mutation.mutate();
          }}
        >
          <div className="space-y-1">
            <Label>Atleta</Label>
            <Select
              value={form.player_id}
              onValueChange={(v) => setForm({ ...form, player_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {players.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Mês de referência</Label>
              <Input
                type="month"
                required
                value={form.reference_month}
                onChange={(e) => setForm({ ...form, reference_month: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Vencimento</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Situação</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PAYMENT_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            Salvar lançamento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
