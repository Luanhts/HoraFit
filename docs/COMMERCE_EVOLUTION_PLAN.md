# Plano de evolução comercial - Sprint 1

**Natureza:** planejamento técnico, sem implementação
**Data:** 15/11/2026
**Escopo:** pagamento online, recebimento, estoque, segurança, migrations e testes

Este documento propõe a evolução do MVP para um e-commerce com pagamento online e acompanhamento operacional. As regras aprovadas permanecem em [BUSINESS_RULES.md](BUSINESS_RULES.md); o estado implementado permanece nos demais documentos técnicos. Nada descrito como proposta deve ser tratado como funcionalidade existente.

## 1. Escopo e limites

Este plano deve preservar catálogo, carrinho, criação de pedidos, administração, baixa transacional de estoque e reposição no cancelamento já implementados.

Não fazem parte desta etapa:

- implementar código, schema, migrations ou dependências;
- escolher ou integrar um provedor de pagamento;
- definir valores, áreas, prazos, parcelamento, estorno ou reembolso;
- contratar transportadoras, calcular rotas, gerenciar entregadores ou automatizar despachos;
- executar operações em produção.

O Mercado Pago Checkout Pro é apenas candidato. A arquitetura deve permanecer neutra de provedor até uma decisão explícita.

## 2. Decisões comerciais aprovadas

- O pagamento será online e integrado, com PIX e cartão.
- O recebimento terá três modalidades: retirada na loja, entrega local em Ponta Grossa e envio nacional.
- A logística será executada exclusivamente pela loja.
- O sistema não contratará transportadoras, calculará rotas, gerenciará entregadores nem automatizará despachos.
- O sistema registrará pedidos, pagamentos, dados de recebimento, andamento das mercadorias, cancelamentos e pendências operacionais.
- Estados financeiros serão independentes do andamento operacional do pedido.
- O navegador não confirmará pagamento, preço, taxa, estoque ou permissão.

## 3. Diagnóstico atual

### 3.1 Pedidos e banco

O schema atual possui `Category`, `Product`, `Order` e `OrderItem`. `Order` registra contato, observações, um único `OrderStatus`, total e timestamps. Não existem pagamento, modalidade de recebimento, endereço, rastreio, reserva explícita, histórico de status, chave idempotente ou identificador público não enumerável.

`OrderItem` preserva quantidade, preço unitário e subtotal. Nome, SKU, imagem e categoria continuam sendo obtidos do produto atual, portanto esses metadados não são históricos.

As migrations existentes criam apenas catálogo e pedidos. O banco não contém `CHECK` para saldo, quantidade ou valores, unicidade de produto por pedido nem índices explícitos para as FKs e consultas de pedido.

### 3.2 Criação e estoque

`OrdersService.create` já oferece uma base correta:

1. agrega linhas repetidas por produto;
2. busca preço e situação do produto no banco;
3. rejeita produto inexistente, inativo ou sem saldo;
4. decrementa `Product.stock` com condição `stock >= quantity`;
5. cria pedido e itens na mesma transação Prisma.

A condição da atualização impede estoque negativo pelo fluxo normal sob concorrência. Entretanto, a ordem de aquisição dos locks segue a primeira ocorrência no payload, o que pode gerar deadlocks quando pedidos concorrentes contêm os mesmos produtos em ordens diferentes.

O saldo é consumido na criação, antes de pagamento, e não há expiração. Um pedido abandonado pode reter disponibilidade indefinidamente.

### 3.3 Cancelamento

A alteração de status usa escrita condicionada ao status anterior. No cancelamento, os itens são ordenados por produto e o saldo é incrementado na mesma transação. Pedido já cancelado não repõe novamente.

Essa proteção é adequada para o fluxo atual, mas não representa reserva, pagamento, expiração, cancelamento financeiro ou devolução. Novos efeitos não devem depender somente de `Order.status`.

### 3.4 Valores

Preço, subtotal e total são `Decimal(10,2)` no PostgreSQL. O service converte o preço para `number`, multiplica, arredonda cada subtotal e acumula o total em ponto flutuante.

Os limites do DTO permitem quantidades agregadas e totais maiores que a capacidade atual de `Decimal(10,2)`. O banco também não verifica que o total equivale à soma dos itens.

### 3.5 Segurança e interface

- O checkout considera qualquer parâmetro `pedido` como confirmação e não consulta o backend.
- A criação pública não possui idempotência; retry pode duplicar pedido e baixa.
- A sessão administrativa é derivada deterministicamente da senha compartilhada.
- O backend usa uma única API key administrativa, sem operador, papel, revogação individual ou auditoria.
- O login não possui proteção específica contra força bruta.
- A listagem administrativa retorna todos os pedidos e dados pessoais sem paginação.
- O bootstrap não preserva raw body para futura verificação de assinatura.
- Não existem módulo de pagamento, webhook, reconciliação, jobs ou pendências operacionais.

### 3.6 Testes

Os testes HTTP substituem `PrismaService` por mock. Os testes unitários de pedido simulam a transação. A suíte não comprova constraints, rollback, locks, deadlocks, concorrência ou migration contra PostgreSQL real.

## 4. Princípios da evolução

1. Manter `OrderStatus` operacional e o estado financeiro em `Payment`.
2. Preservar `Order` e `OrderItem`; mudanças serão aditivas.
3. Tratar `Payment` como agregado financeiro do pedido e `PaymentAttempt` como cada tentativa PIX ou cartão.
4. Manter chamadas externas fora da transação do PostgreSQL.
5. Tornar comandos internos idempotentes e efeitos de webhook deduplicados no banco.
6. Preservar valores, modalidade, endereço e taxa como fotografias históricas.
7. Representar reserva de estoque explicitamente, sem nova baixa após pagamento.
8. Não inferir pagamento, modalidade ou entrega para pedidos legados.
9. Não receber, armazenar ou registrar número completo de cartão ou CVV.
10. Implementar primeiro as garantias independentes de provedor.

## 5. Modelo de dados proposto

