# Roadmap do Brabo Esportes

## Entregue nesta rodada
- [x] Dashboard com identidade visual de centro de comando e indicadores calculados a partir dos dados do clube.
- [x] Painel de momento do time com sequência dos últimos resultados registrados.
- [x] Acesso rápido aos módulos de jogos, treinos, elenco, escalação, agenda, financeiro, departamento médico e avisos.
- [x] Acabamento responsivo, estados de foco acessíveis, respeito a preferência por movimento reduzido e navegação por teclado.
- [x] Shell da aplicação com idioma pt-BR, data no fuso de São Paulo e link para pular ao conteúdo.
- [x] Documentação de produto, stack, configuração e segurança atualizada.

## Próximas etapas de produto
- [ ] Confirmar e testar a implantação da base multi-clube no banco Supabase de produção; validar isolamento RLS por clube antes de liberar novos clubes.
- [ ] Temporadas, categorias/equipes, dirigentes e histórico de transferências.
- [ ] Eventos de partida como fonte única para gols, assistências, cartões, substituições e relatórios.
- [ ] Convocação digital com confirmação de presença e notificações internas.
- [ ] Planejamento semanal de treinos, justificativas de ausência e avaliações por atleta.
- [ ] Competições, tabela de classificação, artilharia e premiações.
- [ ] Central de mensagens, enquetes e notificações por e-mail.
- [ ] Relatórios financeiros exportáveis, comprovantes e alertas de vencimento.
- [ ] Conteúdo e marketing: galeria, página pública do clube e artes compartilháveis.
- [ ] Integração de placares/calendários externos somente após definir fornecedor, credenciais e limites de uso.
- [ ] Planos e cobrança SaaS após escolher provedor e validar requisitos legais/financeiros.

## Qualidade e lançamento
- [ ] Executar lint e build em ambiente conectado ao projeto.
- [ ] Testar fluxos de ponta a ponta para cada perfil de acesso.
- [ ] Validar responsividade em Android, iOS e desktop.
- [ ] Revisar RLS, permissões de Storage, privacidade de dados médicos e documentos.
- [ ] Testar recuperação de senha, sessão expirada, falhas de rede e estados vazios.
