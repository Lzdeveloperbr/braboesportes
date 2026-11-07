# Brabo Esporte Clube — Gestão Pro

Plataforma web de gestão esportiva para clubes de futebol, com experiência responsiva para diretoria, comissão técnica, atletas e responsáveis.

## Visão do produto

O Brabo centraliza a operação do clube em um único ambiente: gestão de elenco, calendário, partidas, treinos, escalações, desempenho, departamento médico, finanças, patrocínios, documentos e comunicação.

## Módulos

- **Painel executivo:** indicadores do elenco, aproveitamento, próximos compromissos, últimos resultados, ranking e atalhos operacionais.
- **Elenco:** cadastro e ficha de atletas, dados esportivos, fotos, categorias e histórico.
- **Jogos:** calendário, adversários, placares e registros de partidas.
- **Treinos e agenda:** planejamento de sessões, categorias e controle de presença.
- **Escalação:** organização tática e formações.
- **Estatísticas:** desempenho individual e coletivo.
- **Departamento médico:** acompanhamento de lesões e retorno.
- **Financeiro e patrocínios:** receitas, despesas, mensalidades e parceiros.
- **Documentos e avisos:** arquivos privados e comunicados do clube.
- **Assistente IA:** apoio à rotina administrativa e esportiva.
- **Plataforma:** administração global, conforme permissões atribuídas.

## Plano de evolução

O backlog organizado com **1.000 melhorias** está em [`docs/PLANO-1000-MELHORIAS-BRABO.md`](docs/PLANO-1000-MELHORIAS-BRABO.md). Ele reúne 25 frentes de produto, critérios de aceite e uma ordem sugerida de execução. É um plano de trabalho, não uma lista de funcionalidades já entregues.

## Perfis de acesso

O sistema contempla os papéis de superadministrador, presidente, administrador, diretor, comissão técnica, treinador, auxiliar, jogador e responsável. A visibilidade dos módulos e as operações permitidas devem respeitar as políticas de autorização do banco de dados.

## Stack

- React 19 + TypeScript
- TanStack Start / TanStack Router
- Vite
- Tailwind CSS v4
- shadcn/ui e Radix UI
- TanStack Query
- Supabase (Auth, Postgres, Storage e Row Level Security)
- Recharts para visualização de indicadores

## Desenvolvimento local

Requisitos: Node.js compatível com Vite 8 e npm.

```bash
git clone https://github.com/Lzdeveloperbr/braboesportes.git
cd braboesportes
npm install
npm run dev
```

## Comandos

```bash
npm run dev       # ambiente local
npm run build     # build de produção
npm run build:dev # build em modo desenvolvimento
npm run preview   # prévia do build
npm run lint      # análise estática
```

## Configuração do Supabase

O projeto precisa de uma instância Supabase conectada pelo Lovable ou configurada no ambiente.

Variáveis utilizadas pelo cliente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Variáveis utilizadas exclusivamente no servidor:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Segurança:** nunca exponha a service role key no navegador, em commits, prints ou arquivos públicos. Mantenha credenciais em secrets do ambiente. Toda nova tabela com dados de clube deve receber políticas RLS restritivas e isolamento por `club_id`, conforme `AGENTS.md`.

## Fluxo de contribuição

1. Faça alterações em uma branch de trabalho quando possível.
2. Preserve migrations e histórico já publicados: o projeto sincroniza com Lovable.
3. Rode `npm run lint` e `npm run build` antes de publicar.
4. Não inclua credenciais, dados pessoais reais de atletas ou documentos privados em commits.
5. Para integrações externas (placares ao vivo, calendário de competições ou pagamentos), valide o provedor, limites, licenças e secrets antes de ativar.

## Projeto no Lovable

O repositório está conectado ao Lovable. Commits na branch principal são sincronizados com o editor.

- Editor: https://lovable.dev/projects/90df5ae0-ec0d-4168-861c-cf8c1aafc842
- Aplicação: https://braboesportes.lovable.app
