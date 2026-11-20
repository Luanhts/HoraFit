# Roadmap do próximo sprint - Hora Fit

> **Registro histórico:** este documento preserva a análise e o planejamento iniciados em 27/10/2026. As seções iniciais não representam necessariamente o estado atual: cancelamento com reposição atômica e throttling de `POST /orders` foram implementados posteriormente. Consulte [PROJECT_STATUS.md](PROJECT_STATUS.md) para o diagnóstico vigente e não reinterprete propostas deste arquivo como decisões comerciais aprovadas.

**Data da análise:** 27/10/2026  
**Fonte de verdade:** código do repositório  
**Escopo:** frontend Next.js, backend NestJS, Prisma, PostgreSQL, rotas, componentes, testes e prontidão operacional

## Resumo executivo

O Hora Fit possui um MVP funcional de catálogo, carrinho local, administração de produtos e criação de pedidos. O backend recalcula preços, valida produtos e desconta estoque transacionalmente.

O sistema ainda não está pronto para operar como um e-commerce completo porque:

- pagamento, entrega e retirada não existem no modelo, API ou interface;
- cancelamentos não devolvem o estoque;
- pedidos públicos podem consumir estoque sem pagamento ou proteção contra abuso;
- não há idempotência, portanto retries podem duplicar pedidos e baixas de estoque;
- a confirmação pode ser simulada acessando `/checkout?pedido=qualquer-valor`;
- os testes não cobrem uma compra válida contra PostgreSQL real;
- privacidade, monitoramento, SEO e acessibilidade ainda têm lacunas de produção.

## Primeira tarefa recomendada

**Corrigir o cancelamento com reposição atômica e exatamente uma vez.**

O estoque é decrementado em `backend/src/modules/orders/orders.service.ts:106`, mas o cancelamento apenas atualiza o status em `backend/src/modules/orders/orders.service.ts:197`. Esse defeito causa perda direta de disponibilidade comercial e deve ser resolvido antes da integração de pagamento.

A correção deverá garantir:

- reposição de todos os itens na mesma transação do cancelamento;
- nenhuma reposição duplicada em retries;
- controle de concorrência sobre o status anterior;
- rollback completo se qualquer atualização falhar;
- testes de cancelamento repetido e concorrente.

## Arquitetura atual

### Backend

O backend registra módulos de produtos, categorias e pedidos. Também possui uma rota de healthcheck.

O banco contém somente os modelos `Product`, `Category`, `Order` e `OrderItem`, definidos em `backend/prisma/schema.prisma:14-82`.