Os nomes e campos abaixo são proposta técnica. A migration definitiva dependerá da auditoria dos dados e das decisões pendentes ao final deste documento.

### 5.1 Enums

| Enum | Valores iniciais propostos | Uso |
| --- | --- | --- |
| `FulfillmentMode` | `PICKUP`, `LOCAL_DELIVERY`, `NATIONAL_SHIPPING` | Modalidade de recebimento |
| `PaymentStatus` | `PENDING`, `PROCESSING`, `PAID`, `FAILED`, `CANCELED`, `EXPIRED`, `REVIEW_REQUIRED` | Estado financeiro agregado |
| `PaymentMethod` | `PIX`, `CARD` | Método aprovado |
| `PaymentAttemptStatus` | `CREATED`, `PENDING`, `REQUIRES_ACTION`, `APPROVED`, `FAILED`, `CANCELED`, `EXPIRED`, `REVIEW_REQUIRED` | Estado de uma tentativa |
| `ReservationStatus` | `HELD`, `COMMITTED`, `RELEASED`, `EXPIRED` | Ciclo da reserva |
| `WebhookStatus` | `RECEIVED`, `PROCESSING`, `PROCESSED`, `FAILED`, `IGNORED` | Processamento da inbox |
| `OrderIssueStatus` | `OPEN`, `RESOLVED` | Pendência operacional |

Estados de autorização, captura, reembolso, chargeback e devolução não devem ser fechados antes da escolha do provedor e da política financeira.

### 5.2 Evolução de `Order`

Campos aditivos propostos:

| Campo | Tipo conceitual | Regra |
| --- | --- | --- |
| `publicId` | UUID | Único, não enumerável e gerado pelo banco |
| `commerceVersion` | Int | `0` para fluxo legado e `1` para o novo fluxo |
| `fulfillmentMode` | `FulfillmentMode?` | Nulo no fluxo legado |
| `itemsSubtotal` | Decimal opcional na expansão | Soma histórica; obrigatório no fluxo novo |
| `fulfillmentFee` | Decimal | Taxa histórica; nula no legado desconhecido |
| `currency` | `Char(3)` opcional na expansão | `BRL` e obrigatório no fluxo novo |
| `trackingCode` | String opcional | Informado pela loja quando aplicável |
| `trackingUrl` | String opcional | URL validada quando aplicável |
| `shippedAt` | DateTime opcional | Momento de saída da loja |

`total` permanece no pedido e deve ser alargado para uma precisão compatível com o limite comercial aprovado. A relação com `Payment`, endereço, reservas e pendências será opcional para permitir leitura do legado.

`commerceVersion` deve ser `NOT NULL DEFAULT 0` desde a migration. A aplicação nova grava `1` explicitamente. Assim, pedidos criados pela versão anterior durante a fase expansiva ou após rollback continuam identificados como fluxo legado; ausência de `Payment` ou reserva nunca será usada isoladamente para classificar a coorte. Quando `commerceVersion = 1`, relações obrigatórias ausentes representam inconsistência e devem abrir pendência, não cair silenciosamente no caminho legado.

### 5.3 Evolução de `OrderItem`

Preservar os campos existentes e adicionar para pedidos novos:

- `productName`: fotografia do nome;
- `productSku`: fotografia do SKU;
- precisão monetária coerente com os totais;
- unicidade de `(orderId, productId)` após auditoria dos registros existentes;
- relação opcional 1:1 com a reserva.

Snapshots legados devem permanecer nulos ou ser identificados como reconstruídos. Copiar o produto atual não prova o valor histórico.

### 5.4 `IdempotencyRequest`

Registro persistente adquirido dentro da mesma transação dos efeitos do comando, contendo:

- escopo e hash da chave;
- hash do payload canônico;
- estado interno `PROCESSING` e resultado `COMPLETED`;
- referência ao pedido e status HTTP estável do resultado;
- datas de criação e conclusão.

`(scope, keyHash)` deve ser único. O protocolo será de transação única:

1. tentar inserir o registro como primeira escrita da transação;
2. criar pedido, itens, reservas e movimentos;
3. associar o pedido e marcar `COMPLETED` antes do commit;
4. em conflito de unicidade, abortar essa transação e consultar o registro já confirmado fora dela;
5. retornar o mesmo resultado quando o hash coincidir ou `409` quando divergir;
6. se a transação original falhar, a inserção também desaparece e um retry pode adquirir a chave.

`PROCESSING` não é um claim durável em duas fases e não deve permanecer confirmado. Um registro assim encontrado é inconsistência operacional. A chave concluída não expira nem pode ser reutilizada enquanto o pedido existir. Não se deve persistir corpo de resposta com PII. Tentativas de pagamento usam um escopo idempotente próprio, separado do checkout.

### 5.5 `OrderAddress`

Relação 1:1 opcional com `Order`, contendo a fotografia necessária ao atendimento:

- nome e telefone do destinatário, se aprovados;
- CEP, logradouro, número, complemento e bairro;
- cidade, UF e país;
- referência opcional, se aprovada;
- timestamps de criação.

Regras estruturais:

- retirada não possui endereço de entrega;
- entrega local e envio nacional exigem endereço;
- cidade digitada pelo navegador não comprova elegibilidade para entrega local;
- endereço de cobrança e CPF/CNPJ não serão coletados sem necessidade aprovada.

### 5.6 `Payment`

Relação 1:1 opcional com `Order`. Representa o agregado financeiro, não uma chamada específica ao provedor.

Campos mínimos:

- UUID interno;
- `orderId` único;
- estado financeiro;
- valor esperado e moeda;
- `paidAmount` e `refundedAmount` derivados das transações persistidas;
- versão para atualização concorrente;
- `paidAt`, `canceledAt` e timestamps gerais;
- relação 1:N com tentativas e transações financeiras.

Pedidos com `commerceVersion = 0` permanecerão sem `Payment` por padrão. A interface deve mostrar “Pagamento não registrado - fluxo legado”, nunca inferir “pago” ou “não pago” pelo status operacional. Em pedidos de versão nova, ausência de `Payment` é erro operacional explícito.

