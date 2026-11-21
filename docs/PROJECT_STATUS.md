# Status do projeto - A Hora Fit

**Natureza:** diagnóstico técnico, riscos e propostas
**Data da fotografia:** 15/11/2026
**Método:** inspeção estática do worktree; sem acesso a produção ou `.env` reais

Este documento registra o estado observado em uma data. Não é uma lista de funcionalidades autorizadas nem uma fonte de regras comerciais. Regras aprovadas ficam em [BUSINESS_RULES.md](BUSINESS_RULES.md).

## Atualização incremental — 20/11/2026

Em 21/11/2026, o link para `/perfil` foi restaurado a pedido do responsável e a rota passou a exibir uma página pública informativa. Ela direciona para contato e catálogo, sem sugerir acesso a dados pessoais ou histórico de compras. Conta de cliente e consulta segura de pedidos continuam pendentes de definição e implementação.

Em 21/11/2026, a listagem administrativa de Produtos passou a distinguir listas vazias válidas de falhas HTTP, de conexão ou de formato. Falhas de produtos ou categorias exibem aviso e opção de recarregar, sem renderizar uma tabela vazia enganosa. O catálogo vazio e os filtros sem resultados têm mensagens distintas.

A listagem administrativa de Pedidos agora distingue resposta válida e vazia de falha HTTP, conexão ou formato inesperado. Em falha, exibe aviso e não renderiza “Nenhum pedido recebido ainda”. O ajuste mantém a autorização e o contrato atual, sem migration.

O `/admin` deixou de ser um texto provisório e agora mostra contagens operacionais de pedidos pendentes/em andamento e produtos ativos/esgotados, com links para as telas existentes. A leitura é dinâmica e falhas da API geram erro visível, sem exibir zeros fictícios. O painel não apresenta receita nem presume pagamento confirmado. A necessidade de conta de cliente segue pendente.

O checkout agora apresenta mensagens específicas de validação retornadas pela API, em uma região anunciada como alerta. Erros de estoque e indisponibilidade continuam visíveis; resposta malformada usa mensagem genérica. Falhas preservam carrinho e chave idempotente. O frontend ganhou um teste focado para o tratamento desses erros, sem suíte de navegador.

A confirmação do checkout agora depende de resposta `201` com ID válido da API, em memória na página. Uma URL com `?pedido=` não mostra mais sucesso. Resposta incompleta mantém carrinho e chave para retry; após recarga, a confirmação visual não é restaurada. A futura consulta pública segura do pedido ainda depende de identificador não enumerável e prova de posse.

O checkout agora envia `Idempotency-Key` e reutiliza a chave em retry do mesmo payload na mesma aba. O backend persiste hash da chave, hash do payload e ID do pedido na transação de criação. Retry com a mesma chave não duplica pedido nem baixa; dados diferentes retornam `409`. A terceira migration é aditiva e passou na suíte PostgreSQL descartável (nove cenários). Clientes legados sem header continuam sujeitos a duplicação. Nenhuma migration foi aplicada em produção.

O responsável confirmou que a cópia examinada é a versão atual e que as etapas de pagamento, recebimento e Analytics provavelmente não foram implementadas. A leitura do schema, rotas e frontend sustenta a ausência dessas funcionalidades nesta versão. A prontidão para vendas com PIX/cartão e as três modalidades aprovadas permanece bloqueada; veja [ROADMAP_FASE3.md](ROADMAP_FASE3.md).

O cálculo de `unitPrice`, `subtotal` e `total` em `OrdersService.create` passou a usar `Prisma.Decimal` de ponta a ponta. Subtotal ou total acima do limite de `Decimal(10,2)` retorna erro de negócio antes da criação do pedido. A fotografia e a lista de riscos abaixo permanecem como registro de 15/11/2026; o risco de cálculo intermediário em ponto flutuante está corrigido nesta cópia de trabalho, ainda não publicada.

Os itens agregados agora são ordenados por `productId` antes das baixas de estoque. Isso padroniza a ordem de aquisição dos locks entre carrinhos equivalentes e reduz o risco de deadlock. A criação com chave tem idempotência; a expiração de estoque pendente continua ausente.

