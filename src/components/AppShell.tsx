import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  CalendarDays,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL, useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/elenco", label: "Elenco", icon: Users },
  { to: "/jogos", label: "Jogos", icon: CalendarDays },
  { to: "/treinos", label: "Treinos", icon: Dumbbell },
  { to: "/escalacao", label: "Escalação", icon: ClipboardList },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/avisos", label: "Avisos", icon: Megaphone },
] as const;


export function AppShell({ children }: { children: ReactNode }) {
  const { user, roles, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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

  return (
    <div className="min-h-screen surface-pitch pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <img src={BRAND.crest} alt="Escudo do Brabo Esporte Clube" className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-none tracking-wide">Brabo E.C.</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  pathname === item.to && "bg-primary/15 text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {roles[0] && (
            <Badge variant="outline" className="hidden border-accent/50 text-accent sm:inline-flex">
              {ROLE_LABEL[roles[0]]}
            </Badge>
          )}
          <Button variant="ghost" size="icon" aria-label="Sair" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="flex overflow-x-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-w-[72px] flex-1 flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground",
                  active && "text-primary",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
