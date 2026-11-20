# Fase 3 — operação comercial, conversão e crescimento

**Avaliação:** 20/11/2026. **Base:** branch `loja`, commit `b3e2a11`, da cópia que o responsável confirmou ser a atual. A mudança foi validada em uma cópia local gravável e aplicada ao repositório de origem após confirmar que seu worktree estava limpo. Não houve commit, deploy, alteração de produção ou de dados reais.

## Estado atual relevante

O código atual tem catálogo, carrinho local, criação de pedido, baixa transacional de estoque, cancelamento com reposição, e painel básico de produtos e pedidos. `Order` possui um único `OrderStatus`; o checkout envia contato e itens e mostra “pedido recebido” a partir de `?pedido=`. O schema, controllers e frontend examinados não implementam PIX/cartão, confirmação do provedor, modalidade de recebimento, endereço, reconciliação, notificações ou Analytics. O painel permite transições operacionais, mas não distingue estado financeiro. Portanto **a entrada em operação com pagamento online está bloqueada** nesta versão. A informação anterior de que essas etapas estavam concluídas foi corrigida pelo responsável; não serão tratadas como entregues.

As regras comerciais aprovam PIX e cartão; retirada, entrega local em Ponta Grossa e envio nacional; logística física feita pela loja. Não há autorização para escolher provedor, valores de frete, área exata, prazo de reserva, política de reembolso ou canal de notificação por preferência técnica. `docs/BUSINESS_RULES.md` e `docs/PROJECT_STATUS.md` registram essas pendências. O plano `docs/COMMERCE_EVOLUTION_PLAN.md` é proposta anterior, não implementação.

## Checklist de entrada em operação

Marcar cada linha como **aprovado** somente com evidência da versão publicada, responsável e data. Não fazer pedidos, cobranças, reembolsos ou envios reais para preencher este checklist sem autorização específica. Testes já aprovados não precisam ser repetidos; verificar apenas a integração nova e a versão de release.

| Verificação | Evidência de aceite | Situação atual |
| --- | --- | --- |
| Jornada de pedido | Catálogo → carrinho → checkout → pagamento confirmado → painel → atendimento, por PIX/cartão e modalidade aplicável, em ambiente isolado | Bloqueado: pagamento e modalidade não existem |
| Confirmação e conciliação | Identificador de tentativa, autoridade do backend/provedor, webhook validado e deduplicado, consulta de divergências e responsável pela triagem | Bloqueado: integração financeira não existe |
| Falhas e cancelamento | Matriz aprovada de falha, expiração, pagamento tardio, cancelamento, reembolso e reposição de estoque; caminhos seguros no painel | Parcial: cancelamento operacional repõe estoque; financeiro ausente |
| Pedidos e pendências | Estados financeiro e de atendimento separados; fila de ações, filtros, tratamento de atualização concorrente | Parcial: há um status operacional e painel básico |
| Entrega e retirada | Instruções ao cliente e à loja para as três modalidades, dados necessários, taxa e prazo aprovados, registro do andamento | Bloqueado: modalidades e regras detalhadas não implementadas |
| Alertas operacionais | Dono, canal, horário, escalonamento e falha visível para novos pedidos, pagamento sob revisão, pedido parado e estoque baixo | Pendente de política e implementação |
| Manual da loja | Abertura, conferência financeira, separação, retirada/entrega, exceções e fechamento diário; acesso restrito a dados pessoais | Pendente |
| Continuidade | Release/rollback compatível, backup e restauração, saúde dos serviços e procedimento de indisponibilidade | A comprovar em ambiente de operação |

**Condição para avançar à automação da Fase 3:** todas as linhas críticas aprovadas. O software não deve inferir que “pedido criado” equivale a pagamento recebido. A loja continua responsável pela logística física; o sistema registra dados e andamento, sem contratar transporte nem gerar etiquetas.

## Backlog priorizado

Esforço relativo: **P** pequeno, **M** médio, **G** grande. Cada linha é uma entrega separada, sujeita à verificação de existência antes de implementar. P0 inclui pré-requisitos comerciais ainda não concluídos; a Fase 3 propriamente dita começa após o checklist.

