# Arquitetura - A Hora Fit

**Natureza:** estado técnico verificado no código
**Última verificação:** 15/11/2026

Este documento descreve a implementação atual. Ele não transforma limitações ou ideias futuras em regras aprovadas. Regras comerciais estão em [BUSINESS_RULES.md](BUSINESS_RULES.md) e lacunas/prioridades em [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Visão geral

A Hora Fit é composta por duas aplicações independentes e um banco PostgreSQL:

```text
Navegador
  -> Next.js (loja, admin e Route Handlers)
  -> NestJS (API e regras de negócio)
  -> Prisma
  -> PostgreSQL
```

- O navegador mantém estado de interface e carrinho, mas não é fonte confiável de preço, estoque ou permissão.
- Server Components do Next.js consultam a API diretamente para renderização inicial.
- Route Handlers do Next.js funcionam como BFF para login, operações administrativas e criação de pedidos a partir do navegador.
- O NestJS valida payloads, autoriza operações administrativas e concentra regras de catálogo, pedidos e estoque.
- O Prisma persiste os dados e executa as transações comerciais.

## Stack verificada

| Camada | Tecnologia |
| --- | --- |
| Frontend | Next.js 16.4.6, React 19.2.0 e TypeScript 5.9.3 |
| UI | Tailwind CSS 4.1.17, Radix UI, componentes no padrão shadcn/ui, Lucide e Sonner |
| Formulários | React Hook Form 7.71.2 e Zod 4.3.6 |
| Backend | NestJS 11.2.9, TypeScript 5.9.3, Zod 4.6.7 e `@nestjs/throttler` 6.7.1 |
| Persistência | Prisma ORM 6.19.3 e PostgreSQL |
| Runtime Docker | Node.js 22 Alpine e npm 11.9.0 no backend |

O frontend está documentado como publicado na Vercel, mas não existe configuração Vercel versionada. O provedor do backend não é identificável no repositório.

## Estrutura do repositório

```text
HoraFit/
├── AGENTS.md
├── README.md
├── .claude/                   # Skills auxiliares
├── backend/
│   ├── prisma/                # Schema, PrismaService, seed e migrations
│   ├── src/
│   │   ├── auth/              # Guard administrativo
│   │   ├── common/pipes/      # Pipe Zod
│   │   ├── modules/           # Products, Categories e Orders
│   │   └── schemas/           # Schemas compartilhados de validação
│   ├── test/                  # Testes HTTP com Prisma mockado
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── actions/           # Server Action residual de produto
│   │   ├── app/               # App Router e Route Handlers
│   │   ├── components/        # Loja, admin e UI
│   │   ├── features/cart/     # Estado do carrinho
│   │   ├── lib/               # API, autenticação e proxy admin
│   │   ├── types/             # Tipos de produto e pedido
│   │   └── proxy.ts           # Proteção de /admin
│   └── package.json
├── docs/
└── docker-compose.yml         # Somente PostgreSQL local
```

Não há pacote npm, workspace ou script de orquestração na raiz. Também não há configuração de CI versionada.

## Frontend

### Organização e renderização

- Usa exclusivamente o App Router em `frontend/src/app`.
- O grupo `frontend/src/app/(shop)` aplica `CartProvider`, navbar e rodapé à loja pública.
- Server Components carregam home, catálogo, detalhe de produto e dados iniciais do admin.
- Client Components concentram formulários, carrinho, filtros e interações.
- Home, catálogo, detalhe, produtos administrativos e pedidos administrativos usam renderização dinâmica e chamadas sem cache.
- Não existem arquivos específicos `loading.tsx`, `error.tsx` ou `not-found.tsx`.

### Rotas de interface

| Área | Rotas |
| --- | --- |
| Loja | `/`, `/produtos`, `/produtos/[id]`, `/carrinho`, `/checkout`, `/sobre`, `/contato`, `/perfil` |
| Autenticação | `/sign-in` |
| Administração | `/admin`, `/admin/produtos`, `/admin/pedidos` |

`/perfil` é uma página pública informativa. Ainda não há conta autenticada, dados pessoais ou histórico de compras nessa rota.

### Acesso à API

- `frontend/src/lib/api.ts` resolve a URL da API, preferindo `API_URL` e usando `NEXT_PUBLIC_API_URL` como fallback.
- `frontend/src/lib/admin-api.ts` valida a sessão administrativa, adiciona `ADMIN_API_KEY` somente no servidor e encaminha requisições ao backend.
- Route Handlers em `frontend/src/app/api` recebem chamadas do navegador. O inventário está em [API.md](API.md).
- Tipos em `frontend/src/types` descrevem respostas em compile time, mas não há validação runtime das respostas da API.

### Carrinho

O carrinho em `frontend/src/features/cart` usa `localStorage`, `useSyncExternalStore` e eventos para sincronização na mesma aba e entre abas. O formato persistido não é validado por schema runtime. Nome, preço e estoque armazenados servem apenas para a interface; o backend recebe produto e quantidade no checkout.

### Configuração

- TypeScript com `strict: true`.
- `frontend/next.config.ts` permite imagens HTTPS de qualquer hostname.
- O documento HTML declara `lang="en"`, apesar do conteúdo em pt-BR.
- Metadata global é genérica; não há sitemap, robots ou metadata dinâmica de produto.
- Não há suíte ou script de testes no frontend.

## Backend

### Bootstrap e módulos

- `backend/src/main.ts` cria uma aplicação Nest Express, configura opcionalmente `trust proxy`, habilita CORS sem allowlist e escuta `PORT` ou `3333`.
- Não há prefixo global nem versionamento da API.
- `backend/src/app.module.ts` registra `ThrottlerModule`, `ProductsModule`, `CategoriesModule` e `OrdersModule`.
- Controllers são finos e services concentram as regras.
- Schemas Zod estritos e `ZodValidationPipe` validam bodies e IDs nas fronteiras.
- Não há filtro global de exceções, Helmet, Swagger, filas, cache ou jobs.

### Módulos

| Módulo | Responsabilidade |
| --- | --- |
| Products | CRUD de produtos e inclusão da categoria nas respostas |
| Categories | Listagem e criação de categorias |
| Orders | Criação de pedidos, baixa/reposição de estoque e transições de status |
| App | Rota raiz e healthcheck do banco |

Não existem módulos de usuários, clientes, pagamento, entrega, notificação, auditoria ou webhooks.

### Prisma

`PrismaService` fica em `backend/prisma/prisma.service.ts`, conecta no início do módulo e desconecta no encerramento. Ele está registrado no módulo raiz e novamente nos três módulos de domínio, o que pode criar múltiplas instâncias/pools por processo. O modelo de dados está detalhado em [DATABASE.md](DATABASE.md).

O TypeScript habilita `strictNullChecks`, mas mantém `noImplicitAny: false`. A configuração ESLint também é permissiva para alguns padrões inseguros.

## Autenticação e autorização atuais

### Frontend administrativo

- `frontend/src/proxy.ts` protege páginas `/admin/**`.
- O login em `/api/admin/login` compara `ADMIN_PASSWORD` no servidor.
- A sessão é um cookie derivado da senha, com duração de oito horas, `HttpOnly`, `SameSite=Lax` e `Secure` em produção.
- Não há usuário individual, papel, sessão persistida ou auditoria de operador.

### Backend administrativo

- `AdminApiKeyGuard` compara `x-admin-api-key` com `ADMIN_API_KEY`.
- Qualquer portador da chave recebe a mesma autorização administrativa.
- Não há JWT, papéis, permissões granulares, expiração ou revogação individual.

A autenticação de página do Next.js e a autorização da API são camadas distintas. Os endpoints protegidos estão em [API.md](API.md).

## Responsabilidades das camadas

- Frontend: apresentação, navegação, formulários e estado local; nunca decide preço, estoque, pagamento ou permissão.
- Backend: validação, autorização, regras de negócio, cálculo de total e coordenação transacional.
- Banco: persistência, integridade relacional, constraints e atomicidade.
- Infraestrutura: configuração de ambiente, conectividade, migrations, disponibilidade e proteção compartilhada contra abuso.

## Documentos relacionados

- Contratos HTTP: [API.md](API.md)
- Regras comerciais: [BUSINESS_RULES.md](BUSINESS_RULES.md)
- Banco e migrations: [DATABASE.md](DATABASE.md)
- Operação e publicação: [DEPLOYMENT.md](DEPLOYMENT.md)
- Lacunas e prioridades: [PROJECT_STATUS.md](PROJECT_STATUS.md)
