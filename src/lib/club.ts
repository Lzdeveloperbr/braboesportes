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
