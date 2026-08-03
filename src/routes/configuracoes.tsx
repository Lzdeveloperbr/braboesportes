import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save, History } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { auditQuery, clubSettingsQuery, formatDate } from "@/lib/club";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Identidade do clube, mensalidade padrão e trilha de auditoria administrativa.",
      },
      { property: "og:title", content: "Configurações | Brabo Esporte Clube" },
      {
        property: "og:description",
        content: "Dados oficiais do clube e histórico de ações administrativas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfigPage,
});

function ConfigPage() {
  const { isPresident } = useAuth();
  const qc = useQueryClient();
  const { data: settings } = useQuery(clubSettingsQuery);
  const { data: audit = [] } = useQuery({ ...auditQuery, enabled: isPresident });

  const [form, setForm] = useState({
    club_name: "",
    city: "",
    stadium: "",
    founded_year: "",
    contact_email: "",
    contact_phone: "",
    instagram: "",
    monthly_fee: "",
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      club_name: settings.club_name ?? "",
      city: settings.city ?? "",
      stadium: settings.stadium ?? "",
      founded_year: settings.founded_year ? String(settings.founded_year) : "",
      contact_email: settings.contact_email ?? "",
      contact_phone: settings.contact_phone ?? "",
      instagram: settings.instagram ?? "",
      monthly_fee: String(settings.monthly_fee ?? ""),
    });
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        club_name: form.club_name || "Brabo Esporte Clube",
        city: form.city || null,
        stadium: form.stadium || null,
        founded_year: form.founded_year ? Number(form.founded_year) : null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        instagram: form.instagram || null,
        monthly_fee: Number(form.monthly_fee || 0),
      };
      if (settings) {
        const { error } = await supabase
          .from("club_settings")
          .update(payload)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("club_settings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Configurações salvas");
      qc.invalidateQueries({ queryKey: ["club_settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={form[key]}
        disabled={!isPresident}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Identidade oficial do clube e trilha de auditoria.
          </p>
        </div>

        <Tabs defaultValue="clube">
          <TabsList>
            <TabsTrigger value="clube">Clube</TabsTrigger>
            {isPresident && <TabsTrigger value="auditoria">Auditoria</TabsTrigger>}
          </TabsList>

          <TabsContent value="clube" className="mt-4">
            <Card className="border-border/60 bg-card/80 shadow-elevated">
              <CardHeader>
                <CardTitle className="font-display text-xl tracking-wide">Dados oficiais</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {field("club_name", "Nome do clube")}
                {field("city", "Cidade")}
                {field("stadium", "Estádio / campo")}
                {field("founded_year", "Fundação", "number")}
                {field("contact_email", "E-mail de contato", "email")}
                {field("contact_phone", "Telefone")}
                {field("instagram", "Instagram")}
                {field("monthly_fee", "Mensalidade padrão (R$)", "number")}
                {isPresident && (
                  <div className="sm:col-span-2">
                    <Button onClick={() => save.mutate()} disabled={save.isPending}>
                      <Save className="mr-2 h-4 w-4" /> Salvar alterações
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isPresident && (
            <TabsContent value="auditoria" className="mt-4 space-y-2">
              {audit.map((a) => (
                <Card key={a.id} className="border-border/60 bg-card/80">
                  <CardContent className="flex items-start gap-3 p-3">
                    <History className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{a.action}</span> em {a.entity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.actor_email ?? "sistema"} · {formatDate(a.created_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {audit.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma ação registrada ainda.</p>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppShell>
  );
}