### 5.7 `PaymentAttempt`

Cada tentativa PIX ou cartão será preservada, inclusive falhas e expirações.

Campos mínimos:

- UUID interno e sequência dentro do pagamento;
- método e estado da tentativa;
- valor e moeda esperados;
- código do provedor e conta/ambiente lógico;
- referência interna única enviada ao provedor;
- identificador externo, quando existir;
- hash da chave idempotente;
- expiração e timestamps de aprovação/falha;
- código de falha sanitizado;
- dados mínimos da próxima ação, sem material sensível.

Constraints necessárias:

- unicidade de `(paymentId, sequence)`;
- unicidade de `(provider, providerAccountRef, providerPaymentId)` quando preenchido;
- unicidade da referência interna;
- unicidade do hash idempotente no escopo adequado.

Estados de tentativa são monotônicos. Uma tentativa aprovada não pode regredir por evento tardio de pendência ou falha. Depois da primeira liquidação válida, novas tentativas não devem ser iniciadas e as ainda pendentes devem ser canceladas quando o provedor permitir, sem presumir que o cancelamento externo sempre será possível.

Regras do agregado:

- `PENDING`: obrigação criada, sem tentativa externa ativa;
- `PROCESSING`: existe tentativa ativa e ainda não há liquidação válida;
- `PAID`: existe exatamente uma liquidação compatível com o valor esperado;
- `FAILED`: não há tentativa ativa e as tentativas concluídas falharam; nova tentativa iniciada pode retornar a `PROCESSING`;
- `CANCELED` ou `EXPIRED`: novas tentativas ficam bloqueadas, salvo reabertura comercial explícita;
- `REVIEW_REQUIRED`: há dupla liquidação, divergência ou evento que impede decisão automática.

Na redução dos eventos, `REVIEW_REQUIRED` tem precedência sobre `PAID`, que tem precedência sobre estados não liquidados. O agregado é recalculado dentro de lock ou controle otimista e nunca substitui o histórico das tentativas e transações.

### 5.8 `PaymentTransaction`

Registro append-only de cada efeito financeiro observado, inclusive quando duas tentativas diferentes forem aprovadas:

- pagamento e tentativa relacionados;
- provedor, conta e identificador externo da transação;
- tipo e estado normalizados;
- valor e moeda efetivamente observados;
- origem da confirmação e instante declarado pelo provedor;
- chave única de deduplicação.

A primeira liquidação válida e compatível pode levar o agregado a `PAID`. Uma segunda liquidação distinta nunca será descartada: ela aumenta o valor observado, coloca o agregado em `REVIEW_REQUIRED` e cria pendência de possível cobrança duplicada. O agregado é atualizado com lock ou versão e não pode regredir por ordem de chegada. Tipos de estorno, reembolso e chargeback só serão fechados após a política correspondente.

### 5.9 `PaymentWebhookEvent`

Inbox durável para entrega pelo menos uma vez e efeitos internos idempotentes:

- UUID interno;
- provedor, conta/ambiente, ID externo quando fornecido e chave de deduplicação calculada pelo adaptador;
- tipo externo e tipo normalizado;
- hash do payload;
- tentativa associada, quando identificada;
- estado de processamento;
- datas do evento, recebimento e processamento;
- contador de tentativas, próxima tentativa e código de erro sanitizado;
- proprietário e expiração do lease de processamento.

`(provider, providerAccountRef, deduplicationKey)` deve ser único. A regra que produz `deduplicationKey` só será definida após verificar o contrato do provedor; poderá usar ID de evento, recurso ou composição estável. O claim será transacional, com lease expirável e recuperação de eventos presos em `PROCESSING`. Payload bruto só poderá ser armazenado se indispensável, minimizado, protegido e sujeito a retenção aprovada.

### 5.10 `StockReservation`

Uma reserva por `OrderItem`, contendo:

- UUID interno;
- pedido, item e produto;
- quantidade;
- estado da reserva;
- expiração;
- datas de confirmação e liberação;
- motivo normalizado da liberação;
- versão ou atualização condicional.

`orderItemId` deve ser único. Índices devem cobrir produto/estado e estado/expiração.

`expiresAt` será opcional na implantação estrutural. COM-05 pode validar reserva tecnicamente com prazo nulo, mas o checkout novo permanecerá desativado. Toda reserva criada em operação comercial deverá ter prazo calculado pela política aprovada antes da ativação de COM-06.

### 5.11 `InventoryMovement`

Ledger append-only para explicar efeitos no saldo disponível:

- produto, pedido e reserva relacionados;
- delta aplicado ao saldo disponível;
- tipo e motivo do movimento;
- `effectKey` único;
- saldo disponível posterior ao movimento;
- timestamp.

A chave de efeito oferece uma barreira adicional contra baixa ou reposição duplicada. O ledger começa no cutover com um movimento `OPENING_BALANCE` por produto: `deltaAvailable = 0` e `balanceAfter = Product.stock`. A reconciliação usa `balanceAfter` da abertura mais os deltas posteriores, não a soma do delta da abertura. Esse registro não altera o produto e não finge reconstruir o histórico anterior.

Depois da abertura, toda mutação de `Product.stock` deve passar pela camada de inventário e gravar saldo e movimento na mesma transação. Isso inclui criação de produto com saldo inicial, ajuste administrativo absoluto, reserva, liberação, cancelamento legado e correções autorizadas. Ajuste absoluto deve bloquear o produto, calcular o delta contra o saldo atual e registrar motivo e operador; produto novo recebe movimento inicial próprio. Escrita de estoque fora dessa camada deve ser bloqueada pela aplicação e pelas permissões de banco disponíveis.

Movimentos, pagamentos, transações, reservas e eventos não podem ser apagados em cascata. As FKs devem usar `RESTRICT` ou preservação equivalente, o service não terá exclusão física desses registros e a deleção física de pedido deverá permanecer proibida. A FK atual `Order -> OrderItem` com cascade deve ser revista antes de tratar o conjunto como histórico auditável.

