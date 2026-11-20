# API - A Hora Fit

**Natureza:** contrato HTTP implementado e verificado no código
**Última verificação:** 15/11/2026

Este documento descreve o comportamento atual do backend NestJS e dos Route Handlers do frontend. Regras comerciais estão em [BUSINESS_RULES.md](BUSINESS_RULES.md). Propostas futuras não fazem parte deste contrato.

## Convenções gerais

- A API NestJS não possui prefixo global nem versionamento.
- A porta padrão do backend é `3333`.
- Corpos JSON e parâmetros são validados com Zod nos endpoints que recebem dados.
- Schemas de body são estritos e rejeitam campos desconhecidos.
- IDs de rota são convertidos para número e devem ser inteiros positivos.
- Respostas Prisma serializam campos Decimal de acordo com o adaptador JSON usado pelo NestJS; consumidores atuais aceitam preço como número ou string.

## Autenticação e autorização

### API administrativa do backend

Endpoints administrativos exigem:

```http
x-admin-api-key: <ADMIN_API_KEY>
```

`AdminApiKeyGuard` compara o header com a variável `ADMIN_API_KEY`. Chave ausente, inválida ou configuração ausente resulta em acesso negado. O modelo é uma chave compartilhada única, sem usuários ou papéis.

### Sessão administrativa do frontend

O navegador não recebe a chave da API. O fluxo é:

1. `POST /api/admin/login` compara a senha com `ADMIN_PASSWORD` no servidor Next.js.
2. Em sucesso, o Next.js grava cookie administrativo por oito horas.
3. `frontend/src/proxy.ts` usa o cookie para proteger `/admin/**`.
4. Route Handlers que encaminham operações administrativas validam o cookie e enviam `ADMIN_API_KEY` ao NestJS.

Proteção de página e autorização do backend são controles distintos.

## Validação e erros

O `ZodValidationPipe` retorna HTTP `400` com uma mensagem geral e uma lista de campos/mensagens quando o payload é inválido.

Códigos relevantes usados pelo contrato atual:

| Código | Situação típica |
| --- | --- |
| `200` | Consulta ou atualização bem-sucedida |
| `201` | Recurso criado pelo NestJS |
| `200` | Exclusão bem-sucedida no controller atual |
| `400` | ID, body, transição, produto ou estoque inválido |
| `401` | Chave administrativa ausente, inválida ou não configurada |
| `404` | Produto ou pedido não encontrado |
| `409` | Conflito concorrente ao atualizar status |
| `429` | Limite de criação de pedidos excedido |
| `500` | Erro interno ou configuração ausente no BFF |
| `502` | Backend indisponível para um Route Handler administrativo |

Não existe envelope único de resposta nem filtro global de exceções.

## Operação

### `GET /`

- Acesso: público.
- Retorna texto fixo da aplicação.

### `GET /health`

- Acesso: público.
- Executa `SELECT 1` no PostgreSQL.
- Retorna estado da aplicação, banco e timestamp.
- Falha do banco torna o healthcheck malsucedido.

## Produtos

### `GET /products`

- Acesso: público.
- Retorna todos os produtos com categoria.
- Inclui produtos ativos e inativos.
- Não possui paginação, filtro ou ordenação configurável.

A loja pública filtra `active` no Next.js. Consumidores diretos da API devem considerar explicitamente o campo.

### `GET /products/:id`

- Acesso: público.
- `id`: inteiro positivo.
- Retorna produto com categoria, inclusive se estiver inativo.
- Retorna `404` se não existir.

### `POST /products`

- Acesso: administrativo.
- Cria um produto.

Body:

| Campo | Regra |
| --- | --- |
| `name` | String obrigatória, trim, 1 a 120 caracteres |
| `description` | String opcional, até 5000 caracteres |
| `price` | Número coercível, positivo, máximo `99.999.999,99`, duas casas |
| `sku` | String obrigatória, trim, até 64 caracteres, única |
| `stock` | Inteiro entre 0 e `2.147.483.647`; padrão 0 |
| `categoryId` | Inteiro positivo |
| `imageUrl` | Opcional, até 2048 caracteres, vazio ou HTTP/HTTPS |
| `active` | Booleano; padrão `true` |

SKU duplicado é convertido em erro de negócio. Categoria inexistente pode propagar erro Prisma sem tradução específica.

### `PATCH /products/:id`

- Acesso: administrativo.
- `id`: inteiro positivo.
- Aceita os mesmos campos de produto, todos opcionais.
- Exige ao menos um campo.
- Produto inexistente retorna `404`.

### `DELETE /products/:id`

- Acesso: administrativo.
- Executa exclusão física.
- Produto referenciado por item de pedido é protegido pela FK e pode resultar em erro não traduzido.

## Categorias

### `GET /categories`

- Acesso: público.
- Retorna todas as categorias em ordem alfabética por nome.
- Não possui paginação.

