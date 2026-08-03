import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Handshake, Plus, ExternalLink } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { formatMoney, sponsorsQuery, SPONSOR_TIERS, SPONSOR_TIER_LABEL } from "@/lib/club";

export const Route = createFileRoute("/patrocinios")({
  head: () => ({
    meta: [
      { title: "Patrocínios | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Parceiros, cotas e investimento dos patrocinadores do Brabo Esporte Clube.",
      },
      { property: "og:title", content: "Patrocínios | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Gestão de parceiros e cotas de patrocínio do clube.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PatrociniosPage,
});

const EMPTY = {
  name: "",
  tier: "apoio",
  amount: "",
  website: "",
  starts_on: "",
  ends_on: "",
};

function PatrociniosPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const { data: sponsors = [] } = useQuery(sponsorsQuery);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sponsors").insert({
        name: form.name,
        tier: form.tier,
        amount: Number(form.amount || 0),
        website: form.website || null,
        starts_on: form.starts_on || null,
        ends_on: form.ends_on || null,
      });
      if (error) throw error;
      await logAudit("criar", "sponsors", null, { name: form.name });
    },
    onSuccess: () => {
      toast.success("Patrocinador cadastrado");
      setForm(EMPTY);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["sponsors"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("sponsors").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sponsors"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const actives = sponsors.filter((s) => s.active);
  const total = actives.reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Patrocínios</h1>
            <p className="text-sm text-muted-foreground">Parceiros que sustentam o clube.</p>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Novo parceiro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo patrocinador</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Cota</Label>
                      <Select
                        value={form.tier}
                        onValueChange={(tier) => setForm({ ...form, tier })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SPONSOR_TIERS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {SPONSOR_TIER_LABEL[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valor (R$)</Label>
                      <Input
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Site</Label>
                    <Input
                      placeholder="https://"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Início</Label>
                      <Input
                        type="date"
                        value={form.starts_on}
                        onChange={(e) => setForm({ ...form, starts_on: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Fim</Label>
                      <Input
                        type="date"
                        value={form.ends_on}
                        onChange={(e) => setForm({ ...form, ends_on: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    disabled={!form.name || create.isPending}
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
          <StatCard label="Parceiros ativos" value={actives.length} icon={Handshake} />
          <StatCard label="Investimento total" value={formatMoney(total)} />
          <StatCard label="Cadastrados" value={sponsors.length} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((s) => (
            <Card key={s.id} className="border-border/60 bg-card/80 shadow-elevated">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl tracking-wide">{s.name}</p>
                    <Badge variant="outline" className="mt-1 border-accent/50 text-accent">
                      {SPONSOR_TIER_LABEL[s.tier] ?? s.tier}
                    </Badge>
                  </div>
                  {isAdmin && (
                    <Switch
                      checked={s.active}
                      onCheckedChange={(active) => toggle.mutate({ id: s.id, active })}
                    />
                  )}
                </div>
                <p className="text-stat">{formatMoney(Number(s.amount))}</p>
                {s.website && (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Visitar site <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {!s.active && <p className="text-xs text-muted-foreground">Contrato inativo</p>}
              </CardContent>
            </Card>
          ))}
          {sponsors.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum patrocinador cadastrado.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
