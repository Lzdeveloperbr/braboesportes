# Plano de Refatoração Visual Premium — Brabo Esporte Clube PRO X

Este plano visa transformar a interface atual em uma experiência visual de elite, focada em sofisticação, minimalismo moderno e fluidez absoluta, seguindo as diretrizes de design editorial e tecnologia de ponta.

## Mudanças Estéticas e UI

### 1. Refino Estético e Profundidade
- **Paleta de Cores**: Manter a base navy/crimson mas introduzir variações de opacidade e blur para camadas.
- **Glassmorphism**: Aplicar efeitos de `backdrop-blur` e bordas semi-transparentes em cards e menus para maior profundidade.
- **Shadows & Gradients**: Substituir sombras padrão por `soft shadows` dispersas e gradientes lineares sutis que guiam o olhar para CTAs importantes.

### 2. Tipografia e Ritmo Visual
- **Hierarquia**: Aumentar o contraste entre os títulos em `Bebas Neue` (Display) e o corpo de texto em `Barlow`.
- **Grade 8pt**: Ajustar paddings e margens em todos os componentes para garantir um ritmo visual consistente e evitar elementos "apertados".
- **Bento Grids**: Reestruturar o dashboard e a visualização de estatísticas usando layouts modulares modernos.

### 3. Motion & Micro-interações
- **Transições Suaves**: Adicionar `hover effects` com `cubic-bezier` em cards e botões.
- **Entradas Escalocadas**: Implementar animações de fade-in/slide-up sincronizadas em listas e grids de dados.

## Detalhes Técnicos

### Componentes a serem atualizados:
- `src/styles.css`: Revisar tokens de design e adicionar utilitários de animação e glassmorphism.
- `src/components/StatCard.tsx`: Novo design mais limpo, possivelmente com ícones integrados ao fundo do card.
- `src/routes/index.tsx`: Reorganização completa do dashboard em uma Bento Grid premium.
- `src/components/AppShell.tsx`: Refinar o sidebar com efeitos de transparência e transições de hover mais suaves.
- `src/components/PlayerAvatar.tsx`: Adicionar bordas gradientes e sombras internas para um look mais "cards de jogo".

### Novas funcionalidades visuais:
- **Skeleton Loaders Premium**: Carregamento visual elegante enquanto os dados do Supabase são buscados.
- **Empty States**: Ilustrações minimalistas ou ícones estilizados para seções sem dados.
