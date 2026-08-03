import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { HeartPulse, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import {
  formatDay,
  injuriesQuery,
  INJURY_SEVERITY,
  INJURY_STATUS_LABEL,
  playersQuery,
} from "@/lib/club";

export const Route = createFileRoute("/medico")({
  head: () => ({
    meta: [
      { title: "Departamento Médico | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Controle de lesões, tratamentos e previsão de retorno dos atletas do Brabo.",
      },
      { property: "og:title", content: "Departamento Médico | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Acompanhe lesões, gravidade e retorno dos atletas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MedicoPage,
});

const SEVERITY_LABEL: Record<string, string> = {
  leve: "Leve",
  moderada: "Moderada",
  grave: "Grave",
};

function MedicoPage() {
  const { isStaff } = useAuth();
  const qc = useQueryClient();
  const { data: injuries = [] } = useQuery(injuriesQuery);
  const { data: players = [] } = useQuery(playersQuery);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    player_id: "",
    description: "",
    severity: "leve",
    started_on: new Date().toISOString().slice(0, 10),
    expected_return: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("injuries").insert({
        player_id: form.player_id,
        description: form.description,
        severity: form.severity,
        started_on: form.started_on,
        expected_return: form.expected_return || null,
      });
      if (error) throw error;
      await logAudit("criar", "injuries", form.player_id, { severity: form.severity });
    },
    onSuccess: () => {
      toast.success("Lesão registrada");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["injuries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const recover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("injuries")
        .update({ status: "recuperado" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Atleta liberado");
      qc.invalidateQueries({ queryKey: ["injuries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = injuries.filter((i) => i.status === "em_tratamento");

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Departamento Médico</h1>
            <p className="text-sm text-muted-foreground">Lesões, tratamentos e retorno.</p>
          </div>
          {isStaff && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Registrar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova lesão</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Atleta</Label>
                    <Select
                      value={form.player_id}
                      onValueChange={(player_id) => setForm({ ...form, player_id })}
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
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Gravidade</Label>
                      <Select
                        value={form.severity}
                        onValueChange={(severity) => setForm({ ...form, severity })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INJURY_SEVERITY.map((s) => (
                            <SelectItem key={s} value={s}>
                              {SEVERITY_LABEL[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Início</Label>
                      <Input
                        type="date"
                        value={form.started_on}
                        onChange={(e) => setForm({ ...form, started_on: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Previsão de retorno</Label>
                    <Input
                      type="date"
                      value={form.expected_return}
                      onChange={(e) => setForm({ ...form, expected_return: e.target.value })}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!form.player_id || !form.description || create.isPending}
                    onClick={() => create.mutate()}
                  >
                    Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Em tratamento" value={active.length} icon={HeartPulse} />
          <StatCard
            label="Recuperados"
            value={injuries.length - active.length}
            icon={ShieldCheck}
          />
          <StatCard label="Elenco disponível" value={Math.max(players.length - active.length, 0)} />
        </div>

        <div className="space-y-3">
          {injuries.map((i) => {
            const player = players.find((p) => p.id === i.player_id);
            return (
              <Card key={i.id} className="border-border/60 bg-card/80 shadow-elevated">
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{player?.full_name ?? "Atleta"}</p>
                    <p className="text-sm text-muted-foreground">{i.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Desde {formatDay(i.started_on)}
                      {i.expected_return ? ` · retorno previsto ${formatDay(i.expected_return)}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      i.severity === "grave"
                        ? "border-primary/60 text-primary"
                        : "border-accent/50 text-accent"
                    }
                  >
                    {SEVERITY_LABEL[i.severity] ?? i.severity}
                  </Badge>
                  <Badge variant="outline">{INJURY_STATUS_LABEL[i.status] ?? i.status}</Badge>
                  {isStaff && i.status === "em_tratamento" && (
                    <Button size="sm" variant="secondary" onClick={() => recover.mutate(i.id)}>
                      Liberar
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {injuries.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma lesão registrada. Elenco 100%.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
