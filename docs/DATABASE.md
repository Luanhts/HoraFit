# Banco de dados - A Hora Fit

**Natureza:** estado do schema, migrations e integridade verificados
**Última verificação:** 15/11/2026

O backend usa Prisma ORM 6.19.3 com PostgreSQL. O schema está em `backend/prisma/schema.prisma` e a conexão usa `DATABASE_URL`.

Regras comerciais estão em [BUSINESS_RULES.md](BUSINESS_RULES.md). Procedimentos operacionais de migration estão em [DEPLOYMENT.md](DEPLOYMENT.md).

## Modelos

### `Category` -> `categories`

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | `Int` | PK autoincremental |
| `name` | `String` | Obrigatório |
| `products` | `Product[]` | Relação 1:N |

Limitações:

- Nome não é único.
- Não possui timestamps, slug ou status ativo.

### `Product` -> `products`

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | `Int` | PK autoincremental |
| `name` | `String` | Obrigatório |
| `description` | `String?` | Texto opcional |
| `price` | `Decimal(10,2)` | Obrigatório |
| `sku` | `String` | Único |
| `stock` | `Int` | Padrão 0 |
| `imageUrl` | `String?` | Opcional |
| `active` | `Boolean` | Padrão `true` |
| `createdAt` | `DateTime` | Padrão `now()` |
| `updatedAt` | `DateTime` | Atualizado pelo Prisma |
| `categoryId` | `Int` | FK obrigatória |
| `category` | `Category` | N:1 |
| `orderItems` | `OrderItem[]` | 1:N |

### `Order` -> `orders`

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | `Int` | PK autoincremental |
| `customerName` | `String` | Obrigatório |
| `customerPhone` | `String` | Obrigatório |
| `customerEmail` | `String?` | Opcional |
| `notes` | `String?` | Texto opcional |
| `status` | `OrderStatus` | Padrão `PENDING` |
| `total` | `Decimal(10,2)` | Obrigatório |
| `createdAt` | `DateTime` | Padrão `now()` |
| `updatedAt` | `DateTime` | Atualizado pelo Prisma |
| `items` | `OrderItem[]` | 1:N |

Não possui chave idempotente, token público, cliente autenticado, campos financeiros ou campos de entrega.

### `OrderItem` -> `order_items`

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | `Int` | PK autoincremental |
| `orderId` | `Int` | FK obrigatória |
| `productId` | `Int` | FK obrigatória |
| `quantity` | `Int` | Obrigatória |
| `unitPrice` | `Decimal(10,2)` | Preço histórico |
| `subtotal` | `Decimal(10,2)` | Subtotal histórico |
| `order` | `Order` | N:1, `onDelete: Cascade` |
| `product` | `Product` | N:1, deleção restrita pelo banco |

Não há unicidade composta em `(orderId, productId)`. O service agrega itens repetidos antes de persistir.

## Enum `OrderStatus`

```text
PENDING
CONFIRMED
PREPARING
READY
DELIVERED
CANCELED
```

O significado e as transições estão em [BUSINESS_RULES.md](BUSINESS_RULES.md).

## Relacionamentos e deleção

- `Category 1:N Product`: produto exige categoria; categoria referenciada não pode ser removida pelo banco.
- `Product 1:N OrderItem`: item exige produto; produto vendido não pode ser removido enquanto referenciado.
- `Order 1:N OrderItem`: exclusão do pedido remove os itens por cascade.

Não existe endpoint de exclusão de pedido. O endpoint de produto executa exclusão física e pode encontrar conflito de FK não traduzido.

## Constraints e índices existentes

Existem:

- PK autoincremental em todos os modelos;
- índice único em `products.sku`;
- FKs dos relacionamentos.

Não existem no schema/migrations:

- `CHECK stock >= 0`;
- `CHECK price > 0`;
- `CHECK quantity > 0`;
- validação de coerência entre subtotal, total e itens;
- unicidade do nome da categoria;
- unicidade de produto por pedido;
- índices explícitos em `products.categoryId`, `order_items.orderId` ou `order_items.productId`;
- índices em `orders.status` ou `orders.createdAt`.

PostgreSQL não cria automaticamente índice para toda FK. As regras de domínio atuais dependem principalmente da aplicação.

