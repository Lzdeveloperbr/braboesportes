# Roadmap do Brabo Esportes

## Entregue nesta rodada
- [x] Dashboard com identidade visual de centro de comando e indicadores calculados a partir dos dados do clube.
- [x] Painel de momento do time com sequência dos últimos resultados registrados.
- [x] Acesso rápido aos módulos de jogos, treinos, elenco, escalação, agenda, financeiro, departamento médico e avisos.
- [x] Acabamento responsivo, estados de foco acessíveis, respeito a preferência por movimento reduzido e navegação por teclado.
- [x] Shell da aplicação com idioma pt-BR, data no fuso de São Paulo e link para pular ao conteúdo.
- [x] Documentação de produto, stack, configuração e segurança atualizada.

## Execução iniciada em 2026-11-07
- [x] Painel operacional com pendências financeiras, cobranças vencidas e acompanhamentos médicos calculados a partir das tabelas existentes.
- [x] Indicadores com links diretos para os módulos responsáveis.
- [x] Central de relatórios com exportação CSV de avaliações técnicas, presenças e estatísticas individuais.
- [x] Exportação e resumo financeiro restritos ao perfil administrativo; consultas da central limitadas conforme perfil.
- [x] Comparativo técnico de até três atletas com gráfico radar e prioridade para a avaliação mais recente.
- [x] Permissões de menu alinhadas aos módulos médico, documentos e estatísticas.
- [x] Gestão de treinos, chamadas e escalações habilitada para a comissão técnica; gestão financeira alinhada a perfis administrativos.
- [x] Pipeline GitHub Actions para lint, TypeScript e build de produção.
- [x] Central de competições com agrupamento automático por torneio, calendário, resultados e estatísticas reais do Brabo.
- [x] Navegação e tipos da rota Academia normalizados; nova rota Competições registrada no menu e no roteador.
- [x] Correção da tipagem gerada da rota Academia para evitar entradas duplicadas e garantir navegação tipada.
- [ ] Confirmar execução verde do pipeline GitHub Actions e corrigir eventuais falhas.
- [ ] Validar as telas no preview conectado ao Lovable.

## Próximas etapas de produto
- [ ] Confirmar e testar a implantação da base multi-clube no banco Supabase de produção; validar isolamento RLS por clube antes de liberar novos clubes.
- [ ] Temporadas, categorias/equipes, dirigentes e histórico de transferências.
- [ ] Classificação oficial por campeonato: requer cadastro/importação dos resultados de todas as equipes, não apenas do Brabo.
- [ ] Convocações digitais com confirmação por atleta/responsável e trilha de auditoria.
- [ ] Eventos de partida como fonte única para gols, assistências, cartões, substituições e relatórios.
- [ ] Convocação digital com confirmação de presença e notificações internas.
- [ ] Planejamento semanal de treinos, justificativas de ausência e avaliações por atleta.
- [ ] Cadastro de atletas observados externos, relatórios de scouting e histórico de captação.
- [ ] Competições, tabela de classificação, artilharia e premiações.
- [ ] Central de mensagens, enquetes e notificações por e-mail.
- [x] Relatórios financeiros exportáveis e resumo de receitas/despesas com acesso administrativo.
- [ ] Comprovantes anexados aos lançamentos e alertas automáticos de vencimento.
- [ ] Conteúdo e marketing: galeria, página pública do clube e artes compartilháveis.
- [ ] Integração de placares/calendários externos somente após definir fornecedor, credenciais e limites de uso.
- [ ] Planos e cobrança SaaS após escolher provedor e validar requisitos legais/financeiros.

## Qualidade e lançamento
- [ ] Executar lint e build em ambiente conectado ao projeto.
- [ ] Testar fluxos de ponta a ponta para cada perfil de acesso.
- [ ] Validar responsividade em Android, iOS e desktop.
- [ ] Revisar RLS, permissões de Storage, privacidade de dados médicos e documentos.
- [ ] Testar recuperação de senha, sessão expirada, falhas de rede e estados vazios.
