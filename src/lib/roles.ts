export type AppRole =
  | "superadmin"
  | "presidente"
  | "admin"
  | "diretor"
  | "comissao"
  | "treinador"
  | "auxiliar"
  | "jogador"
  | "responsavel";

export const ROLE_LABEL: Record<AppRole, string> = {
  superadmin: "Superadmin",
  presidente: "Presidente",
  admin: "Administrador",
  diretor: "Diretor",
  comissao: "Comissão Técnica",
  treinador: "Treinador",
  auxiliar: "Auxiliar Técnico",
  jogador: "Jogador",
  responsavel: "Responsável",
};

export const ROLE_DESCRIPTION: Record<AppRole, string> = {
  superadmin: "Administra a plataforma inteira e todos os clubes",
  presidente: "Controle total do clube, finanças, auditoria e configurações",
  admin: "Gestão de elenco, jogos, treinos, documentos e mensalidades",
  diretor: "Gestão administrativa do clube",
  comissao: "Avaliações, escalação, estatísticas e presença",
  treinador: "Treinos, presença e escalação",
  auxiliar: "Apoio ao treinador em treinos e presença",
  jogador: "Visualiza seus dados e confirma presença",
  responsavel: "Acompanha o atleta sob sua responsabilidade",
};

/** Ordem hierárquica (menor índice = mais poder). */
export const ROLE_ORDER: AppRole[] = [
  "superadmin",
  "presidente",
  "admin",
  "diretor",
  "comissao",
  "treinador",
  "auxiliar",
  "responsavel",
  "jogador",
];

export const ASSIGNABLE_ROLES: AppRole[] = [
  "admin",
  "diretor",
  "comissao",
  "treinador",
  "auxiliar",
  "responsavel",
  "jogador",
];

export function primaryRole(roles: AppRole[]): AppRole {
  for (const r of ROLE_ORDER) if (roles.includes(r)) return r;
  return "jogador";
}
