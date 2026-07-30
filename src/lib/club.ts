import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Player = Tables<"players">;
export type Match = Tables<"matches">;
export type Training = Tables<"trainings">;
export type Announcement = Tables<"announcements">;

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

export function overall(p: Player) {
  return Math.round(
    (p.speed + p.technique + p.finishing + p.passing + p.defending + p.physical) / 6,
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