### 5.12 `OrderIssue`

Registra pendências que exigem acompanhamento, como:

- pagamento tardio após liberação da reserva;
- pagamento com valor, moeda ou referência divergente;
- evento de webhook sem tentativa conhecida;
- falha permanente de reconciliação;
- estoque indisponível para pagamento tardio;
- inconsistência de endereço ou modalidade.

Deve conter tipo, estado, origem, código de detalhe, timestamps e futura identificação do operador que resolveu. Não deve armazenar segredos nem payloads integrais.

## 6. Estados operacionais

Adicionar `SHIPPED` ao `OrderStatus`, mantendo estados financeiros fora desse enum.

Fluxos propostos:

| Modalidade | Transições principais |
| --- | --- |
| Retirada | `PENDING -> CONFIRMED -> PREPARING -> READY -> DELIVERED` |
| Entrega local | `PENDING -> CONFIRMED -> PREPARING -> READY -> SHIPPED -> DELIVERED` |
| Envio nacional | `PENDING -> CONFIRMED -> PREPARING -> READY -> SHIPPED -> DELIVERED` |

Na interface, `SHIPPED` pode ser apresentado como “Saiu para entrega” na entrega local e “Enviado” no envio nacional. `DELIVERED` pode ser apresentado como “Retirado” para retirada.

Regras propostas:

- `SHIPPED` não se aplica a retirada;
- rastreio não é obrigatório para alterar o estado, salvo decisão posterior;
- cancelamento continua terminal;
- cancelamento após `SHIPPED` depende de política específica;
- pagamento aprovado não equivale automaticamente a pedido preparado ou enviado;
- a automação de `PENDING -> CONFIRMED` após pagamento ainda depende de aprovação.

O backend continuará sendo a fonte das transições permitidas. O frontend deve consumir capacidades ou transições retornadas, não manter uma matriz independente.

## 7. Valores monetários

A alternativa recomendada é manter Decimal, por ser a menor evolução compatível com o banco atual.

Regras:

1. usar `Prisma.Decimal` desde a leitura do produto até a persistência;
2. não converter preço, subtotal, taxa ou total para `number` no backend;
3. calcular cada subtotal como preço exato multiplicado pela quantidade;
4. calcular `itemsSubtotal + fulfillmentFee = total` no servidor;
5. serializar valores monetários como strings decimais na API;
6. revalidar o limite de quantidade depois da agregação;
7. definir limite máximo de pedido compatível com a precisão e com o futuro provedor;
8. adicionar constraints não negativas e validações de coerência quando compatíveis com o legado.

O total mostrado antes da cotação será apenas estimativa. Falha ao obter taxa não pode ser convertida em taxa zero.

## 8. Reserva e integridade de estoque

### 8.1 Semântica do saldo

Na primeira evolução, `Product.stock` continuará representando o saldo disponível. Isso preserva a baixa condicional atual e evita reconstruir um estoque físico desconhecido.

Não se recomenda introduzir imediatamente `onHand` e `reserved`, porque o histórico atual não permite reconstruir com confiança o estoque físico e as reservas anteriores.

### 8.2 Criação do pedido

Dentro de uma única transação:

1. adquirir ou validar a chave idempotente;
2. agregar e ordenar itens por `productId`;
3. buscar e validar produtos;
4. calcular valores com Decimal;
5. decrementar o saldo com condição suficiente;
6. criar pedido e itens;
7. criar uma reserva `HELD` por item;
8. criar movimentos com chaves de efeito únicas;
9. concluir o registro idempotente.

A transação não fará chamadas ao provedor. O agregado financeiro será criado pelo núcleo de pagamento na mesma transação coordenada quando essa etapa estiver ativa, sem incorporar regras financeiras ao `OrdersService`.

### 8.3 Pagamento aprovado

O processamento financeiro bloqueia todas as reservas do pedido em ordem estável e inspeciona o conjunto na mesma transação que registra a liquidação. Se todas estiverem `HELD`, altera o conjunto para `COMMITTED`, valida a quantidade exata de linhas e não executa nova baixa.

Se qualquer reserva já estiver liberada, expirada, ausente ou incoerente, nenhuma reserva é alterada parcialmente. A transação financeira observada continua persistida, `Payment` passa a `REVIEW_REQUIRED` e um `OrderIssue` é criado. Uma falha técnica inesperada reverte o processamento, mas o evento durável permanece elegível para retry e a liquidação volta a ser consultada. A atomicidade do estoque nunca pode apagar a evidência de dinheiro recebido.

### 8.4 Expiração ou cancelamento aplicável

A liberação deve:

1. bloquear todas as reservas do pedido em ordem estável;
2. validar que o conjunto completo ainda está `HELD`;
3. alterar todas para `EXPIRED` ou `RELEASED`;
4. incrementar os produtos somente quando a transição integral vencer;
5. inserir movimentos com `effectKey` único;
6. executar estados, saldos e movimentos na mesma transação.

Pedidos com reserva `COMMITTED` só devolvem estoque conforme política de cancelamento pós-pagamento ainda pendente.

### 8.5 Pagamento tardio

Se a aprovação chegar após a reserva ter sido liberada:

- não rebaixar estoque silenciosamente;
- não iniciar atendimento automaticamente;
- registrar o pagamento confirmado sem esconder a divergência;
- criar `OrderIssue` para tratamento;
- verificar disponibilidade apenas como informação;
- aplicar nova reserva ou devolução financeira somente conforme política aprovada.

Essa abordagem impede venda acima do saldo e mantém a realidade financeira visível.

### 8.6 Pedidos legados

Pedidos com `commerceVersion = 0` não receberão reservas ativas por inferência. O saldo já foi decrementado na criação atual.

O cancelamento de pedido de fluxo legado deve manter temporariamente o caminho atual de reposição, protegido pela atualização condicional de status. Pedidos de versão nova usarão exclusivamente a transição da reserva para aplicar efeitos de estoque. A ausência de reserva em um pedido de versão nova é uma inconsistência, não autorização para usar o caminho legado.