| ID | Prioridade | Entrega | Dependências | Critérios de aceite | Esforço |
| --- | --- | --- | --- | --- | --- |
| F3-00 | P0 | Cálculo monetário exato na criação de pedido **implementado nesta entrega** | Schema atual `Decimal(10,2)` | Unitário, subtotal e total calculados em Decimal; valor fora do limite rejeitado; contrato e estoque preservados | P |
| F3-00b | P0 | Ordenar baixas de estoque por produto **implementado** | Fluxo transacional atual | Carrinhos em ordem diferente geram a mesma ordem de atualização; teste unitário e baseline PostgreSQL cobrem a sequência | P |
| F3-00c | P0 | Suíte isolada com PostgreSQL real **implementada** | Docker local e migrations existentes | Banco temporário, URL restrita, migrations aplicadas; criação, rollback, cancelamento e concorrência verificados | M |
| F3-01 | P0 | Fechar decisões comerciais e executar o plano de pagamento e recebimento em incrementos | Provedor, validade PIX/reserva, cartão, taxas, áreas, prazos, reembolso, dados de endereço | PIX/cartão confirmados pelo backend; três modalidades registradas; financeiro separado de atendimento; migrations aditivas e testes isolados | G |
| F3-02 | P0 | Idempotência de pedido **implementada**; expiração e reconciliação financeira pendentes | Idempotência de pedido independe do provedor; demais partes exigem F3-01 e política de pagamento tardio | Retry com chave não duplica pedido/baixa; depois, webhook duplicado ou fora de ordem não repete efeito e divergência vira pendência tratável | G |
| F3-03 | P0 | Fechar checklist e manual de operação da loja | F3-01/F3-02; responsáveis e evidências de ambiente | Cada linha do checklist tem evidência, dono e data; equipe sabe tratar exceções e três modalidades | M |
| F3-04 | P1 | Visão de pendências e histórico de eventos no painel | Estados persistidos, identidade/origem de evento e F3-03 | Operador vê status financeiro e operacional, idade/motivo da pendência e linha do tempo; permissões no backend | M |
| F3-05 | P1 | Aviso interno de novo pedido e alertas de pedido parado/estoque baixo | F3-03; canal, destinatários e limiares aprovados | Evento idempotente, falha visível, sem PII desnecessária nem spam | M |
| F3-06 | P1 | Comunicação transacional ao cliente | F3-03; contato, canal e política de comunicação | Templates para transições aprovadas, envio idempotente e falha tratável; sem envio promocional implícito | M |
| F3-07 | P1 | Relatórios simples e exportação de pedidos | F3-03; definição de receita, período e permissões | Vendas pagas, cancelamentos e abertos conciliáveis com a base; exportação limitada e autorizada | M |
| F3-08 | P1 | Uma melhoria comprovada de página de produto ou checkout | Analytics confiável, consentimento aplicável e amostra suficiente | Hipótese, métrica e período definidos antes; acessibilidade preservada; resultado medido | P/M |
| F3-09 | P2 | Produtos relacionados ou combos | Dados de demanda e regras de preço/estoque | Itens disponíveis, preço revalidado no servidor e efeito incremental mensurável | M |
| F3-10 | P2 | Cupons | Política de validade/uso, cálculo exato e concorrência | Uso atômico, limites e cancelamento definidos, desconto histórico preservado | G |
| F3-11 | P2 | Recuperação de carrinho | Identificação e consentimento/base legal, retenção, canal | Apenas contatos elegíveis, frequência limitada, opt-out respeitado, receita incremental mensurada | M/G |
| F3-12 | P2 | Pós-compra, recompra e avaliações verificadas | Volume, consentimento e moderação | Comprador elegível identificado; mensagens transacionais e promocionais separadas; recompra medida | M/G |
| F3-13 | P2 | Margem, demanda, estoque e custos de infraestrutura | Custos reais de produto/serviço, pagamentos elegíveis | Indicadores com fonte/período claros; sem usar valores fictícios como resultado | G |

Conta de cliente e CRM completo ficam fora do escopo até haver necessidade comprovada. Não há integração automática com transportadoras, compra de frete ou geração de etiquetas planejada.

## Métricas de resultado

Definir período e fuso `America/Sao_Paulo`, denominador, fonte e exclusões antes de divulgar números. Não há dados reais de Analytics, vendas pagas ou custos acessíveis nesta avaliação.

| Objetivo | Métrica e fonte |
| --- | --- |
| Prontidão | Itens críticos aprovados no checklist; evidência de rollback e reconciliação |
| Confiabilidade financeira | Pagamentos conciliados / pagamentos do provedor; divergências abertas e tempo até resolução |
| Rotina da loja | Tempo entre pagamento confirmado e primeiro avanço; pedidos abertos por idade e modalidade |
| Estoque | Rupturas e divergências entre movimentos e saldo; não contar baixa como venda paga |
| Conversão | Produto → carrinho → checkout → pagamento aprovado, por dispositivo e modalidade, se Analytics for confiável |
| Crescimento | Receita incremental de oferta/cupom, recompra em janela definida, avaliações verificadas |
| Infraestrutura | Disponibilidade, erros de checkout/pagamento e custo mensal por serviço com faturas reais |

