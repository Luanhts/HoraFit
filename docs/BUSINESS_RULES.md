# Regras comerciais - A Hora Fit

**Natureza:** regras permanentes aprovadas e comportamento comercial vigente
**Última consolidação:** 20/11/2026

Este documento é a fonte de verdade para invariantes comerciais. Detalhes de implementação pertencem à documentação técnica. Ausências, propostas e decisões ainda não tomadas estão em [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Princípios de autoridade

- O navegador não é fonte confiável de preço, total, estoque, pagamento ou permissão.
- Regras comerciais devem ser validadas no backend e, quando possível, reforçadas por constraints e transações no banco.
- Uma funcionalidade existente no código comprova implementação, mas não autoriza inventar políticas comerciais.
- Detalhes ainda não aprovados de pagamento, recebimento, taxas, reembolso, retenção ou reserva de estoque exigem decisão do responsável.

## Catálogo

### Regras permanentes

- Produto inexistente ou inativo não pode ser vendido.
- Produto sem estoque suficiente não pode ser vendido acima do saldo disponível.
- Quantidades devem ser números inteiros positivos.
- Preços devem ser positivos e representados de forma monetária exata.
- Alterações de catálogo não podem mudar quantidades ou valores históricos de itens já vendidos.
- Produtos com referências históricas devem ser preservados; prefira inativação a exclusão física.

### Implementação verificada

- A API pública de produtos retorna ativos e inativos; a loja filtra inativos antes de exibi-los.
- A criação do pedido revalida no backend existência, status ativo e estoque.
- O SKU é único no banco.
- O endpoint administrativo ainda permite exclusão física, sujeita à restrição da FK quando há item de pedido.

## Carrinho

### Regras permanentes

- O carrinho no navegador é conveniência de interface, não registro comercial.
- Preço, nome e estoque persistidos no cliente devem ser revalidados antes da conclusão comercial.
- Mudanças de preço ou disponibilidade devem gerar feedback claro e permitir correção do carrinho.
- O carrinho não deve ser esvaziado antes da confirmação correspondente do backend.

### Implementação verificada

- O carrinho usa `localStorage` e armazena dados do produto para apresentação.
- O checkout envia ao backend somente IDs e quantidades dos produtos, além dos dados de contato.
- O formato persistido no navegador não possui validação runtime.

## Checkout e valores

### Regras permanentes

- O servidor deve obter os preços vigentes do banco e calcular subtotal e total.
- Valores fornecidos pelo cliente não devem ser aceitos como fonte de verdade.
- Dinheiro deve usar Decimal ou centavos inteiros durante todo o cálculo; ponto flutuante não deve introduzir divergências.
- Duplo clique, retry ou falha de rede não devem criar pedidos ou cobranças duplicados.
- A interface só pode exibir sucesso depois de confirmação verificável do backend.
- Descontos, valores de taxas e regras de frete só podem ser incluídos após aprovação específica.

### Implementação verificada

- O backend ignora preços do navegador, busca o preço do produto e grava `unitPrice`, `subtotal` e `total`.
- O armazenamento e o cálculo intermediário de `unitPrice`, `subtotal` e `total` usam Decimal. Pedidos cujo subtotal ou total exceda `Decimal(10,2)` são rejeitados antes da criação.
- O checkout envia chave idempotente por tentativa; o backend persiste o resultado na mesma transação do pedido. Clientes legados sem header ainda não têm essa proteção.
- A tela de confirmação aparece somente após `POST /api/orders` retornar `201` com ID válido. Isso confirma o registro do pedido, não um pagamento. Ainda não existe consulta pública para rever a confirmação depois de recarregar a página.

## Pagamento e recebimento

### Regras aprovadas

- O pagamento será online e integrado, com PIX e cartão.
- O pedido deve registrar o estado financeiro separadamente do andamento operacional.
- As modalidades de recebimento serão retirada na loja, entrega local em Ponta Grossa e envio nacional.
- A loja será responsável pela execução da logística.
- O sistema não contratará transportadoras, calculará rotas, gerenciará entregadores nem automatizará despachos.
- O sistema deve registrar pagamentos, dados de recebimento, andamento das mercadorias, cancelamentos e pendências operacionais.
- Dados de cartão e CVV não devem ser armazenados nem trafegar pelos contratos próprios da Hora Fit.
- Retornos do navegador não comprovam pagamento; a confirmação deve vir de fonte verificável no backend.

### Implementação verificada

- Pagamento, modalidade, endereço, taxa, rastreio, webhook e reconciliação ainda não existem no schema ou na aplicação.
- O provedor de pagamento ainda não foi escolhido.
- O plano técnico está em [COMMERCE_EVOLUTION_PLAN.md](COMMERCE_EVOLUTION_PLAN.md).

## Pedidos e estoque

### Regras permanentes

- Pedido, itens e movimentação de estoque devem permanecer consistentes e atômicos.
- O estoque nunca pode ficar negativo, inclusive sob requisições concorrentes.
- Itens repetidos no payload devem representar uma única necessidade agregada por produto.
- Uma falha em qualquer item deve reverter todo o pedido e todas as baixas.
- Quantidade, preço unitário e subtotal vendidos devem permanecer históricos.
- Alterações de status devem obedecer ao fluxo permitido e ser protegidas contra concorrência.

### Implementação verificada

- A criação agrega itens pelo produto.
- A transação busca produtos, valida todos os itens, baixa estoque com condição `stock >= quantity` e cria pedido/itens.
- O estoque é baixado no momento da criação pública do pedido, antes de qualquer pagamento.
- Não existe expiração automática de pedidos pendentes ou reserva temporária separada.

## Status do pedido

Os estados atuais são:

- `PENDING`: pedido registrado e ainda não confirmado operacionalmente.
- `CONFIRMED`: pedido aceito para processamento.
- `PREPARING`: pedido em preparação.
- `READY`: pedido pronto.
- `DELIVERED`: fluxo operacional concluído.
- `CANCELED`: pedido cancelado.

Transições permitidas:

| Origem | Destinos permitidos |
| --- | --- |
| `PENDING` | `CONFIRMED`, `CANCELED` |
| `CONFIRMED` | `PREPARING`, `CANCELED` |
| `PREPARING` | `READY`, `CANCELED` |
| `READY` | `DELIVERED`, `CANCELED` |
| `DELIVERED` | Nenhum |
| `CANCELED` | Nenhum |

Repetir o status atual é tratado como operação sem nova alteração. Não adicione estados financeiros a este enum sem modelar separadamente o ciclo de pagamento.

## Cancelamento

### Regras permanentes

- O cancelamento deve respeitar as transições permitidas.
- Quando a política vigente determinar reposição, cada item deve voltar ao estoque exatamente uma vez.
- Status e reposição devem estar na mesma transação.
- Retry, concorrência ou falha intermediária não podem duplicar a reposição nem deixar estado parcial.

### Implementação verificada

- Todos os cancelamentos atualmente permitidos repõem estoque.
- O backend condiciona a escrita ao status anterior, repõe itens em ordem estável e executa tudo na mesma transação.
- Pedido já cancelado retorna sem nova reposição.
- A garantia ainda não foi validada por teste automatizado contra PostgreSQL real.

## Administração

- Criação, edição ou exclusão de produtos e categorias exige autorização no backend.
- Leitura de pedidos e alteração de status exigem autorização no backend.
- Alterações de preço, estoque, status ou permissão não podem depender apenas da interface.
- Dados pessoais devem ser minimizados nas listagens e acessíveis apenas a operadores autorizados.
- Métricas financeiras futuras devem definir período, estados incluídos e conceito de receita; pedido pendente ou cancelado não é receita confirmada sem regra expressa.

## Privacidade

- Colete somente dados necessários ao atendimento do pedido.
- Não registre senhas, chaves, tokens ou dados pessoais em logs sem necessidade e proteção adequadas.
- Não envie dados pessoais a analytics sem política aprovada.
- Política de retenção, anonimização e direitos do titular ainda depende de decisão comercial/jurídica.

## Decisões comerciais pendentes

Provedor, taxas, áreas, prazos, expiração, cancelamento financeiro, reembolso, regras detalhadas de recebimento, storage, conta de cliente e retenção ainda dependem de decisões comerciais. A lista consolidada e seus impactos ficam em [PROJECT_STATUS.md](PROJECT_STATUS.md). Não decida esses pontos por preferência técnica; solicite confirmação antes de modelá-los.

## Documentos relacionados

- Implementação e camadas: [ARCHITECTURE.md](ARCHITECTURE.md)
- Contratos HTTP: [API.md](API.md)
- Integridade e transações: [DATABASE.md](DATABASE.md)
- Riscos e decisões pendentes: [PROJECT_STATUS.md](PROJECT_STATUS.md)
- Evolução comercial proposta: [COMMERCE_EVOLUTION_PLAN.md](COMMERCE_EVOLUTION_PLAN.md)