A suíte `test:postgres` passou com PostgreSQL 16 descartável: aplicou três migrations e validou nove cenários de criação, rollback, concorrência, cancelamento e idempotência. Isso cobre o fluxo comercial atual em banco real, sem provar resistência a carga ou ausência universal de deadlocks. As seções abaixo continuam sendo a fotografia histórica de 15/11/2026.

## Resumo executivo

A Hora Fit possui um MVP integrado de catálogo, carrinho local, criação de pedidos, administração de produtos e gestão operacional de pedidos. O backend valida produtos, usa preços do banco, baixa estoque transacionalmente e repõe estoque no cancelamento.

O projeto ainda não representa um e-commerce completo. Pagamento e modelagem de recebimento não existem; o andamento operacional atual não distingue modalidade, endereço, envio ou rastreio. Pedidos públicos consomem estoque antes de pagamento; não há expiração de pendências ou confirmação pública segura. A idempotência por chave e os testes PostgreSQL foram adicionados após a fotografia original; o frontend não possui suíte automatizada.

## Decisões comerciais aprovadas

- Pagamento online integrado por PIX e cartão.
- Retirada na loja, entrega local em Ponta Grossa e envio nacional.
- Logística executada exclusivamente pela loja, sem contratação de transporte, cálculo de rotas, gestão de entregadores ou despacho automatizado pelo sistema.
- Registro de pedidos, pagamentos, dados de recebimento, andamento das mercadorias, cancelamentos e pendências operacionais.

Essas decisões ainda não estão implementadas. A proposta técnica e sua ordem de execução estão em [COMMERCE_EVOLUTION_PLAN.md](COMMERCE_EVOLUTION_PLAN.md).

## Funcionalidades implementadas

### Loja

- Home com produtos reais.
- Catálogo e detalhe de produto.
- Filtragem de produtos inativos no frontend.
- Carrinho persistido em `localStorage` e sincronizado entre abas.
- Formulário de checkout com nome, telefone, e-mail opcional e observações.
- Criação de pedido por Route Handler e API NestJS.
- Páginas institucionais de contato e sobre.

### Backend e banco

- Módulos de produtos, categorias e pedidos.
- Validação Zod estrita para bodies e IDs.
- Preço autoritativo obtido do banco.
- Agregação de itens repetidos.
- Baixa condicional de estoque dentro de transação Prisma.
- Criação atômica de pedido e itens.
- Fluxo explícito de status.
- Cancelamento com reposição transacional exatamente uma vez no fluxo atual.
- Healthcheck com consulta ao PostgreSQL.
- Rate limiting em `POST /orders`.

### Administração

- Login por senha compartilhada e cookie de sessão.
- Dashboard operacional com contagens de pedidos e produtos, sem métricas financeiras.
- Proteção de páginas `/admin/**`.
- API administrativa protegida por chave.
- Criação, edição, listagem e exclusão de produtos.
- Listagem e criação de categorias pela API.
- Listagem, busca/filtros locais e detalhe de pedidos.
- Alteração de status conforme transições permitidas.

## Funcionalidades parciais

| Área | Estado verificado |
| --- | --- |
| Catálogo | Sem busca, ordenação, paginação ou filtro público real por categoria |
| Carrinho | Não valida o formato persistido nem revalida preço/estoque antes de exibir |
| Dinheiro | Banco usa Decimal, mas cálculo intermediário usa `number` |
| Confirmação | Mostra sucesso após resposta válida da API; não permite rever a confirmação após recarga |
| Categorias | API lista/cria; sem tela completa, edição, exclusão ou unicidade |
| Upload | Seletor visual não envia arquivo; operação real usa URL |
| Produtos admin | Falhas de carregamento são visíveis; sem paginação |
| Pedidos admin | Sem paginação, atualização automática, histórico ou operador responsável |
| Histórico | Valores financeiros são congelados; nome/imagem/categoria vêm do produto atual |
| Autenticação admin | Uma senha e uma API key compartilhadas, sem usuários, papéis ou auditoria |
| Rate limiting | Em memória por instância; o BFF não encaminha o IP original e pode agrupar clientes pelo egress do Next.js |
| Responsividade | Loja funcional; menu mobile e admin ainda têm limitações |
| Acessibilidade | `lang="en"`, controles sem nomes acessíveis e modais sem gestão completa de foco |
| SEO | Metadata mínima; sem sitemap, robots, canonical, Open Graph ou dados estruturados |
| Privacidade | Sem política versionada de retenção, anonimização ou direitos do titular |
| Observabilidade | Healthcheck e logs básicos; sem métricas, correlação ou alertas |

