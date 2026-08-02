export type AppRole =
  | "presidente"
  | "admin"
  | "comissao"
  | "treinador"
  | "jogador"
  | "responsavel";

export const ROLE_LABEL: Record<AppRole, string> = {
  presidente: "Presidente",
  admin: "Administrador",
  comissao: "Comissão Técnica",
  treinador: "Treinador",
  jogador: "Jogador",
  responsavel: "Responsável",
};

export const ROLE_DESCRIPTION: Record<AppRole, string> = {
  presidente: "Controle total do clube, finanças, auditoria e configurações",
  admin: "Gestão de elenco, jogos, treinos, documentos e mensalidades",
  comissao: "Avaliações, escalação, estatísticas e presença",
  treinador: "Treinos, presença e escalação",
  jogador: "Visualiza seus dados e confirma presença",
  responsavel: "Acompanha o atleta sob sua responsabilidade",
};

/** Ordem hierárquica (menor índice = mais poder). */
export const ROLE_ORDER: AppRole[] = [
  "presidente",
  "admin",
  "comissao",
  "treinador",
  "responsavel",
  "jogador",
];

export const ASSIGNABLE_ROLES: AppRole[] = [
  "admin",
  "comissao",
  "treinador",
  "responsavel",
  "jogador",
];

export function primaryRole(roles: AppRole[]): AppRole {
  for (const r of ROLE_ORDER) if (roles.includes(r)) return r;
  return "jogador";
}
