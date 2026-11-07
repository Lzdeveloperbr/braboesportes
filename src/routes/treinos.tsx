import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { AttendanceControls } from "@/components/AttendanceControls";
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
import { CATEGORIAS } from "@/lib/brand";
import {
  attendanceQuery,
  formatDate,
  playersQuery,
  trainingsQuery,
  type Training,
} from "@/lib/club";


export const Route = createFileRoute("/treinos")({
  head: () => ({
    meta: [
      { title: "Treinos | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Planejamento de treinos técnicos, táticos e físicos do Brabo Esporte Clube.",
      },
      { property: "og:title", content: "Treinos | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Calendário semanal de treinos por categoria do Brabo E.C.",
      },
    ],
  }),
  component: Treinos,
});

const TIPOS = ["Técnico", "Tático", "Físico", "Finalização", "Bola parada"];

function Treinos() {
  const { isPresident } = useAuth();
  const { data: trainings = [] } = useQuery(trainingsQuery);
  const { data: attendance = [] } = useQuery(attendanceQuery);
  const { data: players = [] } = useQuery(playersQuery);

  const now = Date.now();
  const orderedTrainings = trainings.slice().sort((a, b) => {
    const aTime = new Date(a.training_date).getTime();
    const bTime = new Date(b.training_date).getTime();
    const aUpcoming = aTime > now;
    const bUpcoming = bTime > now;
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    return aUpcoming ? aTime - bTime : bTime - aTime;
  });
  const upcoming = trainings.filter((t) => new Date(t.training_date).getTime() > now).length;

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Treinos</h1>
            <p className="text-sm text-muted-foreground">
              {trainings.length} sessões · {upcoming} agendadas
            </p>
          </div>
          {isPresident && <NewTrainingDialog />}
        </div>

        <div className="space-y-3">
          {orderedTrainings.map((t: Training) => {
            const rows = attendance.filter((a) => a.training_id === t.id);
            const presentes = rows.filter((a) => a.status === "presente").length;
            const duvidas = rows.filter((a) => a.status === "duvida").length;
            const ausentes = rows.filter((a) => a.status === "ausente").length;
            const elenco = players.filter((p) => p.categoria === t.categoria).length;
            const confirmados = presentes + ausentes;
            const pendentes = Math.max(elenco - rows.length, 0);
            const taxa = confirmados ? Math.round((presentes / confirmados) * 100) : null;
            return (
              <Card key={t.id} className="border-border/60 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.training_date)} · {t.location ?? "Local a definir"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Badge variant="secondary">{t.training_type}</Badge>
                      <Badge variant="outline">{t.categoria}</Badge>
                    </div>
                  </div>
                  {t.notes && <p className="mt-2 text-sm text-muted-foreground">{t.notes}</p>}

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {presentes} presentes · {ausentes} ausentes · {duvidas} em dúvida · {pendentes} sem resposta
                      </span>
                      <span className="font-semibold text-foreground">{taxa === null ? "—" : `${taxa}%`}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{ width: `${Math.min(taxa ?? 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  <AttendanceControls training={t} />
                </CardContent>
              </Card>
            );
          })}
          {trainings.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum treino cadastrado.</p>
          )}
        </div>

      </div>
    </AppShell>
  );
}

function NewTrainingDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    training_type: "Técnico",
    training_date: "",
    location: "",
    categoria: "Adulto",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("trainings").insert({
        title: form.title,
        training_type: form.training_type,
        training_date: new Date(form.training_date).toISOString(),
        location: form.location || null,
        categoria: form.categoria as Training["categoria"],
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Treino agendado!");
      qc.invalidateQueries({ queryKey: ["trainings"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Novo treino
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Agendar treino</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-1">
            <Label>Título</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select
                value={form.training_type}
                onValueChange={(v) => setForm({ ...form, training_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Data e hora</Label>
              <Input
                type="datetime-local"
                required
                value={form.training_date}
                onChange={(e) => setForm({ ...form, training_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Campo</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Observações</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            Salvar treino
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