Pedidos legados não terminais precisam de uma fila de revisão antes do cutover. Nenhuma expiração retroativa será automática: o responsável deverá aprovar critérios para manter, cancelar ou encerrar cada coorte sem inferir pagamento. Até essa decisão, eles continuam no tratamento manual existente e podem reter saldo.

## 9. Fluxos de pagamento

### 9.1 Iniciação

1. O navegador solicita uma cotação autoritativa e escolhe PIX ou cartão.
2. O BFF encaminha somente headers permitidos, incluindo a chave idempotente.
3. O backend coordena pedido, reserva, pagamento e tentativa sem chamar o provedor dentro da transação.
4. Após o commit, um adaptador cria ou recupera a cobrança usando referência e idempotência próprias.
5. A tentativa armazena apenas identificadores e próxima ação segura.
6. O frontend recebe uma ação discriminada, como redirecionamento ou instruções PIX, conforme o provedor futuro.

Falha de rede após commit deve permitir recuperar a mesma tentativa, não criar novo pedido.

### 9.2 Confirmação

O retorno do navegador nunca confirma pagamento. A confirmação depende de webhook autenticado, consulta server-to-server ou reconciliação.

Antes de marcar `PAID`, o backend compara:

- provedor, conta e ambiente;
- referência interna;
- identificador externo;
- valor e moeda;
- estado consultado na fonte autoritativa.

Tentativa e agregado terão máquinas de estado explícitas. Cada transação externa confirmada será inserida antes de atualizar o agregado. A primeira liquidação compatível confirma o pagamento; evento posterior não pode regredir uma tentativa aprovada. Se outra tentativa distinta também liquidar, ambas permanecem registradas, `Payment` passa a `REVIEW_REQUIRED` e uma pendência de sobrepagamento é aberta. Cancelar tentativas restantes é melhor esforço e não substitui reconciliação.

### 9.3 Webhook

1. Receber diretamente no backend e preservar os bytes exigidos pelo protocolo.
2. Verificar assinatura e timestamp antes de confiar no evento.
3. Rejeitar assinatura inválida sem detalhes internos.
4. Inserir a inbox com constraint única.
5. Adquirir claim com lease expirável; evento abandonado em `PROCESSING` volta a ser elegível.
6. Responder duplicata válida sem repetir efeitos.
7. Consultar o provedor quando o payload não for autoridade suficiente.
8. Persistir a transação financeira e então confirmar integralmente as reservas, ou registrar `REVIEW_REQUIRED` sem efeito parcial quando o conjunto não puder ser confirmado.
9. Marcar o evento processado somente após os efeitos persistirem.

### 9.4 Reconciliação

Um processo periódico deve procurar tentativas pendentes ou divergentes, consultar o provedor, reaplicar o processamento idempotente e abrir pendência quando não puder resolver automaticamente.

O job precisa de lease ou lock no banco para impedir execução duplicada em múltiplas réplicas. Cursor, tentativas e resultado devem ser duráveis.

## 10. Fluxos de recebimento

### 10.1 Retirada na loja

- endereço de entrega ausente;
- ponto, horário e instruções ainda dependem de aprovação;
- taxa depende de decisão comercial, sem presunção de valor zero;
- fluxo operacional termina em retirada registrada como `DELIVERED`;
- rastreio não se aplica.

### 10.2 Entrega local em Ponta Grossa

- endereço obrigatório;
- elegibilidade calculada no servidor pela regra aprovada;
- taxa calculada no servidor e congelada no pedido;
- loja registra preparação, saída e entrega;
- sistema não calcula rota nem gerencia entregador;
- rastreio pode permanecer opcional e manual.

### 10.3 Envio nacional

- endereço obrigatório;
- taxa e serviço dependem de regra ainda não aprovada;
- loja executa o despacho;
- administrador registra `SHIPPED`, código, URL e data quando aplicável;
- sistema não contrata frete nem automatiza despacho;
- entrega final é registrada manualmente ou por integração futura aprovada.

## 11. Segurança

### 11.1 Administração

Antes de disponibilizar ações financeiras:

- substituir o cookie derivado da senha por sessão com segredo independente, expiração validada e revogação;
- proteger login com rate limit compartilhado e monitoramento;
- validar `Origin` e adotar proteção CSRF nas mutações;
- separar identidade do operador da credencial de serviço BFF/backend;
- adotar usuários ou identidade individual, papéis e auditoria;
- fazer o NestJS validar uma sessão ou afirmação curta assinada pelo emissor confiável, sem aceitar identidade declarada em header arbitrário;
- autorizar por papel no backend e testar usuário autenticado sem a permissão exigida;
- minimizar PII nas listagens e carregar detalhes sob demanda;
- usar paginação e registrar ações sensíveis.

### 11.2 Segredos e cartão

- segredo de sessão, credencial BFF, assinatura de webhook e credencial outbound serão distintos;
- credenciais serão separadas por ambiente;
- nenhuma credencial será `NEXT_PUBLIC_*`;
- cartão usará redirecionamento, tokenização ou componente hospedado aprovado;
- PAN e CVV nunca passarão pelos contratos próprios nem serão armazenados;
- logs terão correlação e redaction de PII, cookies, headers e assinaturas.

### 11.3 Webhook

- assinatura sobre raw body quando exigido;
- comparação constante de MACs;
- proteção de replay com timestamp e ID único;
- endpoint sem cookie administrativo, CSRF ou dependência de CORS;
- allowlist de IP apenas como defesa adicional;
- timeout e retry controlados na consulta server-to-server;
- URLs externas fixadas por configuração para evitar SSRF.

## 12. Estratégia de testes

### 12.1 PostgreSQL real

Criar suíte separada com:

- PostgreSQL descartável por execução ou worker;
- `DATABASE_URL_TEST` obrigatória;
- validação que recuse host/banco de produção;
- aplicação das migrations com a CLI Prisma instalada;
- credenciais sem acesso a produção;
- limpeza determinística ou banco descartável;
- sem substituir `PrismaService` por mock.