| Área | Rotas existentes |
|---|---|
| Produtos | `GET /products`, `GET /products/:id`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` |
| Categorias | `GET /categories`, `POST /categories` |
| Pedidos | `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` |
| Operação | `GET /health` |

As mutações administrativas e as leituras de pedidos usam `AdminApiKeyGuard`. A criação de pedido é pública.

### Frontend

Rotas públicas existentes:

- `/`;
- `/produtos`;
- `/produtos/[id]`;
- `/carrinho`;
- `/checkout`;
- `/sobre`;
- `/contato`.

Rotas administrativas existentes:

- `/admin`;
- `/admin/produtos`;
- `/admin/pedidos`.

O link `/perfil` existe em `frontend/src/components/shop/Navbar.tsx:70`, mas não existe uma rota correspondente.

## Funcionalidades confirmadas

As seguintes funcionalidades existem no código e possuem integração real:

- listagem pública e detalhamento de produtos;
- carrinho persistido em `localStorage`;
- criação de pedido no backend;
- recálculo do preço pelo backend;
- baixa condicional de estoque dentro de transação Prisma;
- listagem administrativa de produtos e pedidos;
- criação, edição e exclusão de produtos;
- filtros locais de produtos no painel;
- busca e filtros locais de pedidos no painel;
- alteração validada do status do pedido;
- listagem e criação de categorias pela API;
- autenticação administrativa básica por senha, cookie e API key;
- healthcheck com consulta ao PostgreSQL.

## Estado das frentes revisadas

| Frente | Estado | Evidência e observação |
|---|---|---|
| Catálogo e produto | Parcial | Dados reais, estoque e carrinho; sem busca, filtros, ordenação ou paginação pública |
| Carrinho | Parcial | Persiste localmente; não revalida preço/estoque e não valida o formato armazenado |
| Criação de pedido | Parcial robusto | Preço recalculado e estoque descontado em transação |
| Pagamento | Ausente | Nenhum modelo, status financeiro, gateway, webhook ou interface |
| Entrega e retirada | Ausente | Nenhuma modalidade, endereço, frete, local ou janela |
| Confirmação | Frágil | Confia apenas no parâmetro `pedido` da URL |
| Cancelamento | Defeituoso | Altera status sem devolver estoque |
| Reposição | Ausente | Somente edição manual do valor absoluto do produto |
| Upload de imagens | Ausente | O seletor somente executa `console.log`; a operação real usa URL |
| Categorias | Parcial | Backend lista/cria; não há tela, edição, exclusão ou unicidade |
| Pedidos administrativos | Parcial | Lista, filtros locais, detalhe inline e mudança de status |
| Histórico de status | Ausente | Somente status atual e `updatedAt` |
| Pedidos do cliente | Ausente | Sem histórico, detalhe ou cancelamento seguro |
| Testes | Insuficiente | Testes HTTP usam Prisma mockado; frontend não possui testes |
| SEO | Insuficiente | Sem sitemap, robots, canonical, Open Graph, JSON-LD ou metadata de produto |
| Responsividade | Parcial | Loja razoável; menu mobile ausente e admin orientado a desktop |
| Acessibilidade | Parcial | `lang="en"`, botões sem nome acessível e modais sem gestão de foco |
| Privacidade | Ausente | Dados pessoais persistidos sem aviso, retenção ou canal do titular |
| Monitoramento | Mínimo | `/health` e `console.*`; sem correlação, métricas ou alertas |

## Pontos bem implementados

- O preço do pedido é obtido do banco, não do navegador.
- A baixa de estoque usa a condição `stock >= quantity`.
- A criação do pedido ocorre dentro de uma transação Prisma.
- Os DTOs usam Zod estrito e rejeitam campos desconhecidos.
- As rotas administrativas do backend possuem guard.
- O cookie administrativo usa `httpOnly`, `sameSite` e `secure` em produção.
- Produtos e pedidos administrativos integram o backend real.
- Existe healthcheck com consulta ao PostgreSQL.
- O Dockerfile do backend usa build multi-stage e usuário não root.

## Riscos confirmados

### P0 - antes da operação real

| Risco | Impacto | Evidência |
|---|---|---|
| Cancelamento sem reposição | Estoque artificialmente baixo e venda perdida | `backend/src/modules/orders/orders.service.ts:106-126` e `:197-206` |
| Pedidos falsos esgotam estoque | Indisponibilidade do catálogo sem receita | `backend/src/modules/orders/orders.controller.ts:24-30` |
| Pedidos duplicados | Dupla baixa e atendimento duplicado | Não há chave idempotente em `backend/prisma/schema.prisma:44-59` |
| Corrida na atualização de status | Estado terminal pode ser sobrescrito | `backend/src/modules/orders/orders.service.ts:182-206` |
| Confirmação não confiável | Interface informa sucesso sem validar o pedido | `frontend/src/app/(shop)/checkout/page.tsx:59-70` |
| Pagamento e fulfillment ausentes | Bloqueio comercial para e-commerce completo | Ausência no schema, módulos e checkout |

### P1 - próximo ciclo de evolução

- exclusão física de produto usado em pedido pode gerar erro de chave estrangeira não tratado;
- pedidos históricos mostram nome, categoria e imagem atuais do produto;
- categorias duplicadas são permitidas;
- produtos inativos continuam expostos na API pública;
- listagens não possuem paginação;
- falhas no admin são apresentadas como listas vazias;
- upload aparece visualmente disponível, mas não funciona;
- administração não possui usuários, papéis ou auditoria;
- não existe histórico de estoque ou de status.

## Backlog priorizado

| Item | Impacto comercial | Prioridade | Risco técnico | Dependências |
|---|---|---:|---:|---|
| Cancelamento e reposição atômica | Crítico | P0 | Alto | Política de estoque |
| Controle concorrente de status | Crítico | P0 | Alto | Mesma transação do cancelamento |
| Idempotência do checkout | Crítico | P0 | Alto | Migration e contrato HTTP |
| Proteção contra abuso de pedidos | Crítico | P0 | Médio | Infraestrutura ou rate limiter |
| Testes com PostgreSQL real | Crítico | P0 | Médio | Banco isolado de teste |
| Pagamento | Crítico | P0 | Alto | Gateway, fulfillment e ciclo do pedido |
| Entrega/retirada | Crítico | P0 | Alto | Regras comerciais e composição do total |
| Confirmação e acompanhamento seguro | Alto | P0 | Médio | Token público não enumerável |
| Privacidade e retenção de dados | Alto | P0 | Médio | Aprovação jurídica e comercial |
| Histórico e filtros de pedidos | Alto | P1 | Médio | Modelo de eventos e índices |
| Reposição e movimentação de estoque | Alto | P1 | Alto | Ledger e identidade do operador |
| Busca, filtros e ordenação do catálogo | Alto | P1 | Médio | Query DTOs, paginação e índices |
| Upload de imagens | Alto | P1 | Médio | Escolha do storage e lifecycle |
| Gestão completa de categorias | Médio | P1 | Baixo | Política de exclusão e unicidade |
| SEO e dados estruturados | Médio | P1 | Baixo | URL pública e catálogo estável |
| Acessibilidade e mobile | Médio | P1 | Baixo | Testes de navegador |
| Observabilidade e auditoria | Alto | P1 | Médio | Plataforma de deploy |
| Autenticação individual do admin | Alto | P2 | Alto | Modelo de usuários ou provedor |

## Sprint proposto

**Tema:** pedidos e estoque confiáveis  
**Capacidade de referência:** um desenvolvedor full stack, dez dias úteis

### HF-01 - Cancelamento atômico e concorrência

**Status:** implementada em 27/10/2026; validação com PostgreSQL real permanece na HF-02.

**Arquivos envolvidos:**

- `backend/src/modules/orders/orders.service.ts`;
- `backend/src/modules/orders/orders.service.spec.ts`;
- `backend/test/app.e2e-spec.ts`.

**Critérios de aceite:**

- cancelar devolve cada quantidade exatamente uma vez;
- repetir a operação não duplica a reposição;
- atualizações concorrentes não retiram o pedido de um estado terminal;
- uma falha intermediária reverte status e estoque;
- transições inválidas continuam retornando erro de negócio.

**Testes:**

- cancelamento em cada status permitido;
- cancelamento repetido;
- duas requisições concorrentes;
- rollback quando um item não pode ser atualizado.

### HF-02 - Integração com PostgreSQL real

**Arquivos envolvidos:**

- novo `backend/test/orders.integration-spec.ts`;
- novo `backend/test/jest-integration.json`;
- `backend/package.json`;
- `backend/.env.example`.

**Critérios de aceite:**

- a suite usa banco descartável e nunca usa produção;
- migrations são aplicadas no banco de teste;
- pedido válido persiste itens e reduz estoque;
- falha em um item não deixa baixa parcial;
- o banco é limpo de forma determinística entre os testes.

**Testes:**

- pedido válido;
- preço autoritativo do banco;
- item repetido no payload;
- produto inativo;
- estoque insuficiente;
- rollback transacional;
- compras concorrentes.

Jest, Prisma e PostgreSQL já estão disponíveis. Nenhuma biblioteca nova é obrigatória para esta tarefa.

### HF-03 - Idempotência do checkout

**Arquivos envolvidos:**

- `backend/prisma/schema.prisma`;
- nova migration;
- `backend/src/modules/orders/dto/create-order.dto.ts`;
- `backend/src/modules/orders/orders.service.ts`;
- `frontend/src/app/(shop)/checkout/page.tsx`;
- `frontend/src/app/api/orders/route.ts`.

**Critérios de aceite:**

- cada tentativa envia uma chave idempotente;
- repetir a chave retorna o mesmo pedido;
- o estoque é reduzido somente uma vez;
- chaves diferentes continuam criando pedidos diferentes;
- a migration é validada somente em banco de desenvolvimento/teste antes do deploy.

**Testes:**

- retry sequencial;
- requests simultâneos com a mesma chave;
- chave ausente ou inválida;
- duas chaves distintas.

### HF-04 - Confirmação segura do pedido

**Arquivos envolvidos:**

- `backend/prisma/schema.prisma`;
- `backend/src/modules/orders/orders.controller.ts`;
- `backend/src/modules/orders/orders.service.ts`;
- nova rota `frontend/src/app/(shop)/checkout/sucesso/page.tsx`.

**Critérios de aceite:**

- o pedido recebe token público aleatório e não enumerável;
- um ID sequencial isolado não permite consulta pública;
- a confirmação consulta o backend antes de exibir sucesso;
- a resposta pública não expõe telefone, e-mail ou observações;
- token inexistente apresenta estado de erro, não confirmação.

**Testes:**

- consulta com token válido;
- token inválido;
- tentativa de consulta somente por ID;
- validação de ausência de dados pessoais na resposta.

### HF-05 - Proteção contra abuso

**Arquivos prováveis:**

- `backend/src/app.module.ts`;
- `backend/src/modules/orders/orders.controller.ts`;
- configuração do ingress ou proxy, se existente.

**Critérios de aceite:**

- existe limite específico para criação de pedidos;
- excesso retorna HTTP `429`;
- healthcheck e rotas administrativas não compartilham o mesmo limite;
- limites e janela são configuráveis por ambiente;
- a política é coberta por teste HTTP.

Se a infraestrutura não oferecer rate limiting, `@nestjs/throttler` é uma dependência justificável. Ela não deve ser instalada antes dessa decisão.

### HF-06 - E2E do fluxo crítico

**Arquivos envolvidos:**

- novo `frontend/playwright.config.ts`;
- novo `frontend/e2e/checkout.spec.ts`;
- `frontend/package.json`.

**Critérios de aceite:**

- teste cobre catálogo, carrinho, checkout e confirmação;
- teste confirma persistência do carrinho após reload;
- teste administrativo confirma alteração de status;
- execução usa banco e credenciais exclusivamente de teste;
- existe script não interativo para execução local e futura CI.

A instalação do Playwright é justificável porque o projeto não possui runner de navegador.

### HF-07 - Decisão de pagamento e fulfillment

**Arquivo planejado:**

- novo `docs/adr-order-payment-fulfillment.md`.

**Critérios de aceite:**

- definir entrega, retirada ou ambas;
- definir endereço, região, taxa e prazo;
- definir gateway e métodos de pagamento;
- definir quando o estoque é reservado ou baixado;
- definir expiração, falha, cancelamento e reembolso;
- separar estados financeiros de estados operacionais;
- definir o comportamento de webhooks repetidos ou fora de ordem.

Essa decisão prepara o sprint seguinte sem consolidar prematuramente um modelo incorreto.

## Próximos incrementos

Após o sprint de confiabilidade:

1. modelar entrega, retirada e composição financeira do pedido;
2. integrar pagamento e webhooks idempotentes;
3. implementar histórico de status e movimentação de estoque;
4. adicionar filtros e paginação server-side;
5. implementar upload com storage definido;
6. concluir gestão administrativa de categorias;
7. adicionar consulta e cancelamento seguro pelo cliente;
8. concluir SEO, acessibilidade, privacidade e observabilidade.

## Decisões pendentes

Os itens abaixo são hipóteses ou requisitos ainda não definidos pelo código:

- não está definido se o pagamento atual ocorre fora do sistema;
- não está definido se todos os pedidos são retirados no local;
- não está definido qual gateway será usado;
- não está definido qual storage hospedará imagens;
- não está definido se clientes terão conta ou somente token de acompanhamento;
- não existe política definida de retenção e anonimização de pedidos;
- o volume esperado de catálogo e pedidos é desconhecido.

## Restrições desta análise

- Nenhuma dependência foi instalada.
- Nenhuma migration foi criada ou aplicada.
- Nenhum banco de produção foi acessado ou modificado.
- Durante a auditoria inicial, as conclusões foram baseadas em inspeção estática do código.

## Registro de execução

### 27/10/2026 - HF-01

- A mudança de status passou a ocorrer dentro de transação Prisma.
- A escrita agora é condicionada ao status anterior para detectar concorrência.
- O cancelamento repõe os itens na mesma transação.
- Repetir o cancelamento não repõe o estoque novamente.
- Os produtos são atualizados em ordem estável para reduzir locks em ordem divergente.
- Foram adicionados testes unitários e HTTP para reposição, repetição e conflito.
- Foram executados 9 testes unitários, 22 testes HTTP, ESLint sem correção automática e build do backend.
- Concorrência e rollback contra PostgreSQL real continuam pendentes na HF-02.