## Funcionalidades ausentes

- Integração técnica de PIX e cartão, status financeiro e provedor de pagamento, embora os dois meios estejam comercialmente aprovados.
- Webhooks, deduplicação de eventos, captura, estorno ou reembolso.
- Modelagem das três modalidades aprovadas, endereço, taxa, prazo, rastreio e área atendida.
- Proteção obrigatória para clientes legados que não enviam chave idempotente.
- Expiração de pedidos pendentes e liberação automática de estoque.
- Confirmação pública segura e consulta do pedido pelo cliente.
- Conta autenticada, dados de perfil e histórico do cliente; `/perfil` é somente uma página pública informativa.
- Histórico de status.
- Ledger ou auditoria de movimentação de estoque.
- Usuários administrativos individuais e permissões granulares.
- Testes frontend, E2E de navegador e testes com PostgreSQL real.
- CI versionada.
- Upload e storage de imagens.

## Riscos atuais

### P0 - integridade comercial e prontidão operacional

| Risco | Impacto |
| --- | --- |
| Pedido público baixa estoque sem pagamento | Pedidos abandonados ou falsos podem indisponibilizar catálogo |
| Cliente sem chave idempotente | Retry ou repetição pode criar pedido e baixa duplicados |
| Confirmação sem consulta pública | Após recarga, o cliente não consegue rever o pedido com segurança |
| Pagamento e recebimento completos ausentes | O fluxo operacional atual não possui ciclo financeiro, modalidade, endereço, taxa, envio ou rastreio |
| Sem teste com PostgreSQL real | Atomicidade, locks e concorrência não são validados no banco real |
| Cálculo intermediário em ponto flutuante | Possibilidade de divergência monetária em evoluções futuras |

### P1 - segurança, escala e manutenção

- Produtos inativos são expostos pela API pública.
- Exclusão física de produto pode gerar conflito de FK não tratado.
- Categorias duplicadas são permitidas.
- Listagens não possuem paginação e pedidos retornam PII completa ao administrador.
- A tela administrativa de Produtos ainda pode exibir falhas da API como ausência de dados; Pedidos já mostra erro distinto.
- CORS está habilitado sem allowlist explícita.
- Next Image aceita qualquer host HTTPS.
- A chave administrativa compartilhada não identifica o operador.
- `PrismaService` pode ser instanciado em múltiplos módulos.
- O banco não reforça quantidades, preços e estoque com constraints `CHECK`.
- Faltam índices para FKs, status e datas.
- O backend usa configuração TypeScript/ESLint permissiva em alguns pontos.

### P2 - experiência e crescimento

- Acessibilidade e navegação móvel incompletas.
- SEO técnico mínimo.
- Ausência de filtros e ordenação server-side.
- Ausência de analytics, indicadores administrativos e notificações; a política de notificações não foi aprovada.

Prioridades são recomendações técnicas, não autorização para implementar todo o backlog.

## Testes e validação

### Frontend

- Não possui runner, scripts ou arquivos de teste.
- Build e lint são as verificações automatizadas disponíveis.

### Backend

- Nove casos unitários no estado verificado.
- Vinte e três casos HTTP no estado verificado.
- Testes HTTP substituem `PrismaService` por mock.
- Não aplicam migrations nem conectam a PostgreSQL.
- Não validam locks, rollback real, deadlock ou compras concorrentes no banco.
- O bootstrap de `main.ts`, CORS e `trust proxy` não são exercitados pela suíte HTTP.