## Migrations

### `20251207132904_init`

Arquivo: `backend/prisma/migrations/20251207132904_init/migration.sql`.

Cria:

- tabelas `categories` e `products`;
- PKs;
- unicidade do SKU;
- FK obrigatória de produto para categoria com deleção restrita.

### `20260805000000_add_orders`

Arquivo: `backend/prisma/migrations/20260805000000_add_orders/migration.sql`.

Cria:

- enum `OrderStatus`;
- tabelas `orders` e `order_items`;
- PKs;
- FK de item para pedido com cascade;
- FK de item para produto com deleção restrita.

O schema atual é compatível com essas duas migrations. Nunca edite migrations já aplicadas.

## Transação de criação do pedido

`backend/src/modules/orders/orders.service.ts` executa o fluxo dentro de `$transaction`:

1. Agrega quantidades por produto.
2. Busca todos os produtos.
3. Valida existência, atividade e estoque observado.
4. Calcula preços com dados do banco.
5. Executa `updateMany` por produto com `active: true` e `stock >= quantity`.
6. Decrementa o estoque atomicamente.
7. Cria pedido e itens.

Se qualquer etapa falhar, a transação é revertida. A condição de atualização impede saldo negativo pelo fluxo da API sob concorrência.

Na criação, os itens agregados são ordenados por `productId` antes das baixas condicionais. Requisições com carrinhos em ordens diferentes adquirem locks dos produtos na mesma sequência, reduzindo o risco de deadlock. Ainda não há retry explícito de deadlock nem teste de concorrência contra PostgreSQL real.

## Transação de status e cancelamento

- A escrita do novo status é condicionada ao status anterior.
- Conflito concorrente impede prosseguir com uma visão obsoleta.
- No cancelamento, itens são ordenados por `productId` e o estoque é reposto na mesma transação.
- Pedido já cancelado não repõe novamente.
- Falha de reposição reverte status e estoque.

Os testes atuais simulam esse comportamento com Prisma mockado; não há validação automatizada contra PostgreSQL real.

## Representação monetária

- Banco: `Decimal(10,2)` para preço, subtotal e total.
- Service atual: converte Decimal para `number`, multiplica e arredonda antes da persistência.

O cálculo intermediário em ponto flutuante é uma limitação conhecida. Código novo não deve ampliar essa abordagem; consulte [PROJECT_STATUS.md](PROJECT_STATUS.md).

## PrismaService

`backend/prisma/prisma.service.ts` estende `PrismaClient`, conecta em `onModuleInit` e desconecta em `onModuleDestroy`.

O service é provido no módulo raiz e novamente em Products, Categories e Orders. Isso pode criar mais de um PrismaClient e mais conexões por processo.

## Seed

`backend/prisma/seed.ts`:

- procura ou cria categorias por nome;
- faz upsert de produtos por SKU;
- não apaga produtos ou pedidos;
- não atualiza produtos já existentes.

Como categoria não possui unicidade, execuções concorrentes podem criar nomes duplicados. Seed altera dados e exige ambiente e autorização confirmados.

## Procedimento para mudanças

Toda mudança de schema deve incluir:

1. Leitura do schema e de todas as migrations relacionadas.
2. Avaliação dos dados existentes e compatibilidade entre versões.
3. Migration nova e versionada; nunca alteração retroativa.
4. Estratégia de backfill quando necessário.
5. Estratégia de rollback da aplicação e, quando aplicável, restauração validada de backup.
6. Teste em banco isolado, nunca produção.
7. Atualização de [API.md](API.md), [BUSINESS_RULES.md](BUSINESS_RULES.md), [DEPLOYMENT.md](DEPLOYMENT.md) e [PROJECT_STATUS.md](PROJECT_STATUS.md) conforme o impacto.

## Limitações conhecidas

- Regras comerciais sem `CHECK` no banco.
- Poucos índices para crescimento de volume.
- Ausência de idempotência.
- Ausência de pagamento, entrega, histórico de status e movimentação de estoque.
- Metadados do produto em pedidos são consultados do produto atual; somente valores financeiros ficam congelados no item.
- Não há testes de migration, rollback, locks ou concorrência contra PostgreSQL real.