### 12.2 Casos transacionais

- pedido válido persiste itens, reservas e movimentos;
- falha no último item reverte todas as baixas;
- duas compras disputando a última unidade produzem um único sucesso;
- produtos em ordens invertidas não deixam estado parcial;
- mesma idempotência concorrente produz um pedido;
- mesma chave com outro payload produz conflito;
- cancelamentos concorrentes liberam saldo uma vez;
- expiração e pagamento concorrentes têm um único vencedor;
- falha na confirmação de reservas preserva a transação financeira e abre pendência;
- duas liquidações distintas permanecem registradas e exigem revisão;
- webhook duplicado sequencial e concorrente não repete efeito;
- evento fora de ordem não regride estado;
- pagamento tardio abre pendência sem vender acima do saldo.

### 12.3 Segurança e contratos

- assinatura válida, inválida, ausente, expirada e com um byte alterado;
- corpo acima do limite;
- segredo rotacionado;
- valor, moeda, conta e referência divergentes;
- sessão administrativa expirada, revogada ou adulterada;
- CSRF e origem inválida;
- respostas públicas sem telefone, e-mail, endereço completo ou observações;
- retorno do provedor ou query string não confirma pagamento.

### 12.4 Migration

Usar fixtures com pedidos em todos os estados atuais e comprovar:

- nenhuma linha `Payment` criada para o legado;
- nenhuma reserva histórica altera `Product.stock`;
- modalidade e endereço permanecem desconhecidos;
- valores existentes são preservados;
- `commerceVersion = 0` identifica todos os pedidos do fluxo antigo, inclusive os criados durante rollback;
- pedido de versão nova sem relações obrigatórias é detectado como inconsistência;
- aplicação anterior continua compatível durante a fase expansiva;
- `publicId` é gerado pelo banco para escrita da aplicação antiga;
- rollback pós-cutover não permite mutação de pedido versão 1 por binário legado;
- rollback da aplicação não exige remover dados novos.

## 13. Estratégia de migration

### 13.1 Auditoria prévia

Antes de gerar a migration, medir:

- pedidos sem itens;
- itens repetidos por pedido/produto;
- quantidades e estoques inválidos;
- divergência entre total e soma dos subtotais;
- valores próximos do limite da precisão;
- pedidos não terminais antigos;
- distribuição por status.

### 13.2 Migration expansiva

Criar nova migration, sem editar as existentes:

- adicionar `SHIPPED` ao enum atual;
- adicionar `commerceVersion NOT NULL DEFAULT 0`, campos inicialmente opcionais e `publicId` com default UUID gerado no banco;
- adicionar snapshots opcionais em `OrderItem`;
- criar tabelas de idempotência, financeiras, endereço, reserva, movimentos, webhook e pendências;
- criar índices e constraints compatíveis;
- alargar precisão monetária quando o limite for aprovado.

### 13.3 Backfill seguro

- gerar `publicId` único no banco para registros existentes e novos, inclusive quando a aplicação antiga ainda escrever;
- preencher `itemsSubtotal` somente após validar o cálculo atual;
- manter `fulfillmentFee` nula quando o legado for desconhecido;
- não criar `Payment` legado;
- não definir modalidade ou endereço legado;
- não criar reserva ativa nem movimentar estoque;
- manter snapshots de produto nulos quando o histórico não puder ser provado.

Campos exigidos somente pelo fluxo novo permanecem nulos durante a fase expansiva. A aplicação valida sua presença quando `commerceVersion = 1`. Conversão para `NOT NULL`, se ainda útil, só ocorrerá depois do fim de escritores legados e de um backfill comprovadamente seguro.

No cutover do ledger, aplicar uma barreira temporária a todos os escritores de estoque, bloquear as linhas de produto, criar um `OPENING_BALANCE` por produto com o saldo disponível observado e só então liberar as escritas. Não há incremento ou decremento nessa abertura. O default UUID e a função usada por `publicId` devem ser testados no PostgreSQL suportado, sem depender do Prisma Client de uma versão nova.

### 13.4 Deploy compatível

1. aplicar migration expansiva como job separado;
2. manter a funcionalidade nova desativada enquanto versões antigas ainda escrevem `commerceVersion = 0`;
3. publicar backend que leia legado e escreva o novo formato sob ativação controlada;
4. impedir escritores antigos antes de ativar checkout financeiro;
5. publicar frontend compatível com respostas aditivas;
6. observar criação, reserva, webhook e expiração;
7. validar constraints após auditoria e estabilização;
8. contrair somente após remover consumidores do contrato legado.

Migrations financeiras não terão rollback destrutivo automático. Antes da ativação do fluxo novo, o rollback pode usar a aplicação atual porque todos os pedidos continuam em `commerceVersion = 0`. Depois do cutover, o alvo de rollback deve ser uma versão já consciente de `commerceVersion`, capaz de bloquear ou tratar corretamente mutações em pedidos versão 1. Restaurar o binário atual após o cutover só será permitido em modo somente leitura, pois seu cancelamento ignora reservas e poderia repor estoque novamente.

## 14. Tasks em ordem de dependência

### COM-01 - Consolidar decisões e contratos

**Dependências:** nenhuma.

**Escopo:** atualizar regras aprovadas, decisões pendentes e nomenclatura dos estados.

**Critérios de aceite:**

- PIX, cartão e as três modalidades constam na fonte de verdade;
- logística manual está separada de automação não autorizada;
- proposta, implementação e pendência estão claramente distinguidas;
- nenhuma taxa, prazo, provedor ou política é inventada.

### COM-02 - Testes de integração com PostgreSQL

**Dependências:** COM-01.

**Escopo:** criar ambiente e suíte isolada antes das mudanças comerciais.

**Critérios de aceite:**

- migrations reais são aplicadas em banco descartável;
- configuração recusa produção;
- testes exercitam rollback, locks e concorrência;
- criação e cancelamento atuais possuem baseline real.

### COM-03 - Dinheiro exato e ordem de locks

**Dependências:** COM-02.

