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
  Handshake,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Sparkles,
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
  { to: "/treinos", label: "Treinos", icon: Dumbbell, access: "all" },
  { to: "/estatisticas", label: "Estatísticas", icon: BarChart3, access: "all" },
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

const MOBILE_MAIN = ["/", "/agenda", "/elenco", "/estatisticas", "/perfil"];

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
              "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-300",
              "hover:bg-primary/10 hover:text-foreground hover:shadow-sm",
              active &&
                "bg-primary/20 text-primary shadow-glow ring-1 ring-primary/20",
            )}
          >
            <Icon className={cn("h-4 w-4 transition-all duration-300 group-hover:scale-125 group-hover:text-primary")} />
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/60 bg-background/80 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <img src={BRAND.crest} alt="Escudo do Brabo Esporte Clube" className="h-11 w-11" />
          <div className="min-w-0">
            <p className="font-display text-xl leading-none tracking-wide">Brabo E.C.</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Pro X</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <NavLinks />
        </div>
        <div className="border-t border-border/60 p-3">
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

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex items-center gap-3 px-5 py-5">
                  <img src={BRAND.crest} alt="" className="h-10 w-10" />
                  <p className="font-display text-xl tracking-wide">Brabo E.C.</p>
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
            <div className="hidden text-right md:block">\n              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Brabo Esporte Clube</p>\n              <p className="text-[11px] capitalize text-muted-foreground/70">{new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}</p>\n            </div>\n            <Badge variant="outline" className="hidden border-accent/50 text-accent sm:inline-flex">
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

        <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 pb-24 outline-none lg:pb-10">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
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
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground transition-colors",
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
            className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
            Mais
          </button>
        </div>
      </nav>
    </div>
  );
}
