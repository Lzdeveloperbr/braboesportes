import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { primaryRole, ROLE_LABEL, type AppRole } from "@/lib/roles";

export type { AppRole };
export { ROLE_LABEL };

type AuthState = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  role: AppRole;
  /** Presidente: controle total. */
  isPresident: boolean;
  /** Presidente ou administrador: gestão do clube. */
  isAdmin: boolean;
  /** Presidente, admin, comissão ou treinador. */
  isStaff: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (!nextSession) setRoles([]);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (active) setRoles((data ?? []).map((r) => r.role as AppRole));
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const value = useMemo<AuthState>(() => {
    const isPresident = roles.includes("presidente");
    const isAdmin = isPresident || roles.includes("admin");
    const isStaff = isAdmin || roles.includes("comissao") || roles.includes("treinador");
    return {
      session,
      user: session?.user ?? null,
      roles,
      role: primaryRole(roles),
      isPresident,
      isAdmin,
      isStaff,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [session, roles, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
