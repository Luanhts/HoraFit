# AGENTS.md - A Hora Fit

> Instruções permanentes para agentes de engenharia de software neste repositório.

## 1. Missão e contexto

A Hora Fit é um e-commerce de produtos fitness com loja pública e operação administrativa. O desenvolvimento deve priorizar segurança, integridade comercial, estabilidade, experiência do cliente e manutenção simples.

- Repositório: https://github.com/Luanhts/HoraFit
- Site: https://www.ahorafitpg.com.br/
- Planejamento: https://trello.com/b/eeE86rNy/hora-fit
- Idioma do produto e da comunicação: português brasileiro (pt-BR).
- Moeda: BRL, apresentada no formato brasileiro.

O Trello e documentos históricos podem estar desatualizados. Antes de agir, confirme o estado no código e diferencie implementação atual, regra aprovada, proposta futura e decisão comercial pendente.

## 2. Stack e estrutura resumidas

- Frontend: Next.js com App Router, React, TypeScript, Tailwind CSS, componentes no padrão shadcn/ui, React Hook Form e Zod.
- Backend: NestJS, TypeScript, Zod e Prisma ORM.
- Banco: PostgreSQL.
- Repositório: duas aplicações independentes em `frontend/` e `backend/`, cada uma com `package.json` e `package-lock.json`; não há workspace ou pacote npm na raiz.
- Infraestrutura local: `docker-compose.yml` sobe somente PostgreSQL; o backend possui Dockerfile com targets separados de migration e runtime.

Versões, rotas, módulos e limitações verificadas estão em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 3. Fontes de verdade

Use esta ordem para resolver divergências:

1. Regras comerciais aprovadas em [docs/BUSINESS_RULES.md](docs/BUSINESS_RULES.md).
2. Código, schema Prisma, migrations e testes para comprovar a implementação.
3. Documentação técnica atual em `docs/`.
4. Planejamento no Trello.
5. Registros históricos, como [docs/roadmap-next-sprint.md](docs/roadmap-next-sprint.md).

O código prova o que está implementado, mas não autoriza inventar políticas comerciais. Quando uma decisão não existir, registre a pendência e peça confirmação.

### O que consultar por tarefa