## Melhorias propostas

Estas são propostas técnicas e dependem de priorização:

1. Adicionar testes isolados com PostgreSQL real para pedido, estoque, cancelamento e concorrência.
2. Idempotência do checkout com chave e constraint única: implementada após a fotografia; manter testes de regressão.
3. Substituir confirmação por consulta segura com identificador não enumerável.
4. Corrigir cálculo monetário intermediário para Decimal ou centavos inteiros.
5. Projetar expiração/liberação de pedidos pendentes após aprovação do prazo e das exceções.
6. Restringir CORS e hosts de imagem aos domínios aprovados.
7. Separar `PrismaService` em módulo compartilhado e revisar pools.
8. Adicionar índices e constraints após análise de dados/migration.
9. Adicionar paginação e minimização de PII em pedidos.
10. Criar CI com build, lint sem escrita e testes.
11. Melhorar acessibilidade, responsividade e SEO.
12. Substituir autenticação compartilhada por identidade individual antes de disponibilizar ações financeiras.

## Decisões comerciais pendentes

Antes de implementar as decisões aprovadas, o responsável ainda deve definir:

- provedor de pagamento;
- validade do PIX, captura e parcelamento do cartão;
- prazo da reserva e expiração de pedido pendente;
- relação entre pagamento aprovado e confirmação operacional;
- cancelamento financeiro, reembolso, estorno e chargeback;
- tratamento de pagamento tardio após liberação da reserva;
- ponto, horário e procedimento de retirada;
- área exata, taxa e prazo da entrega local;
- regra de taxa, serviço e prazo do envio nacional;
- campos obrigatórios do endereço e eventual necessidade jurídica de CPF/CNPJ;
- cancelamento depois do envio e regra de devolução ao estoque;
- prova de posse para consulta pública e rastreio;
- momento em que o carrinho será limpo no fluxo de pagamento;
- política para pedidos legados não terminais que já retiveram estoque;
- conta de cliente ou acompanhamento somente por token;
- política de notificações;
- storage e ciclo de vida de imagens;
- retenção e anonimização de dados pessoais;
- limites máximos e volume esperado de catálogo e pedidos.

Quando aprovada, a decisão deve migrar para [BUSINESS_RULES.md](BUSINESS_RULES.md) e orientar mudanças em API, banco, arquitetura e deploy.

## Estado documental e operacional

- `README.md` funciona como índice e resumo; os detalhes de deploy e rate limiting ficam em `DEPLOYMENT.md`.
- `backend/README.md` permanece como template genérico do NestJS, com badges e instruções que não representam o HoraFit.
- `docker-compose.yml` publica PostgreSQL em `5433`; `backend/.env.example` referencia `5432`.
- `PORT` é consumida, mas não aparece no exemplo de ambiente do backend.
- Não há configuração versionada do provedor do backend, CI, backup ou observabilidade.
- Skills em `.claude/` contêm caminhos e pressupostos antigos, como `middleware.ts` e JWT; devem ser validadas contra o código.

## Roadmap histórico

[roadmap-next-sprint.md](roadmap-next-sprint.md) registra a análise de 27/10/2026 e deve ser preservado como histórico.

Algumas seções iniciais ficaram desatualizadas:

- cancelamento agora repõe estoque transacionalmente;
- atualização de status usa controle concorrente;
- `POST /orders` agora possui throttling;
- a contagem posterior de testes HTTP passou de 22 para 23.

O próprio roadmap registra parte dessa evolução no final. Este documento é a referência para o estado consolidado de 15/11/2026.

## Referências técnicas

- Arquitetura: [ARCHITECTURE.md](ARCHITECTURE.md)
- Regras comerciais: [BUSINESS_RULES.md](BUSINESS_RULES.md)
- API: [API.md](API.md)
- Banco: [DATABASE.md](DATABASE.md)
- Deploy: [DEPLOYMENT.md](DEPLOYMENT.md)
- Plano de evolução comercial: [COMMERCE_EVOLUTION_PLAN.md](COMMERCE_EVOLUTION_PLAN.md)
