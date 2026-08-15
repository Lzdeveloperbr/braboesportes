import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save, History, Shield, Info, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</Label>
      <Input
        type={type}
        value={form[key]}
        disabled={!isPresident}
        className="border-border/40 bg-secondary/10 transition-all focus:ring-primary/20"
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-8 animate-stagger">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl tracking-tight lg:text-5xl text-white">Administração</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground/80">
              Gestão da identidade do clube e monitoramento do sistema
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
             <Shield className="h-6 w-6 shadow-glow" />
          </div>
        </div>

        <Tabs defaultValue="clube" className="w-full">
          <TabsList className="bg-card/40 border border-border/40 p-1 rounded-full w-fit mb-6">
            <TabsTrigger value="clube" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow">
               <Info className="mr-2 h-4 w-4 inline" /> Clube
            </TabsTrigger>
            {isPresident && (
              <TabsTrigger value="auditoria" className="rounded-full px-8 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow">
                 <Activity className="mr-2 h-4 w-4 inline" /> Auditoria
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="clube" className="mt-0">
            <Card className="overflow-hidden border-border/40 bg-card/40 backdrop-blur-md shadow-elevated">
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="font-display text-xl tracking-wider text-muted-foreground/80">Identidade & Parâmetros</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  {field("club_name", "Nome Oficial")}
                  {field("city", "Sede do Clube")}
                  {field("stadium", "Estádio Principal")}
                  {field("founded_year", "Ano de Fundação", "number")}
                  {field("contact_email", "E-mail Corporativo", "email")}
                  {field("contact_phone", "Telefone de Contato")}
                  {field("instagram", "Instagram Oficial")}
                  {field("monthly_fee", "Valor Base Mensalidade (R$)", "number")}
                </div>
                {isPresident && (
                  <div className="mt-8 flex justify-end">
                    <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] py-6 px-8 shadow-glow transition-all active:scale-[0.98]">
                      <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isPresident && (
            <TabsContent value="auditoria" className="mt-0 space-y-3">
              <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden">
                <div className="divide-y divide-border/40">
                  {audit.map((a) => (
                    <div key={a.id} className="group flex items-start gap-4 p-4 transition-all hover:bg-secondary/10">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-transform group-hover:scale-110">
                         <History className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold tracking-tight text-foreground/90">
                          <span className="text-primary">{a.action}</span> em <span className="capitalize">{a.entity}</span>
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5">
                          {a.actor_email ?? "sistema"} · {formatDate(a.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {audit.length === 0 && (
                    <div className="py-12 text-center text-sm font-medium text-muted-foreground/40 italic">Nenhuma ação administrativa registrada no log de auditoria.</div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppShell>
  );
}