| Tipo de tarefa | Documentos obrigatórios |
| --- | --- |
| Frontend, rotas, componentes ou integração | [ARCHITECTURE.md](docs/ARCHITECTURE.md), [API.md](docs/API.md) e [PROJECT_STATUS.md](docs/PROJECT_STATUS.md) |
| Backend, controllers, services ou autenticação | [ARCHITECTURE.md](docs/ARCHITECTURE.md), [API.md](docs/API.md) e [BUSINESS_RULES.md](docs/BUSINESS_RULES.md) |
| Banco, Prisma ou migrations | [DATABASE.md](docs/DATABASE.md), [BUSINESS_RULES.md](docs/BUSINESS_RULES.md) e [DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Catálogo, carrinho, checkout, pedidos ou estoque | [BUSINESS_RULES.md](docs/BUSINESS_RULES.md), [API.md](docs/API.md), [DATABASE.md](docs/DATABASE.md), [PROJECT_STATUS.md](docs/PROJECT_STATUS.md) e [COMMERCE_EVOLUTION_PLAN.md](docs/COMMERCE_EVOLUTION_PLAN.md) quando envolver a evolução comercial |
| Segurança, privacidade ou permissões | Este arquivo, [API.md](docs/API.md), [ARCHITECTURE.md](docs/ARCHITECTURE.md) e [PROJECT_STATUS.md](docs/PROJECT_STATUS.md) |
| Docker, ambientes, publicação ou operação | [DEPLOYMENT.md](docs/DEPLOYMENT.md), [DATABASE.md](docs/DATABASE.md) e [API.md](docs/API.md) |
| Backlog, riscos ou decisões pendentes | [PROJECT_STATUS.md](docs/PROJECT_STATUS.md); use o roadmap apenas como histórico |

## 4. Procedimento obrigatório

1. Leia este arquivo e qualquer `AGENTS.md` mais específico nas pastas afetadas.
2. Leia os documentos indicados na tabela acima, os `package.json`, lockfiles e configurações relacionadas.
3. Execute `git status --short` e preserve alterações locais que não pertençam à tarefa. Examine o diff antes de editar arquivos já modificados.
4. Não leia arquivos `.env` reais. Use `.env.example` apenas para nomes e formatos não sensíveis.
5. Localize componentes, controllers, services, schemas, migrations e testes envolvidos. Confirme se a funcionalidade já existe parcial ou totalmente.
6. Para tarefas amplas, apresente um plano curto com escopo, riscos e critérios de aceite antes de editar.
7. Implemente a menor mudança coerente. Não reescreva módulos funcionais nem misture refatoração, redesign e correção sem necessidade.
8. Se uma informação comercial indispensável estiver ausente, faça uma pergunta específica. Para dúvidas não bloqueantes, escolha a alternativa reversível mais conservadora e declare a suposição.

As skills em `.claude/` são auxiliares e podem conter caminhos ou suposições antigas. Valide suas instruções contra o worktree atual.

## 5. Regras permanentes de engenharia

### Geral e TypeScript

- Preserve o gerenciador de pacotes, os lockfiles e a configuração TypeScript existente.
- Use tipos explícitos nas fronteiras; evite `any`, coerções inseguras e supressões sem justificativa.
- Prefira nomes claros, funções pequenas, contratos consistentes e dependências explícitas.
- Não adicione bibliotecas ou serviços externos sem necessidade demonstrável.
- Não introduza mocks, dados fictícios ou fallbacks que escondam falhas em produção. Mocks explícitos e isolados são permitidos em testes.
- Preserve compatibilidade dos contratos; mudanças incompatíveis exigem consumidores, testes e documentação na mesma entrega.

### Frontend

- Preserve o App Router e Server Components por padrão; use Client Components apenas quando necessário.
- Reutilize componentes, tokens e identidade visual existentes. Não redesenhe a loja para resolver um ajuste isolado.
- Preserve responsividade, navegação por teclado, foco, labels, contraste e feedback acessível.
- Use validação de formulário conforme o padrão existente, sem tratar validação do cliente como garantia de servidor.
- Diferencie loading, vazio, erro e sucesso. Não transforme indisponibilidade da API em lista vazia ou 404 sem justificativa.
- Centralize URL, headers e transformação de chamadas à API. Nunca exponha segredos em código cliente ou `NEXT_PUBLIC_*`.
- Revalide preço, estoque e status ativo quando mudanças administrativas afetarem catálogo ou checkout.

### Backend

- Mantenha controllers finos e regras de negócio nos services/camadas existentes.
- Valide payloads externos em runtime com os schemas e pipes adotados; tipos TypeScript isolados não bastam.
- Valide campos, limites, referências, permissões e campos desconhecidos conforme o contrato.
- Use códigos HTTP e erros consistentes sem revelar detalhes internos.
- Autorize endpoints no backend; esconder botões ou proteger uma página Next.js não substitui autorização da API.

### Prisma e PostgreSQL

- Leia `schema.prisma` e todas as migrations relacionadas antes de alterar dados ou relações.
- Use transações nas operações comerciais e garanta consistência sob concorrência.
- Evite N+1, consultas ilimitadas e seleção desnecessária; preserve índices e constraints.
- Toda mudança de schema exige migration versionada, impacto, compatibilidade, backfill e estratégia de rollback quando aplicável.
- Nunca edite migration aplicada nem execute reset, drop, truncate ou seed em dados reais sem autorização explícita.
- Não execute migrations em produção por iniciativa própria.

## 6. Invariantes comerciais críticas

Os detalhes e o estado de cada regra estão em [docs/BUSINESS_RULES.md](docs/BUSINESS_RULES.md).

- Produtos inexistentes, inativos ou sem estoque suficiente não podem ser vendidos.
- Quantidades devem ser inteiras positivas e o estoque nunca pode ficar negativo.
- O navegador não é fonte confiável de preço, total, estoque, pagamento ou permissão.
- Preços, descontos, frete e total devem ser calculados no servidor com representação monetária exata.
- Pedido, itens e movimentação de estoque devem permanecer consistentes e atômicos.
- Itens vendidos devem preservar quantidades e valores históricos; alterações de catálogo não podem mudar totais anteriores.
- Cancelamento deve obedecer às transições permitidas e devolver estoque exatamente uma vez quando a política vigente determinar.
- Duplo clique, retry ou falha de rede não devem produzir pedidos ou cobranças duplicados.
- Não esvazie o carrinho nem exiba sucesso antes da confirmação correspondente do backend.
- Não invente meios de pagamento, frete, taxas, áreas, prazos, retirada, reembolso ou políticas de retenção.
- Operações administrativas sensíveis devem exigir autorização no backend e minimizar exposição de dados pessoais.

## 7. Segurança, privacidade e operação

- Trate autenticação e autorização como requisitos distintos e teste acessos sem sessão ou permissão.
- Preserve e revise cookies, tokens, API keys, `HttpOnly`, `Secure`, `SameSite`, CSRF, CORS e rate limiting conforme o modelo atual.
- Nunca exponha senhas, tokens, chaves, credenciais, dados pessoais, dumps ou conteúdo de `.env` em respostas, código, commits ou logs.
- Não armazene dados de cartão ou CVV. Use mecanismos aprovados do provedor quando houver uma decisão de pagamento.
- Minimize coleta, retorno e registro de dados pessoais. Não envie PII a analytics sem política aprovada.
- Uploads devem validar tipo, tamanho e origem no servidor e usar hosts/storage aprovados.
- Não desative proteções para fazer testes passarem.
- Separe ambientes local, teste, staging e produção; testes automatizados nunca devem usar produção.
- O Compose atual é local. Não reutilize credenciais de desenvolvimento nem exponha o banco em produção.

## 8. Comandos e validação

Execute a partir da raiz e confirme os scripts nos manifests:

```bash
git status --short
npm --prefix frontend run
npm --prefix backend run
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix backend run build
npm --prefix backend run test
npm --prefix backend run test:e2e
```

- O frontend não possui suíte de testes no estado documentado.
- O lint do backend usa `--fix` e o script `format` escreve arquivos. Para validação somente leitura, invoque a ferramenta sem correção automática.
- `db:deploy` altera schema e `db:seed` altera dados; confirme ambiente e autorização antes de executar.
- Não instale dependências nem altere lockfiles apenas para uma verificação não relacionada.
- Use a CLI Prisma instalada no projeto; não permita que `npx` instale outra versão.
- Execute verificações proporcionais à mudança: catálogo, carrinho, checkout, concorrência, permissões, acessibilidade, build, testes e migration quando aplicáveis.
- Nunca afirme que testes passaram sem executá-los; registre comandos, resultados e limitações.

Comandos completos, Docker, portas e variáveis estão em [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 9. Git, deploy e limites de autonomia

- Nunca desfaça alterações do usuário. Não use `git reset --hard`, `git clean -fd`, checkout destrutivo ou force push sem solicitação explícita.
- Não faça commit, push, merge, release, deploy ou alteração remota sem autorização específica.
- Não altere DNS, domínios, chaves, provedores, cobrança ou infraestrutura de produção por iniciativa própria.
- Não execute pedidos, cobranças, reembolsos, notificações ou alterações de estoque reais para testar.
- Use sandbox, mocks e ambientes não produtivos. Operações irreversíveis exigem autorização específica.
- Preserve migrations como job separado do runtime; migration e seed não podem ser efeito colateral do startup da API.
- Interrompa ações com risco de segredo exposto, perda de dados, regressão comercial ou incompatibilidade e proponha alternativa segura.

## 10. Definição de pronto

Uma entrega está pronta quando:

- Critérios de aceite foram atendidos sem mudanças fora do escopo.
- Contratos, segurança e invariantes comerciais foram preservados.
- Verificações relevantes foram executadas e limitações foram registradas.
- Migrations, variáveis e ações manuais estão documentadas sem segredos.
- Documentação afetada e referências cruzadas foram atualizadas.
- Diff final e `git status` foram revisados.

Na resposta final, informe: resultado, arquivos alterados, validação executada, impactos e pendências/riscos.

## 11. Manutenção da documentação

- Atualize o documento que é fonte de verdade para a mudança; evite copiar tabelas completas entre arquivos.
- Atualize `PROJECT_STATUS.md` quando uma ausência for implementada, um risco for corrigido ou uma decisão for tomada.
- Mova decisões comerciais aprovadas de “pendentes” para `BUSINESS_RULES.md` e documente sua implementação nos arquivos técnicos correspondentes.
- Preserve o roadmap como histórico; não reescreva diagnósticos antigos para parecerem atuais.
- Não inclua credenciais ou dados pessoais na documentação.