### `POST /categories`

- Acesso: administrativo.
- Body: `{ "name": string }`.
- O nome é obrigatório, trim e limitado pelo schema Zod.
- O banco não exige unicidade do nome.

Não há endpoints de edição ou exclusão de categoria.

## Pedidos

### `POST /orders`

- Acesso: público.
- Proteção: rate limit pelo tracker observado no backend, em memória e por instância.
- Cria pedido, itens e baixa estoque na mesma transação.

Body:

| Campo | Regra |
| --- | --- |
| `customerName` | String obrigatória, trim, 1 a 120 caracteres |
| `customerPhone` | String obrigatória, trim, 8 a 30 caracteres |
| `customerEmail` | Opcional, vazio ou e-mail válido, até 254 caracteres |
| `notes` | Opcional, trim, até 2000 caracteres |
| `items` | Array de 1 a 50 linhas |
| `items[].productId` | Inteiro positivo |
| `items[].quantity` | Inteiro positivo, máximo 1000 por linha |

Comportamento comercial:

1. Normaliza e valida os dados.
2. Agrega linhas repetidas pelo produto.
3. Busca os produtos e seus preços no banco.
4. Rejeita produto inexistente, inativo ou sem estoque.
5. Baixa estoque com condição de saldo suficiente.
6. Calcula total e cria pedido/itens.

O endpoint não aceita preço, total ou status enviados pelo cliente. Não existe chave de idempotência; repetir uma tentativa pode criar outro pedido.

### `GET /orders`

- Acesso: administrativo.
- Retorna todos os pedidos por criação decrescente.
- Inclui itens, produto e categoria atuais.
- Não possui paginação ou minimização específica de dados pessoais.

### `GET /orders/:id`

- Acesso: administrativo.
- `id`: inteiro positivo.
- Retorna pedido com itens e produtos.
- Retorna `404` se não existir.

### `PATCH /orders/:id/status`

- Acesso: administrativo.
- `id`: inteiro positivo.
- Body estrito: `{ "status": OrderStatus }`.
- Aceita somente transições descritas em [BUSINESS_RULES.md](BUSINESS_RULES.md).
- Repetir o status atual retorna o pedido sem nova escrita.
- Conflito concorrente retorna `409`.
- Cancelamento permitido repõe estoque na mesma transação e apenas uma vez.

## Rate limiting

Somente `POST /orders` usa `ThrottlerGuard` no estado atual.

- Limite padrão: 10 requisições.
- Janela padrão: 60 segundos.
- Configuração: `ORDER_RATE_LIMIT_MAX` e `ORDER_RATE_LIMIT_WINDOW_MS`.
- Identificação do cliente pode considerar `TRUST_PROXY_HOPS` quando configurado.
- Armazenamento em memória não é compartilhado por réplicas.
- No fluxo normal, o navegador chama o BFF Next.js e o handler atual não encaminha o IP original. O backend pode agrupar clientes pelo IP de saída do servidor Next.js, em vez do comprador.

## Route Handlers do frontend

Base interna do Next.js:

| Método e rota | Sessão | Destino/comportamento |
| --- | --- | --- |
| `POST /api/orders` | Não | Encaminha criação para `POST /orders` |
| `POST /api/admin/login` | Não | Valida senha e cria cookie |
| `POST /api/admin/logout` | Não | Expira o cookie de forma idempotente |
| `POST /api/admin/products` | Cookie | Encaminha `POST /products` com API key |
| `PATCH /api/admin/products/:id` | Cookie | Encaminha atualização |
| `DELETE /api/admin/products/:id` | Cookie | Encaminha exclusão |
| `POST /api/admin/categories` | Cookie | Encaminha criação de categoria |
| `GET /api/admin/orders` | Cookie | Encaminha listagem de pedidos |
| `PATCH /api/admin/orders/:id/status` | Cookie | Encaminha alteração de status |

O handler público de pedidos encaminha o body bruto ao backend; a validação comercial efetiva acontece no NestJS.

## Contratos ausentes

Não existem endpoints para:

- pagamento, webhook, estorno ou reembolso;
- entrega, retirada, frete ou rastreio;
- consulta pública segura ou confirmação do pedido;
- conta ou histórico de cliente;
- upload de imagem;
- histórico de status ou movimentação de estoque.

Consulte [PROJECT_STATUS.md](PROJECT_STATUS.md) antes de propor novos contratos.

## Referências

- Controllers: `backend/src/app.controller.ts` e `backend/src/modules/*/*.controller.ts`
- Schemas: `backend/src/schemas` e `backend/src/modules/*/dto`
- Guard: `backend/src/auth/admin-api-key.guard.ts`
- BFF: `frontend/src/app/api`
- Modelo de dados: [DATABASE.md](DATABASE.md)
- Operação: [DEPLOYMENT.md](DEPLOYMENT.md)
