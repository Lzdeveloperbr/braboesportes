import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Player = Tables<"players">;
export type Match = Tables<"matches">;
export type Training = Tables<"trainings">;
export type Announcement = Tables<"announcements">;
export type Attendance = Tables<"training_attendance">;
export type Payment = Tables<"payments">;
export type Evaluation = Tables<"evaluations">;
export type Lineup = Tables<"match_lineups">;
export type Sponsor = Tables<"sponsors">;
export type ClubDocument = Tables<"documents">;
export type MatchStat = Tables<"match_stats">;
export type FinanceEntry = Tables<"finance_entries">;
export type Injury = Tables<"injuries">;
export type ClubSettings = Tables<"club_settings">;
export type AuditEntry = Tables<"audit_log">;

export const playersQuery = {
  queryKey: ["players"],
  queryFn: async (): Promise<Player[]> => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("shirt_number", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};

export const matchesQuery = {
  queryKey: ["matches"],
  queryFn: async (): Promise<Match[]> => {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};

export const trainingsQuery = {
  queryKey: ["trainings"],
  queryFn: async (): Promise<Training[]> => {
    const { data, error } = await supabase
      .from("trainings")
      .select("*")
      .order("training_date", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};

export const announcementsQuery = {
  queryKey: ["announcements"],
  queryFn: async (): Promise<Announcement[]> => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const attendanceQuery = {
  queryKey: ["training_attendance"],
  queryFn: async (): Promise<Attendance[]> => {
    const { data, error } = await supabase.from("training_attendance").select("*");
    if (error) throw error;
    return data ?? [];
  },
};

export const paymentsQuery = {
  queryKey: ["payments"],
  queryFn: async (): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("reference_month", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const evaluationsQuery = {
  queryKey: ["evaluations"],
  queryFn: async (): Promise<Evaluation[]> => {
    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .order("evaluated_on", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};

export const lineupsQuery = {
  queryKey: ["match_lineups"],
  queryFn: async (): Promise<Lineup[]> => {
    const { data, error } = await supabase.from("match_lineups").select("*");
    if (error) throw error;
    return data ?? [];
  },
};

export const sponsorsQuery = {
  queryKey: ["sponsors"],
  queryFn: async (): Promise<Sponsor[]> => {
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .order("amount", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const documentsQuery = {
  queryKey: ["documents"],
  queryFn: async (): Promise<ClubDocument[]> => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const matchStatsQuery = {
  queryKey: ["match_stats"],
  queryFn: async (): Promise<MatchStat[]> => {
    const { data, error } = await supabase.from("match_stats").select("*");
    if (error) throw error;
    return data ?? [];
  },
};

export const financeQuery = {
  queryKey: ["finance_entries"],
  queryFn: async (): Promise<FinanceEntry[]> => {
    const { data, error } = await supabase
      .from("finance_entries")
      .select("*")
      .order("entry_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const injuriesQuery = {
  queryKey: ["injuries"],
  queryFn: async (): Promise<Injury[]> => {
    const { data, error } = await supabase
      .from("injuries")
      .select("*")
      .order("started_on", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const clubSettingsQuery = {
  queryKey: ["club_settings"],
  queryFn: async (): Promise<ClubSettings | null> => {
    const { data, error } = await supabase.from("club_settings").select("*").limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const auditQuery = {
  queryKey: ["audit_log"],
  queryFn: async (): Promise<AuditEntry[]> => {
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  },
};

export function overall(p: Player) {
  return Math.round(
    (p.speed + p.technique + p.finishing + p.passing + p.defending + p.physical) / 6,
  );
}

export function evaluationOverall(e: Evaluation) {
  return Math.round(
    (e.speed + e.technique + e.finishing + e.passing + e.defending + e.physical + e.attitude) / 7,
  );
}

export function age(birth: string | null) {
  if (!birth) return null;
  const d = new Date(birth);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDay(iso: string) {
  return new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function monthLabel(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export const ATTENDANCE_STATUS = ["presente", "duvida", "ausente"] as const;
export const ATTENDANCE_LABEL: Record<string, string> = {
  presente: "Presente",
  duvida: "Dúvida",
  ausente: "Ausente",
};

export const PAYMENT_STATUS = ["pendente", "pago", "atrasado"] as const;
export const PAYMENT_LABEL: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
};

export const SPONSOR_TIERS = ["master", "ouro", "prata", "apoio"] as const;
export const SPONSOR_TIER_LABEL: Record<string, string> = {
  master: "Master",
  ouro: "Ouro",
  prata: "Prata",
  apoio: "Apoio",
};

export const DOC_TYPES = ["contrato", "exame", "atestado", "autorizacao", "outro"] as const;
export const DOC_TYPE_LABEL: Record<string, string> = {
  contrato: "Contrato",
  exame: "Exame médico",
  atestado: "Atestado",
  autorizacao: "Autorização",
  outro: "Outro",
};

export const FINANCE_KINDS = ["receita", "despesa"] as const;
export const FINANCE_CATEGORIES = [
  "mensalidade",
  "patrocinio",
  "material",
  "arbitragem",
  "transporte",
  "inscricao",
  "geral",
] as const;
export const FINANCE_CATEGORY_LABEL: Record<string, string> = {
  mensalidade: "Mensalidade",
  patrocinio: "Patrocínio",
  material: "Material",
  arbitragem: "Arbitragem",
  transporte: "Transporte",
  inscricao: "Inscrição",
  geral: "Geral",
};

export const INJURY_SEVERITY = ["leve", "moderada", "grave"] as const;
export const INJURY_STATUS = ["em_tratamento", "recuperado"] as const;
export const INJURY_STATUS_LABEL: Record<string, string> = {
  em_tratamento: "Em tratamento",
  recuperado: "Recuperado",
};

export const FORMATIONS: Record<string, { label: string; rows: number[] }> = {
  "4-3-3": { label: "4-3-3", rows: [1, 4, 3, 3] },
  "4-4-2": { label: "4-4-2", rows: [1, 4, 4, 2] },
  "3-5-2": { label: "3-5-2", rows: [1, 3, 5, 2] },
  "4-2-3-1": { label: "4-2-3-1", rows: [1, 4, 2, 3, 1] },
  "5-3-2": { label: "5-3-2", rows: [1, 5, 3, 2] },
};

/** Posições no campo (%) para cada formação, do goleiro ao ataque. */
export function formationSlots(formation: string) {
  const rows = FORMATIONS[formation]?.rows ?? FORMATIONS["4-3-3"].rows;
  const slots: { x: number; y: number }[] = [];
  const lines = rows.length;
  rows.forEach((count, lineIndex) => {
    const y = 92 - (lineIndex * 80) / (lines - 1 || 1);
    for (let i = 0; i < count; i++) {
      const x = ((i + 1) * 100) / (count + 1);
      slots.push({ x, y });
    }
  });
  return slots;
}
