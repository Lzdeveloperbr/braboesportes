import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Crosshair,
  Dumbbell,
  FileSpreadsheet,
  FileText,
  HeartPulse,
  Megaphone,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  Handshake,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/gestao")({
  head: () => ({
    meta: [
      { title: "Gestão do Clube | Brabo Esporte Clube" },
      {
        name: "description",
        content: "Central administrativa do Brabo Esporte Clube para a diretoria e gestores autorizados.",
      },
    ],
  }),
  component: Gestao,
});

const sections = [
  { title: "Elenco", description: "Cadastrar atletas, editar fichas e organizar categorias.", to: "/elenco", icon: Users, group: "Esportivo" },
  { title: "Jogos", description: "Adicionar partidas, adversários, datas e resultados.", to: "/jogos", icon: Activity, group: "Esportivo" },
  { title: "Competições", description: "Acompanhar torneios e campanhas do clube.", to: "/competicoes", icon: Trophy, group: "Esportivo" },
  { title: "Treinos", description: "Criar sessões, organizar atividades e controlar presença.", to: "/treinos", icon: Dumbbell, group: "Esportivo" },
  { title: "Escalações", description: "Montar formações e organizar atletas por partida.", to: "/escalacao", icon: ClipboardList, group: "Esportivo" },
  { title: "Estatísticas", description: "Registrar e acompanhar o desempenho dos jogadores.", to: "/estatisticas", icon: BarChart3, group: "Desenvolvimento" },
  { title: "Comparativo técnico", description: "Comparar fundamentos e avaliações dos atletas.", to: "/comparativo", icon: Crosshair, group: "Desenvolvimento" },
  { title: "Departamento médico", description: "Acompanhar lesões e retornos dos atletas.", to: "/medico", icon: HeartPulse, group: "Desenvolvimento" },
  { title: "Financeiro", description: "Gerenciar mensalidades, pagamentos, receitas e despesas.", to: "/financeiro", icon: Wallet, group: "Administração" },
  { title: "Patrocínios", description: "Cadastrar parceiros e acompanhar contratos.", to: "/patrocinios", icon: Handshake, group: "Administração" },
  { title: "Documentos", description: "Adicionar contratos, autorizações e arquivos do clube.", to: "/documentos", icon: FileText, group: "Administração" },
  { title: "Avisos", description: "Publicar comunicados e informações para a comunidade.", to: "/avisos", icon: Megaphone, group: "Comunicação" },
  { title: "Agenda", description: "Consultar compromissos e atividades do clube.", to: "/agenda", icon: CalendarDays, group: "Comunicação" },
  { title: "Relatórios", description: "Exportar dados esportivos e relatórios administrativos.", to: "/relatorios", icon: FileSpreadsheet, group: "Administração" },
  { title: "Configurações", description: "Atualizar identidade, contatos e parâmetros do clube.", to: "/configuracoes", icon: Settings, group: "Administração" },
] as const;

function Gestao() {
  const { isAdmin, isPresident, isSuperAdmin } = useAuth();
  const canManage = isAdmin || isSuperAdmin;
  const accessUrl = typeof window !== "undefined" ? `${window.location.origin}/gestao` : "https://braboesportes.lovable.app/gestao";

  async function copyAccessLink() {
    try {
      await navigator.clipboard.writeText(accessUrl);
      toast.success("Link da área de gestão copiado.");
    } catch {
      toast.error("Não foi possível copiar automaticamente. Copie o endereço exibido na tela.");
    }
  }

  if (!canManage) {
    return (
      <AppShell>
        <Card className="surface-panel">
          <CardContent className="p-8 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-3 font-display text-2xl">Área exclusiva da gestão</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Esta área é liberada ao presidente, administradores e diretores designados pelo clube.
              Responsáveis por atletas continuam com acesso aos dados dos atletas vinculados.
            </p>
            <Button asChild className="mt-5"><Link to="/perfil">Ver meu perfil</Link></Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const groups = [...new Set(sections.map((section) => section.group))];

  return (
    <AppShell>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(ellipse_at_90%_0%,rgba(220,38,38,.24),transparent_42%),linear-gradient(125deg,#090b0f,#17191e_65%,#310e13)] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <Badge className="border-red-300/20 bg-red-500/15 text-red-200">BRABO • CENTRAL ADMINISTRATIVA</Badge>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[.2em] text-red-300">Diretoria e gestores autorizados</p>
              <h1 className="mt-2 font-display text-5xl leading-none text-white sm:text-6xl">GESTÃO DO CLUBE</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/65">
                Um único lugar para administrar o Brabo, adicionar informações e acompanhar todas as áreas.
              </p>
            </div>
            <ShieldCheck className="hidden h-16 w-16 text-white/20 sm:block" />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={copyAccessLink} className="bg-primary text-white hover:bg-primary/90">
              <Copy className="mr-2 h-4 w-4" /> Copiar link para os gestores
            </Button>
            <Badge variant="outline" className="border-white/20 bg-black/20 px-3 py-2 text-white/80">
              {isPresident ? "Presidência" : isSuperAdmin ? "Superadmin" : "Gestor autorizado"}
            </Badge>
          </div>
          <p className="mt-3 break-all text-xs text-white/45">{accessUrl}</p>
        </section>

        <Card className="surface-panel">
          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Compartilhamento seguro</p>
              <p className="text-sm text-muted-foreground">
                Envie o link somente a pessoas autorizadas. Cada gestor precisa entrar com sua própria conta e receber o perfil Administrador ou Diretor.
              </p>
            </div>
            <Button variant="outline" onClick={copyAccessLink}><Copy className="mr-2 h-4 w-4" /> Copiar</Button>
          </CardContent>
        </Card>

        {groups.map((group) => (
          <section key={group} className="space-y-3">
            <h2 className="font-display text-2xl tracking-wide">{group}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sections.filter((section) => section.group === group).map((section) => {
                const Icon = section.icon;
                return (
                  <Link key={section.to} to={section.to} className="group block">
                    <Card className="h-full border-border/60 bg-card/70 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card">
                      <CardContent className="flex h-full gap-4 p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold group-hover:text-primary">{section.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-primary">Abrir módulo <ExternalLink className="ml-1 inline h-3 w-3" /></p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <p className="text-xs leading-relaxed text-muted-foreground">
          Privacidade: o perfil Responsável é destinado ao acompanhamento do atleta vinculado e não concede acesso ao financeiro, documentos ou dados médicos de todo o clube. Para atuar na gestão, o dono deve autorizar individualmente a conta com perfil Administrador ou Diretor.
        </p>
      </div>
    </AppShell>
  );
}
