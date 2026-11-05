import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { clubMembersQuery, clubsQuery, formatDay } from "@/lib/club";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/plataforma")({
  head: () => ({
    meta: [
      { title: "Painel da Plataforma | Brabo Pro X" },
      { name: "description", content: "Gestão de todos os clubes da plataforma." },
      { property: "og:title", content: "Painel da Plataforma | Brabo Pro X" },
      { property: "og:description", content: "Clubes, membros e indicadores da plataforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Plataforma,
});

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Plataforma() {
  const { isSuperAdmin } = useAuth();
  const qc = useQueryClient();
  const { data: clubs = [], isLoading } = useQuery(clubsQuery);
  const { data: members = [] } = useQuery(clubMembersQuery);
  const [name, setName] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const n = name.trim();
      if (n.length < 3) throw new Error("Informe o nome do clube (mín. 3 letras).");
      const { error } = await supabase.from("clubs").insert({ name: n, slug: slugify(n) });
      if (error) throw error;
      await logAudit("criar", "clube", null, { name: n });
    },
    onSuccess: () => {
      toast.success("Clube criado");
      setName("");
      qc.invalidateQueries({ queryKey: ["clubs"] });
    },
    onError: (e: Error) =>
      toast.error(e.message.includes("duplicate") ? "Já existe um clube com esse nome." : e.message),
  });

  if (!isSuperAdmin) {
    return (
      <AppShell>
        <p className="text-muted-foreground">Acesso restrito ao superadministrador.</p>
      </AppShell>
    );
  }

  const countFor = (id: string) => members.filter((m) => m.club_id === id).length;

  return (
    <AppShell>
      <div className="space-y-6 animate-stagger">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Painel da Plataforma</h1>
          <p className="text-sm text-muted-foreground">Todos os clubes que usam o sistema</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Clubes" value={clubs.length} icon={Building2} />
          <StatCard label="Usuários vinculados" value={members.length} icon={Users} />
        </div>

        <Card className="glass">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="club-name">Novo clube</Label>
              <Input
                id="club-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Atlético Vila Nova"
              />
            </div>
            <Button onClick={() => create.mutate()} disabled={create.isPending}>
              <Plus className="mr-1 h-4 w-4" /> Criar clube
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {clubs.map((c) => (
            <Card key={c.id} className="glass">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{c.slug} · desde {formatDay(c.created_at.slice(0, 10))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{countFor(c.id)} membros</Badge>
                  <Badge variant={c.status === "ativo" ? "default" : "secondary"}>{c.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
