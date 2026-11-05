# Auditoria e plano — Plataforma de gestão de futebol (multi-clube)

## Auditoria do que já existe (e continua funcionando)
- Login por e-mail/senha e Google; perfis: presidente, admin, comissão, treinador, jogador, responsável.
- Módulos prontos e salvando no banco: Painel, Agenda, Elenco (ficha completa + foto), Jogos, Treinos com presença, Estatísticas por jogo, Escalação com campo tático, Dep. Médico, Financeiro (mensalidades + receitas/despesas), Patrocínios, Documentos privados, Avisos, Configurações do clube, Auditoria, Assistente IA, Perfil.
- Segurança: regras de acesso no banco em todas as tabelas, papéis em tabela separada.
- Limitação principal: o sistema hoje é de **um clube só**. Tudo pertence implicitamente ao Brabo.

## Ponto crítico
Virar multi-clube exige que cada registro saiba a qual clube pertence. Faremos isso sem apagar nada: o Brabo vira o "Clube nº 1" e todos os dados atuais são migrados para ele.

## Etapas (uma por vez, testada antes da próxima)

**Etapa 1 — Base multi-clube e segurança**
- Tabelas de clubes e membros do clube (usuário + clube + função).
- Novas funções: superadministrador, diretor, auxiliar técnico.
- Coluna "clube" em todas as tabelas, dados atuais ligados ao Brabo.
- Regras de acesso reescritas: cada um só vê dados do próprio clube.
- Seletor de clube no topo; superadmin vê todos.

**Etapa 2 — Administração e jogadores**
- Temporadas, equipes, departamentos, dirigentes.
- Jogador: WhatsApp, histórico de transferências/temporadas, disciplinar, responsável legal, carteirinha digital (com QR).
- Recuperação de senha + edição de dados autorizados pelo jogador.
- Cores e escudo por clube; modo claro opcional.

**Etapa 3 — Jogos, escalação e estatísticas**
- Adversários, convocação com confirmação, concentração, endereço/mapa.
- Eventos de jogo (gol, assistência, cartão, substituição) — estatísticas calculadas automaticamente a partir deles, sem duplicação.
- Campo com arrastar-e-soltar, formação personalizada, capitão, cobradores, escalações salvas e compartilháveis.
- Rankings, goleiros, jogos sem sofrer gols, destaque do mês.

**Etapa 4 — Treinos e competições**
- Justificativa de ausência, treinos por tipo/posição, planejamento semanal.
- Campeonatos, rodadas, tabela de classificação automática, títulos e troféus.

**Etapa 5 — Comunicação e notificações**
- Central de notificações no app (convocação, jogos, treinos, mensalidades, escalação, resultados).
- Chats (jogadores, comissão, diretoria), mensagens individuais, enquetes, sugestões, envio de imagens.
- Lembretes automáticos agendados.

**Etapa 6 — Financeiro, saúde e avaliações**
- Comprovantes, caixa, relatório mensal, exportação (CSV/PDF), alertas de vencimento.
- Afastamentos, liberação de retorno, avaliações físicas, observações médicas restritas.
- Avaliação técnica/tática/física/disciplinar, evolução e comparação entre jogadores.

**Etapa 7 — Conteúdo**
- Galeria de fotos/vídeos, artes automáticas (escalação, placar, artilheiro, MVP) para Instagram/WhatsApp, página pública do clube.

**Etapa 8 — SaaS e cobrança**
- Planos (grátis/pagos), mensal e anual, teste grátis, limites por plano, bloqueio por inadimplência, cupons.
- Pagamentos integrados (vamos confirmar o provedor antes de ativar; exige plano Pro do Lovable).
- Painel do superadmin: clubes, jogadores, assinaturas, receita mensal/anual, inadimplentes, histórico.

**Etapa 9 — Testes de ponta a ponta** em cada perfil, no celular e no computador.

## Observações honestas
- Notificações push nativas de celular não são possíveis num app web; faremos notificações dentro do app e por e-mail.
- Backups são feitos automaticamente pela plataforma; não haverá botão de "restaurar" manual.
- Cada etapa é grande; serão várias mensagens. Nada existente será removido.

## Detalhes técnicos
- `clubs`, `club_members(club_id, user_id, role)`; helpers `is_club_member`, `has_club_role`, `is_super_admin` (security definer).
- `club_id uuid not null` em todas as tabelas de domínio com backfill para o clube Brabo; índices por `club_id`.
- `match_events` como fonte única; `match_stats` vira agregado por trigger.
- Cobrança via webhook em `/api/public/*` com verificação de assinatura.