**Escopo:** substituir ponto flutuante, validar quantidade agregada e ordenar produtos.

**Critérios de aceite:**

- nenhum cálculo autoritativo usa `number`;
- preço, subtotal e total usam Decimal do início ao fim;
- produtos são atualizados em ordem estável;
- overflow e limites retornam erro de negócio;
- testes reais comprovam rollback e concorrência.

### COM-04 - Modelo e migration expansiva

**Dependências:** COM-01, COM-02 e decisões de campos obrigatórios.

**Escopo:** adicionar estruturas propostas sem ativar pagamento.

**Critérios de aceite:**

- migration nova preserva as existentes;
- pedidos antigos continuam legíveis;
- versão do fluxo diferencia legado, escrita antiga e pedido novo inconsistente;
- nenhum legado é marcado como pago ou recebe modalidade inferida;
- índices, constraints e estratégia de rollback são revisados;
- migration é testada com fixtures legadas.

### COM-05 - Idempotência e reserva na criação

**Dependências:** COM-03 e COM-04.

**Escopo:** criar pedido, itens, reserva e movimentos atomicamente.

**Critérios de aceite:**

- mesma chave e payload retornam o mesmo pedido;
- mesma chave com payload diferente retorna conflito;
- registro idempotente representa processamento, conclusão e recuperação sem armazenar PII;
- requests simultâneos criam um pedido e uma baixa;
- cada novo item possui uma reserva;
- criação, ajuste administrativo e cancelamento legado também geram movimento atômico;
- prazo pode permanecer nulo apenas em teste estrutural com o checkout novo desativado;
- falha em qualquer etapa reverte todos os efeitos.

### COM-06 - Expiração e liberação

**Dependências:** COM-05 e decisão de prazo.

**Escopo:** liberar reservas pendentes com processamento idempotente.

**Critérios de aceite:**

- reserva expirada volta ao saldo uma vez;
- retries e múltiplos workers não duplicam movimento;
- todas as reservas do pedido expiram ou são liberadas como uma unidade;
- falhas permanentes geram pendência operacional.

### COM-07 - Modalidades e andamento operacional

**Dependências:** COM-04 e decisões de endereço/taxa.

**Escopo:** implementar modalidade, endereço, taxa, `SHIPPED` e rastreio.

**Critérios de aceite:**

- retirada rejeita endereço de entrega;
- entrega local e envio nacional exigem endereço válido;
- taxa é calculada no servidor e congelada;
- transições inválidas por modalidade são rejeitadas;
- rastreio é opcional e administrável sem automatizar despacho.

### COM-08 - Consulta pública segura

**Dependências:** COM-04.

**Escopo:** substituir confirmação baseada em query string por consulta autorizada.

**Critérios de aceite:**

- ID sequencial não permite consulta pública;
- identificador opaco e prova de posse são exigidos;
- resposta minimiza dados pessoais;
- token inexistente ou inválido nunca exibe sucesso;
- carrinho só é limpo no ponto comercial aprovado.

### COM-09 - Segurança administrativa

**Dependências:** COM-01.

**Escopo:** preparar o painel para ações financeiras e dados de recebimento.

**Critérios de aceite:**

- sessão possui segredo independente, expiração real e revogação;
- login tem proteção contra abuso;
- mutações validam origem e CSRF;
- NestJS autentica o operador, autoriza por papel e rejeita identidade forjada;
- operador e ações sensíveis são auditáveis no backend;
- listagens são paginadas e minimizam PII.

### COM-10 - Núcleo financeiro neutro

**Dependências:** COM-04, COM-05 e COM-09.

**Escopo:** implementar domínio `Payment`, `PaymentAttempt` e `PaymentTransaction` sem SDK.

**Critérios de aceite:**

- estado financeiro não usa `OrderStatus`;
- múltiplas tentativas são preservadas;
- máquina de estados impede regressão e registra toda liquidação observada;
- dupla cobrança passa a `REVIEW_REQUIRED` sem apagar nenhuma transação;
- referências e idempotência têm constraints;
- interfaces de provedor não importam tipos externos no domínio;
- testes usam adaptador falso explícito.

### COM-11 - Escolha e adaptador do provedor

**Dependências:** aprovação do provedor e COM-10.

**Escopo:** implementar somente o adaptador escolhido.

**Critérios de aceite:**

- credenciais ficam no servidor e separadas por ambiente;
- cartão usa mecanismo hospedado ou tokenizado aprovado;
- retries usam idempotência do provedor;
- timeout, erros e redaction são definidos;
- PIX e cartão são validados em sandbox.

### COM-12 - Webhook idempotente

**Dependências:** COM-10, COM-11 e contrato do provedor.

**Escopo:** receber, validar, persistir e processar eventos.

**Critérios de aceite:**

- assinatura usa o corpo exigido pelo provedor;
- evento é persistido e deduplicado;
- claim usa lease recuperável para eventos presos;
- duplicatas e eventos concorrentes não repetem efeitos;
- pagamento aprovado confirma atomicamente todo o conjunto de reservas, sem nova baixa;
- expiração e pagamento concorrentes têm um único resultado integral;
- eventos divergentes criam pendência, não sucesso falso.

### COM-13 - Reconciliação e pagamento tardio

**Dependências:** COM-06 e COM-12.

**Escopo:** reconciliar estados e tratar eventos ausentes ou atrasados.

**Critérios de aceite:**

- tentativas pendentes são consultadas server-to-server;
- múltiplas réplicas não processam o mesmo lote livremente;
- pagamento tardio não causa venda acima do saldo;
- divergências permanecem visíveis até resolução;
- correções manuais são autorizadas e auditadas.

### COM-14 - Checkout público

**Dependências:** COM-06, COM-07, COM-08, COM-11, COM-12 e COM-13.

**Escopo:** cotação, modalidade, endereço condicional e pagamento.

**Critérios de aceite:**

- preço, estoque e taxa são revalidados no servidor;
- checkout distingue loading, expiração, erro, pendência e confirmação;
- retorno do provedor não marca pagamento como aprovado;
- PIX e cartão não expõem segredos;
- interface funciona em desktop, mobile e teclado.

