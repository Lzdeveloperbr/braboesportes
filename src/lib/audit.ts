import { supabase } from "@/integrations/supabase/client";

/** Registra uma ação administrativa na trilha de auditoria. */
export async function logAudit(
  action: string,
  entity: string,
  entityId?: string | null,
  details?: Record<string, unknown>,
) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;
  await supabase.from("audit_log").insert({
    actor_id: user.id,
    actor_email: user.email ?? null,
    action,
    entity,
    entity_id: entityId ?? null,
    details: (details ?? null) as never,
  });
}
