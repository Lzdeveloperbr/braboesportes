import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { playersQuery, type Player } from "@/lib/club";

/** Atleta vinculado ao usuário logado (players.user_id). */
export function useMyPlayer(): Player | null {
  const { user } = useAuth();
  const { data: players = [] } = useQuery(playersQuery);
  if (!user) return null;
  return players.find((p) => p.user_id === user.id) ?? null;
}
