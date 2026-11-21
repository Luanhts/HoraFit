# Roteiro de execução dos próximos passos — HoraFit

**Atualizado em:** 21/11/2026. **Natureza:** roteiro de trabalho, não autorização de publicação ou de operação financeira. Revalidar este retrato antes de cada entrega.

Este roteiro transforma o [roadmap da Fase 3](ROADMAP_FASE3.md) e o [plano comercial](COMMERCE_EVOLUTION_PLAN.md) em entregas pequenas. As regras aprovadas continuam em [BUSINESS_RULES.md](BUSINESS_RULES.md); pendências e riscos estão em [PROJECT_STATUS.md](PROJECT_STATUS.md). Em caso de divergência, seguir a ordem de fontes de verdade do `AGENTS.md`.

## Ponto de partida verificado

- Catálogo, carrinho, criação idempotente de pedido, baixa transacional de estoque, cancelamento com reposição e painel básico de produtos/pedidos existem.
- O dashboard administrativo mostra contagens operacionais. As telas de Pedidos e Produtos distinguem falha de carregamento de lista vazia; o ajuste de Produtos está no worktree local, ainda sem commit ou deploy nesta fotografia.
- O backend tem testes unitários, HTTP e uma suíte com PostgreSQL descartável. O frontend tem testes focados de lógica, além de lint e build. Não presumir que esses testes validam a versão publicada.
- PIX/cartão, estados financeiros, modalidades de retirada/entrega/envio, webhook, conciliação, notificações e Analytics não estão implementados no código examinado. O provedor e as regras detalhadas seguem pendentes com o cliente.
- O checkout atual registra pedido e reduz estoque antes de pagamento. **Não classificar pedido criado como venda paga nem liberar vendas online reais com esse fluxo.**

## Protocolo para cada entrega

1. Ler `AGENTS.md`, os documentos obrigatórios para a área e o código/testes envolvidos. Conferir `git status --short` e preservar mudanças locais existentes.
2. Definir uma tarefa, arquivos, dependências, risco e critérios de aceite. Se depender de regra comercial não aprovada, registrar a pergunta e avançar somente em trabalho independente.
3. Fazer a menor alteração coerente, sem misturar redesign, refatoração e nova regra de negócio.
4. Testar cenários de sucesso, vazio, erro e autorização quando aplicáveis; executar lint e build afetados. Para mudanças em pedido/estoque/schema, usar também a suíte PostgreSQL isolada.
5. Atualizar a documentação tocada pela entrega e registrar resultado dos testes, limitações e próximo item. Revisar `git diff --check` e o diff antes de concluir.
6. Commit, push, migration em ambiente persistente, deploy, pedidos reais, cobranças, reembolsos e mensagens exigem autorização específica. Não executar essas ações como efeito colateral do roteiro.

## Portão de operação antes de qualquer publicação comercial