### COM-15 - Operação administrativa

**Dependências:** COM-07, COM-09, COM-12 e COM-13.

**Escopo:** exibir e operar pedidos, pagamentos, recebimento e pendências.

**Critérios de aceite:**

- lista separa estado operacional e financeiro;
- modalidade, taxa, endereço e rastreio aparecem conforme permissão;
- backend retorna transições permitidas;
- pendências podem ser filtradas e resolvidas com auditoria;
- falha da API não aparece como lista vazia.

### COM-16 - Validação e cutover

**Dependências:** todas as anteriores necessárias ao lançamento.

**Escopo:** validar migration, concorrência, segurança e operação antes da ativação.

**Critérios de aceite:**

- suíte unitária, HTTP, integração e E2E passa em ambiente isolado;
- cenários de retry, concorrência, webhook e expiração estão cobertos;
- backup e restauração foram validados;
- monitoramento e alertas mínimos estão ativos;
- pedidos legados não terminais foram revisados conforme política aprovada;
- nenhum escritor antigo permanece ativo no momento do cutover financeiro;
- todas as mutações de estoque posteriores à abertura produzem movimento reconciliável;
- rollout e rollback apontam para versão compatível com pedidos `commerceVersion = 1`;
- nenhuma operação de teste usa produção.

## 15. Arquivos futuramente afetados

### Backend e banco

- `backend/prisma/schema.prisma`;
- nova migration em `backend/prisma/migrations/`;
- `backend/src/modules/orders/`;
- novos módulos `payments`, `webhooks`, `fulfillment` e `inventory`;
- `backend/src/main.ts` e `backend/src/app.module.ts`;
- autenticação, configuração, auditoria e Prisma compartilhado;
- testes unitários, HTTP e nova suíte de integração.

### Frontend

- checkout, carrinho e confirmação pública;
- Route Handlers de pedidos, cotação e consulta pública;
- tipos e validação runtime das respostas;
- administração de pedidos, pagamentos, recebimento, rastreio e pendências;
- autenticação e sessão administrativa.

### Documentação e operação

- `BUSINESS_RULES.md`, `API.md`, `DATABASE.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md` e `PROJECT_STATUS.md`;
- exemplos de ambiente somente com nomes não sensíveis;
- Compose ou configuração isolada de teste;
- processo de migration, reconciliação, monitoramento e resposta a falhas.

Dependências e lockfiles só serão alterados quando uma necessidade concreta for aprovada, como SDK do provedor ou runner E2E.

## 16. Riscos

| Risco | Mitigação planejada |
| --- | --- |
| Pedido ou cobrança duplicada | Idempotência, ledger de transações e pendência para liquidações distintas |
| Estoque retido sem pagamento | Reserva explícita e expiração |
| Dupla reposição | Transição condicional, transação e chave de efeito |
| Venda acima do saldo | Baixa condicional e tratamento conservador de pagamento tardio |
| Divergência monetária | Decimal ponta a ponta e total server-side |
| Webhook duplicado ou fora de ordem | Inbox durável, deduplicação e reconciliação |
| Confirmação falsa | Consulta pública segura e autoridade no backend |
| Vazamento de cartão ou segredo | Tokenização/redirect, segregação e redaction |
| Legado classificado incorretamente | `commerceVersion` explícita e validação de relações obrigatórias |
| Migration incompatível | Estratégia expansiva, fixtures legadas e rollback da aplicação |
| Ação financeira sem autoria | Sessão individual, papéis e auditoria |

## 17. Decisões ainda pendentes

As seguintes decisões exigem aprovação antes das tasks dependentes:

- provedor de pagamento;
- validade do PIX e duração da reserva por método;
- captura imediata ou posterior e parcelamento do cartão;
- se pagamento aprovado confirma operacionalmente o pedido de forma automática;
- política de cancelamento, estorno, reembolso e chargeback;
- tratamento comercial de pagamento aprovado após a expiração;
- condições para devolver ao estoque uma reserva já confirmada;
- ponto, horário e procedimento de retirada;
- área exata atendida em Ponta Grossa;
- regra e valor da taxa de entrega local;
- regra para taxa, serviço e prazo do envio nacional;
- campos obrigatórios do endereço e necessidade jurídica de CPF/CNPJ;
- cancelamento depois de `SHIPPED`;
- modalidades que aceitam rastreio e significado da URL informada;
- prova de posse para consulta pública do pedido;
- momento em que o carrinho será limpo no fluxo de pagamento;
- política para pedidos legados não terminais que já retiveram estoque;
- conta de cliente ou acompanhamento somente por token;
- política de notificações;
- retenção e anonimização de dados pessoais e eventos financeiros;
- limites máximos de quantidade e valor por pedido;
- volume esperado para dimensionar paginação, jobs e índices.

## 18. Sequência recomendada

1. Consolidar regras e decisões pendentes.
2. Criar a suíte com PostgreSQL real.
3. Corrigir dinheiro e ordem de locks.
4. Aplicar o modelo expansivo sem ativar pagamento.
5. Implementar idempotência e reserva.
6. Implementar expiração, modalidade e confirmação pública segura.
7. Fortalecer autenticação administrativa.
8. Implementar o núcleo financeiro neutro.
9. Aprovar e integrar o provedor.
10. Implementar webhook e reconciliação.
11. Evoluir checkout e painel administrativo.
12. Validar migration, segurança, concorrência e rollback antes do cutover.

## 19. Referências

- Regras comerciais: [BUSINESS_RULES.md](BUSINESS_RULES.md)
- Arquitetura atual: [ARCHITECTURE.md](ARCHITECTURE.md)
- Contratos atuais: [API.md](API.md)
- Banco atual: [DATABASE.md](DATABASE.md)
- Operação: [DEPLOYMENT.md](DEPLOYMENT.md)
- Diagnóstico e pendências: [PROJECT_STATUS.md](PROJECT_STATUS.md)
