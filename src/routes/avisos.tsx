import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { announcementsQuery } from "@/lib/club";

export const Route = createFileRoute("/avisos")({
  head: () => ({
    meta: [
      { title: "Avisos | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Comunicados oficiais, convocações e notícias do Brabo Esporte Clube.",
      },
      { property: "og:title", content: "Avisos | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Comunicados e notícias para atletas, comissão técnica e responsáveis.",
      },
    ],
  }),
  component: Avisos,
});

function Avisos() {
  const { isPresident } = useAuth();
  const { data: announcements = [] } = useQuery(announcementsQuery);

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Avisos</h1>
            <p className="text-sm text-muted-foreground">Comunicação oficial do clube</p>
          </div>
          {isPresident && <NewAnnouncementDialog />}
        </div>

        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className="border-border/60 bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{a.title}</p>
                  {a.pinned && <Badge className="bg-accent text-accent-foreground">Fixado</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          ))}
          {announcements.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum aviso publicado.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function NewAnnouncementDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", pinned: false });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("announcements").insert({
        title: form.title,
        body: form.body,
        pinned: form.pinned,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aviso publicado!");
      qc.invalidateQueries({ queryKey: ["announcements"] });
      setOpen(false);
      setForm({ title: "", body: "", pinned: false });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Novo aviso
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Publicar aviso</DialogTitle>
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
          <div className="space-y-1">
            <Label>Mensagem</Label>
            <Textarea
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="pinned"
              checked={form.pinned}
              onCheckedChange={(v) => setForm({ ...form, pinned: v })}
            />
            <Label htmlFor="pinned">Fixar no topo</Label>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            Publicar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