Confirmar, por leitura e com o responsável pelo ambiente, qual versão do checkout está publicada. Se a versão pública permitir criar pedidos e baixar estoque sem pagamento, tratar a entrada em operação com vendas online como bloqueada até existir fluxo financeiro aprovado, testado e operável. Não fazer pedido real para descobrir o estado do ambiente. Usar o [checklist de entrada em operação](ROADMAP_FASE3.md#checklist-de-entrada-em-operação) para o corte final.

## Fila ordenada enquanto o cliente não está disponível

Cada linha é uma entrega separada. **P/M/G** são estimativas relativas, não prazo fechado.

| Ordem | Tarefa | Prioridade / esforço | Dependência | Aceite principal |
| --- | --- | --- | --- | --- |
| 1 | Corrigir a navegação pública que aponta para `/perfil` inexistente | P1 / P | Nenhuma | Nenhum link da loja leva a página inexistente; carrinho e navegação existente continuam acessíveis |
| 2 | Ajustar idioma do documento e nomes acessíveis dos controles principais | P1 / P | Nenhuma | `lang` corresponde a pt-BR; ícones de ação têm nome para leitor de tela; navegação por teclado preservada |
| 3 | Tornar o painel administrativo utilizável em telas pequenas | P1 / M | Telas existentes | Dashboard, Produtos e Pedidos têm navegação e tabelas utilizáveis em viewport móvel, sem esconder ações críticas |
| 4 | Tratar exclusão de produto referenciado por pedido | P1 / M | Regra existente de preservar histórico | API devolve conflito de negócio compreensível; painel orienta inativar o produto; nenhum item histórico é apagado |
| 5 | Revisar proteção das mutações administrativas | P0 antes de ações financeiras / M | Modelo atual de sessão e API key | Acesso sem sessão, origem indevida e operações sensíveis são recusados; testes cobrem as fronteiras no Next.js e no NestJS |

As tarefas 1 a 4 não devem criar conta de cliente, fluxo de pagamento ou política de entrega. A tarefa 5 prepara a área administrativa para futuras ações financeiras; identidade individual e auditoria entram antes dessas ações, conforme o plano comercial. A orientação da [OWASP sobre autorização por função](https://api-security.owasp.org/editions/2023/en/0xa5-broken-function-level-authorization/) e [proteção de mutações autenticadas](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) serve como referência de revisão, sem substituir os contratos do projeto.

### Primeira execução concreta: link de perfil

**Escopo:** `frontend/src/components/shop/Navbar.tsx`, teste focado se houver comportamento novo, e documentação de status. O componente apresenta um link para `/perfil`, mas a rota não existe e ainda não há decisão para conta de cliente. Remover ou ocultar o acesso até existir requisito aprovado; preservar o acesso ao carrinho e os links institucionais.

**Aceite:** a navegação não oferece `/perfil`; desktop e mobile não perdem links válidos; lint e build do frontend passam. Não criar uma página de perfil vazia para satisfazer o link.

## Decisões a obter do cliente, sem bloqueio das tarefas acima

Registrar respostas explícitas em `BUSINESS_RULES.md` antes de implementar o fluxo dependente:

1. Provedor de PIX e cartão, política de captura/parcelamento, validade do PIX e prazo de reserva de estoque.
2. Ponto e horário da retirada; área, taxa e prazo da entrega local em Ponta Grossa; regra de taxa, serviço e prazo do envio nacional.
3. Campos obrigatórios de endereço, eventual CPF/CNPJ e instruções que o cliente verá no checkout.
4. Cancelamento, reembolso, estorno, chargeback, pagamento tardio e momento de devolução de estoque.
5. Canal, destinatários, conteúdo e consentimento para notificações; política de retenção de dados pessoais.

Não preencher valores ou prazos por suposição. Quando uma decisão chegar, implementar **uma fatia vertical por vez**: modelo aditivo e testes isolados; modalidade e dados de recebimento; estado financeiro neutro; adaptador do provedor em sandbox; webhook idempotente; reconciliação; checkout; painel; checklist de operação. Seguir as dependências COM-04 a COM-16 do [plano comercial](COMMERCE_EVOLUTION_PLAN.md#14-tasks-em-ordem-de-dependência). Não integrar transportadoras, comprar frete ou gerar etiquetas.

## Validação proporcional à tarefa

Comandos a partir da raiz do repositório, após conferir os scripts atuais. Usar somente os que se aplicam à mudança:

```powershell
git status --short
node --test frontend/test/*.test.mjs
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix backend run build
npm --prefix backend run test -- --runInBand
npm --prefix backend run test:e2e -- --runInBand
npm --prefix backend run test:postgres
git diff --check
```

`test:postgres` cria banco descartável e deve ser reservado a alterações comerciais ou de persistência. O lint do backend usa `--fix`; para inspecionar sem escrita, invocar o ESLint local diretamente nos arquivos afetados. Se o Prisma Client precisar ser regenerado no Windows, encerrar o backend local que mantém o engine aberto antes do build. Nenhum comando acima aplica migration em banco persistente ou realiza deploy.

## Prompt de continuidade para uma próxima sessão

> Atue como Engenheiro de Software Sênior e Product Engineer da HoraFit. Leia `AGENTS.md`, `docs/BUSINESS_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/ROADMAP_FASE3.md` e `docs/PLANO_EXECUCAO_PROXIMOS_PASSOS.md`. Verifique `git status --short` e a implementação real. Execute somente a primeira tarefa ainda necessária da fila independente, começando pelo link `/perfil` se ele ainda apontar para rota inexistente. Defina escopo e aceite, preserve mudanças existentes, implemente uma entrega pequena, rode testes proporcionais, lint e build, e atualize a documentação. Se a tarefa depender de decisão comercial ausente, registre a pendência e avance para a próxima tarefa independente. Não presuma pagamento, logística ou Analytics implementados. Não faça commit, push, migration em banco persistente, deploy, cobranças, pedidos reais ou envio de mensagens sem autorização específica. Ao final, informe arquivos alterados, testes executados, limitações e próxima tarefa.