## Ordem de implementação

1. Concluir F3-00, F3-00b e F3-00c e validar as mudanças localmente.
2. Fechar decisões comerciais ainda pendentes e implementar **uma** fatia de F3-01 por vez, conforme `COMMERCE_EVOLUTION_PLAN.md`; depois F3-02 e F3-03. Não liberar vendas reais antes do checklist.
3. Escolher uma necessidade operacional observada entre F3-04 e F3-07 e implementá-la isoladamente, com testes e documentação.
4. Instrumentar/validar o funil e escolher uma hipótese F3-08. Considerar F3-09 a F3-13 apenas com evidência de impacto e regras aprovadas.

## Primeira tarefa executada: F3-00

**Por quê:** `OrdersService.create` convertia preços para `number`, multiplicava e somava em ponto flutuante antes de gravar `Decimal(10,2)`. É uma falha independente da escolha de provedor e afeta a base de valores futuros.

**Arquivos:** `backend/src/modules/orders/orders.service.ts`, `backend/src/modules/orders/orders.service.spec.ts`, `docs/BUSINESS_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/API.md` e este roadmap. Sem migration ou dependência; o contrato mantém o formato e acrescenta erro `400` para valor fora do limite do banco.

**Critérios de aceite:** calcular preço, subtotal e total com `Prisma.Decimal`; rejeitar valor que excede `Decimal(10,2)` com erro de negócio; não alterar preço histórico nem a transação de estoque; teste de centavos e de limite passa. Verificar build e suíte afetada. Nenhuma chamada a provedor ou operação de produção.

## Tarefa incremental seguinte: F3-00b

**Motivo:** a criação usava a ordem dos itens enviados pelo navegador para as baixas de estoque. Dois carrinhos com os mesmos produtos em ordens opostas podiam adquirir locks em sequências diferentes.

**Arquivos:** `backend/src/modules/orders/orders.service.ts`, `backend/src/modules/orders/orders.service.spec.ts`, `docs/DATABASE.md`, `docs/PROJECT_STATUS.md` e este roadmap. Sem migration, dependência ou mudança de contrato HTTP.

**Aceite:** produtos agregados são ordenados por ID antes da primeira baixa; preço, quantidade, total e transação permanecem iguais; teste cobre carrinho em ordem inversa; build, lint e testes afetados passam. A suíte PostgreSQL posterior cobre compras concorrentes em ordem inversa, sem provar ausência universal de deadlocks.

## Baseline de integração executado: F3-00c

**Arquivos:** `docker-compose.integration.yml`, `backend/test/run-postgres-tests.cjs`, `backend/test/jest-postgres.json`, `backend/test/orders.postgres-spec.ts`, script `test:postgres` em `backend/package.json`, `docs/DATABASE.md`, `docs/DEPLOYMENT.md`, `docs/PROJECT_STATUS.md` e este roadmap.

**Aceite observado:** banco temporário e porta local aleatória; as duas migrations aplicadas; cinco testes passaram para valores/estoque, rollback, última unidade concorrente, cancelamento repetido e carrinhos inversos. O runner removeu o container. Nenhuma migration foi aplicada em banco persistente ou de produção. O provedor de pagamento segue a definir.

## Incremento concluído: idempotência de criação de pedido

**Escopo:** `Idempotency-Key` UUID opcional em `POST /orders`, encaminhado pelo BFF e gerado no checkout. A migration aditiva cria `IdempotencyRequest`; hashes da chave e do payload normalizado, pedido e estoque são confirmados numa transação. Retry idêntico retorna o mesmo pedido; chave usada com payload diferente retorna `409`. Clientes legados sem header conservam o comportamento anterior. A chave do checkout é mantida na aba para retry do mesmo corpo e removida após sucesso. Não há pagamento, reserva, expiração nem cobrança nesta entrega.

**Arquivos:** `backend/prisma/schema.prisma`, migration `20261120000000_add_order_idempotency`, DTO, controller e service de pedidos, `backend/test/orders.postgres-spec.ts`, `backend/test/app.e2e-spec.ts`, BFF e checkout do frontend, `docs/API.md`, `docs/DATABASE.md`, `docs/BUSINESS_RULES.md`, `docs/DEPLOYMENT.md`, `docs/PROJECT_STATUS.md` e este roadmap.

