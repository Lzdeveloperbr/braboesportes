import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  FileText,
  FileSpreadsheet,
  Handshake,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Sparkles,
  Trophy,
  UserCircle2,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/brand";
import { ROLE_LABEL } from "@/lib/roles";
import { cn } from "@/lib/utils";

type Access = "all" | "staff" | "admin" | "president" | "super";

const NAV: { to: string; label: string; icon: typeof Users; access: Access }[] = [
  { to: "/", label: "Painel", icon: LayoutDashboard, access: "all" },
  { to: "/agenda", label: "Agenda", icon: CalendarDays, access: "all" },
  { to: "/elenco", label: "Elenco", icon: Users, access: "all" },
  { to: "/jogos", label: "Jogos", icon: Activity, access: "all" },
  { to: "/competicoes", label: "Competições", icon: Trophy, access: "all" },
  { to: "/treinos", label: "Treinos", icon: Dumbbell, access: "all" },
  { to: "/academia", label: "Academia", icon: Dumbbell, access: "all" },
  { to: "/estatisticas", label: "Estatísticas", icon: BarChart3, access: "all" },
  { to: "/relatorios", label: "Relatórios", icon: FileSpreadsheet, access: "staff" },
  { to: "/escalacao", label: "Escalação", icon: ClipboardList, access: "staff" },
  { to: "/medico", label: "Dep. Médico", icon: HeartPulse, access: "all" },
  { to: "/financeiro", label: "Financeiro", icon: Wallet, access: "admin" },
  { to: "/patrocinios", label: "Patrocínios", icon: Handshake, access: "admin" },
  { to: "/documentos", label: "Documentos", icon: FileText, access: "all" },
  { to: "/assistente", label: "Assistente IA", icon: Sparkles, access: "staff" },
  { to: "/avisos", label: "Avisos", icon: Megaphone, access: "all" },
  { to: "/configuracoes", label: "Configurações", icon: Settings, access: "admin" },
  { to: "/perfil", label: "Perfil", icon: UserCircle2, access: "all" },
  { to: "/plataforma", label: "Plataforma", icon: Building2, access: "super" },
];

const MOBILE_MAIN = ["/", "/jogos", "/elenco", "/academia", "/perfil"];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, loading, signOut, isStaff, isAdmin, isPresident, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-pitch">
        <img src={BRAND.crest} alt="Brabo Esporte Clube" className="h-24 w-24 animate-pulse" />
      </div>
    );
  }

  const can = (access: Access) =>
    access === "all" ||
    (access === "staff" && isStaff) ||
    (access === "admin" && isAdmin) ||
    (access === "president" && isPresident) ||
    (access === "super" && isSuperAdmin);

  const items = NAV.filter((i) => can(i.access));

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-[13px] font-semibold text-white/55 transition-all duration-200",
              "hover:border-white/[0.06] hover:bg-white/[0.045] hover:text-white",
              active &&
                "border-primary/20 bg-primary/[0.13] text-white shadow-[inset_3px_0_0_0_var(--primary),0_8px_24px_-18px_var(--primary)]",
            )}
          >
            <Icon className={cn("h-[17px] w-[17px] text-white/45 transition-colors group-hover:text-primary")} />
            <span className="tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen surface-pitch">
      <a href="#main-content" className="sr-only z-[100] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Pular para o conteúdo</a>
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-white/[0.07] bg-[oklch(0.085_0.005_260/0.97)] shadow-[18px_0_55px_-35px_rgba(0,0,0,0.9)] backdrop-blur-2xl lg:flex">
        <div className="relative flex items-center gap-3 overflow-hidden border-b border-white/[0.07] px-5 py-6 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent">
          <img src={BRAND.crest} alt="Escudo do Brabo Esporte Clube" className="h-11 w-11" />
          <div className="min-w-0">
            <p className="font-display text-2xl leading-none tracking-wide text-white">BRABO E.C.</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.24em] text-primary">RAÇA • TRABALHO • GLÓRIA</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5 pb-4">
          <NavLinks />
        </div>
        <div className="border-t border-white/[0.07] bg-black/20 p-4">
          <div className="mb-2 min-w-0 px-2">
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-1 border-accent/50 text-accent">
              {ROLE_LABEL[role]}
            </Badge>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[oklch(0.105_0.006_260/0.88)] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex items-center gap-3 border-b border-white/10 bg-black/20 px-5 py-5">
                  <img src={BRAND.crest} alt="" className="h-10 w-10" />
                  <div><p className="font-display text-xl tracking-wide">BRABO E.C.</p><p className="text-[9px] font-black uppercase tracking-[.2em] text-primary">RAÇA • TRABALHO • GLÓRIA</p></div>
                </div>
                <div className="px-3 pb-6">
                  <NavLinks onNavigate={() => setMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <img src={BRAND.crest} alt="" className="h-9 w-9 lg:hidden" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg leading-none tracking-wide">
                {items.find((i) => i.to === pathname)?.label ?? "Brabo E.C."}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="hidden text-right md:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Brabo Esporte Clube</p>
              <p className="text-[11px] capitalize text-muted-foreground/70">{new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", day: "2-digit", month: "short" })}</p>
            </div>
            <Badge variant="outline" className="hidden border-accent/50 text-accent sm:inline-flex">
              {ROLE_LABEL[role]}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sair"
              className="lg:hidden"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1440px] px-4 py-6 pb-28 outline-none sm:px-6 lg:px-8 lg:py-8 lg:pb-12">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.09] bg-[oklch(0.085_0.005_260/0.97)] shadow-[0_-12px_35px_-25px_rgba(0,0,0,0.95)] backdrop-blur-2xl lg:hidden">
        <div className="flex">
          {items
            .filter((i) => MOBILE_MAIN.includes(i.to))
            .map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1.5 py-2.5 text-[10px] font-semibold text-white/45 transition-colors",
                    active && "text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-1 flex-col items-center gap-1.5 py-2.5 text-[10px] font-semibold text-white/45 transition-colors hover:text-primary"
          >
            <Menu className="h-5 w-5" />
            Mais
          </button>
        </div>
      </nav>
    </div>
  );
}