**Aceite observado:** nove testes PostgreSQL isolados, incluindo retry sequencial, simultâneo, chave reutilizada com outro corpo e retry após falha; 24 testes HTTP, 13 unitários, build backend/frontend e lint dos arquivos alterados passaram. A migration só foi aplicada ao banco descartável. Para uma publicação futura, aplicar migration antes de backend e frontend. Provedor de pagamento, política de expiração e regras de entrega continuam pendentes.

**Próximo passo:** fechar as decisões comerciais indispensáveis de F3-01, começando pelo provedor de PIX/cartão e pelas regras de valor, prazo e endereço das três modalidades. Depois implementar uma fatia de pagamento ou recebimento por vez e validar no checklist antes de vendas reais.

## Incremento independente: confirmação visual do pedido

Enquanto as decisões de pagamento e recebimento dependem do cliente, o checkout deixa de confiar em `?pedido=`. A tela exibe “pedido recebido” somente após `POST /api/orders` retornar `201` e um ID inteiro positivo. Resposta incompleta preserva carrinho e chave para retry. Não há confirmação de pagamento nem consulta pública do pedido após recarga; essa consulta exigirá identificador não enumerável e prova de posse em entrega futura.

**Arquivos:** checkout, validador `frontend/src/lib/created-order.ts`, teste `frontend/test/created-order.test.mjs`, `docs/API.md`, `docs/BUSINESS_RULES.md`, `docs/PROJECT_STATUS.md` e este roadmap. **Aceite:** URL arbitrária não exibe sucesso; ID inválido não esvazia carrinho; resposta válida exibe o número retornado; build, lint e teste focado passam.

## Incremento independente: feedback de erros no checkout

O checkout passa a apresentar as mensagens de validação de campo devolvidas pelo backend, até cinco por tentativa, e mantém mensagens de negócio e indisponibilidade. Resposta inesperada recebe texto genérico. O alerta é anunciado por tecnologia assistiva; falhas preservam carrinho e chave de retry. A mudança não altera o contrato HTTP, preços, estoque ou regras de pagamento.

**Arquivos:** checkout, `frontend/src/lib/checkout-error.ts`, `frontend/test/checkout-error.test.mjs`, `docs/API.md`, `docs/PROJECT_STATUS.md` e este roadmap. **Aceite:** detalhes de validação aparecem; erros de estoque/BFF aparecem; respostas malformadas não causam erro de renderização; testes focados, lint e build passam.

## Incremento independente: Dashboard operacional

O `/admin` passa a mostrar pedidos pendentes, pedidos em andamento e produtos ativos/esgotados a partir das APIs existentes. Os valores são contagens operacionais, sem receita ou pagamento presumido. Falha de consulta produz erro visível; lista realmente vazia produz zero. Não há migration, endpoint novo ou dependência.

**Arquivos:** `frontend/src/app/admin/page.tsx`, `frontend/src/lib/admin-summary.ts`, `frontend/test/admin-summary.test.mjs`, `docs/PROJECT_STATUS.md` e este roadmap. **Aceite:** contagens coerentes com estados e estoque, links para Pedidos/Produtos, erro distinto de vazio, build/lint e teste focado.

**Sequência sugerida para as telas restantes:** corrigir falhas das listagens administrativas que hoje aparecem como listas vazias; depois melhorar a navegação móvel e ações operacionais de Pedidos/Produtos. O ícone `/perfil` aponta para rota inexistente. Ocultar o link até haver uma necessidade definida de conta de cliente ou acompanhamento seguro de pedido; não criar histórico de compras ou autenticação de cliente por suposição.

## Incremento independente: erro visível na listagem de Pedidos

`/admin/pedidos` agora exibe “Nenhum pedido recebido ainda” somente quando `GET /orders` retorna uma lista vazia com sucesso. Erro HTTP, falha de conexão ou resposta que não seja lista mostram aviso ao operador, sem fingir que não há pedidos. O fetch continua sem cache e usa a API key administrativa apenas no servidor.

**Arquivos:** `frontend/src/app/admin/pedidos/page.tsx`, `frontend/src/lib/admin-orders.ts`, `frontend/test/admin-orders.test.mjs`, `docs/PROJECT_STATUS.md` e este roadmap. **Aceite:** vazio real, erro HTTP, formato inválido e falha de conexão têm resultados distintos; testes focados, lint e build passam. **Próximo:** aplicar a mesma distinção em Produtos, em entrega separada.
