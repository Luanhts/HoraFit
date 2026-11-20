# Deploy e operação - A Hora Fit

**Natureza:** configuração operacional verificada e procedimentos de segurança
**Última verificação:** 15/11/2026

Este documento descreve o que está versionado. Não confirma configurações externas, credenciais ou estado de produção.

## Topologia conhecida

- Frontend e backend são aplicações separadas.
- O frontend é documentado como publicado na Vercel, sem configuração Vercel no repositório.
- O provedor do backend e do PostgreSQL de produção não é identificável no checkout.
- `docker-compose.yml` é destinado ao desenvolvimento local e sobe somente PostgreSQL.
- Não há Dockerfile do frontend.
- Não há proxy reverso, TLS, infraestrutura como código ou CI versionados.

## Requisitos de runtime

- O Dockerfile do backend usa Node.js 22 Alpine e npm 11.9.0.
- Next.js 16 exige Node.js compatível com seu requisito de engine; o repositório não possui `.nvmrc`, `.node-version` ou `engines` nos manifests.
- Frontend e backend têm `package-lock.json` independentes.
- Use `npm ci`; não há workspace ou instalação npm na raiz.

## Variáveis de ambiente

Não leia nem publique valores dos arquivos `.env` reais. Os nomes abaixo vêm dos exemplos e do código.

### Frontend

| Variável | Uso |
| --- | --- |
| `API_URL` | URL da API usada preferencialmente no servidor Next.js |
| `NEXT_PUBLIC_API_URL` | Fallback público; não é necessário no fluxo normal servidor-servidor |
| `ADMIN_PASSWORD` | Senha compartilhada do login administrativo |
| `ADMIN_API_KEY` | Chave enviada pelo servidor Next.js ao backend |
| `NODE_ENV` | Controla comportamento de produção, inclusive cookie `Secure` |

### Backend

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL usada pelo Prisma |
| `ADMIN_API_KEY` | Autoriza endpoints administrativos |
| `ORDER_RATE_LIMIT_MAX` | Limite de criação de pedidos por janela |
| `ORDER_RATE_LIMIT_WINDOW_MS` | Janela do rate limiter em milissegundos |
| `TRUST_PROXY_HOPS` | Número opcional de proxies confiáveis |
| `PORT` | Porta HTTP; padrão 3333 |
| `NODE_ENV` | Ambiente do runtime |

`PORT` é consumida pelo código, mas não está em `backend/.env.example` no estado verificado.

### PostgreSQL do Compose

O Compose usa as variáveis padrão `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`, atualmente com valores literais de desenvolvimento. Não copie esses valores para produção nem os exponha em documentação.

## Portas

| Serviço | Porta |
| --- | --- |
| Frontend Next.js | Padrão do Next.js, sem configuração explícita no repositório |
| Backend NestJS | `3333` por padrão, configurável por `PORT` |
| PostgreSQL dentro do container | `5432` |
| PostgreSQL no host via Compose | `5433` |

`backend/.env.example` referencia a porta `5432`. Para um backend executado no host contra o Compose, a porta publicada é `5433`; ajuste a configuração local sem registrar credenciais.

## Docker Compose local

Arquivo: `docker-compose.yml`.

Comportamento:

- serviço único `db`;
- imagem `postgres:16-alpine`;
- restart `always`;
- volume nomeado `postgres_data`;
- porta `5433:5432`;
- sem healthcheck;
- sem frontend, backend, migration ou seed.

O banco é publicado sem restrição explícita a loopback. Trate o Compose como ferramenta local e revise a exposição de rede no ambiente usado.

## Scripts npm

Execute a partir da raiz.

### Frontend

| Objetivo | Comando |
| --- | --- |
| Desenvolvimento | `npm --prefix frontend run dev` |
| Build | `npm --prefix frontend run build` |
| Produção local | `npm --prefix frontend run start` |
| Lint | `npm --prefix frontend run lint` |

Não há script de teste, E2E, cobertura ou typecheck isolado no frontend.

O frontend usa Next.js 16.4.6 com `eslint-config-next` da mesma versão. O script de build fixa `next build --webpack`: a compilação e a checagem TypeScript passaram com Webpack, enquanto Turbopack falhou ao iniciar o processo de CSS no ambiente local de validação. A opção `--webpack` é suportada pelo Next.js 16; reavaliar o bundler em uma mudança isolada depois de validar Turbopack no ambiente de CI/deploy. O build busca Geist e Geist Mono pelo `next/font/google`, portanto o ambiente de build precisa alcançar Google Fonts.

### Backend

| Objetivo | Comando |
| --- | --- |
| Build | `npm --prefix backend run build` |
| Formatar com escrita | `npm --prefix backend run format` |
| Executar | `npm --prefix backend run start` |
| Desenvolvimento | `npm --prefix backend run start:dev` |
| Debug | `npm --prefix backend run start:debug` |
| Produção local | `npm --prefix backend run start:prod` |
| Aplicar migrations | `npm --prefix backend run db:deploy` |
| Executar seed | `npm --prefix backend run db:seed` |
| Lint com correção | `npm --prefix backend run lint` |
| Testes unitários | `npm --prefix backend run test` |
| Testes em watch | `npm --prefix backend run test:watch` |
| Cobertura | `npm --prefix backend run test:cov` |
| Debug de testes | `npm --prefix backend run test:debug` |
| Testes HTTP | `npm --prefix backend run test:e2e` |

O lint do backend inclui `--fix`, e `format` usa `--write`. Ambos podem alterar arquivos. Para inspeção somente leitura, invoque a instalação local das ferramentas sem opções de escrita.

`db:deploy` altera schema e `db:seed` altera dados. Confirme ambiente e autorização antes de executar.

## Dockerfile do backend

Arquivo: `backend/Dockerfile`.

### Stages

| Stage | Responsabilidade |
| --- | --- |
| `base` | Node 22 Alpine e npm 11.9.0 |
| `dependencies` | `npm ci` com dependências completas |
| `build` | Gera Prisma Client e compila NestJS |
| `migration` | Prisma CLI, schema, migrations e seed |
| `runtime` | Dependências de produção e aplicação compilada |

Os targets `migration` e `runtime` executam como usuário `node`. O runtime expõe `3333` e inicia `node dist/src/main.js`.

## Build das imagens

```bash
docker build --target migration -t horafit-backend-migration ./backend
docker build --target runtime -t horafit-backend ./backend
```

O target `migration` executa `prisma migrate deploy` por padrão. O runtime não aplica migration nem seed no startup.

## Processo de release do backend

1. Gerar e validar a migration em ambiente isolado quando houver mudança de schema.
2. Construir a imagem de migration.
3. Executar `prisma migrate deploy` como job separado com configuração segura.
4. Interromper a publicação se a migration falhar.
5. Construir/publicar a imagem de runtime somente após sucesso.
6. Validar `/health` e os fluxos afetados.

Nunca torne migration ou seed efeito colateral de cada reinício da API.

Exemplo documental, sem valores reais:

```bash
docker run --rm --env-file <arquivo-seguro> horafit-backend-migration
docker run --rm --env-file <arquivo-seguro> -p 3333:3333 horafit-backend
```

## Seed

O seed atual insere categorias e produtos iniciais sem apagar pedidos. Execute somente de forma explícita:

```bash
docker run --rm --env-file <arquivo-seguro> horafit-backend-migration npm run db:seed
```

Não execute seed automaticamente. A falta de unicidade de categoria torna execuções concorrentes inseguras.

## Healthcheck

O runtime verifica `GET /health`:

- intervalo: 30 segundos;
- timeout: 5 segundos;
- período inicial: 10 segundos;
- tentativas: 3;
- porta: `PORT` ou 3333.

O endpoint consulta o PostgreSQL. Uma falha do banco torna o container unhealthy, combinando disponibilidade do processo e da dependência.

O PostgreSQL no Compose não possui healthcheck.

## Rate limiting e proxies

- Apenas `POST /orders` possui throttling na aplicação.
- O armazenamento é local à instância; múltiplas réplicas não compartilham contadores.
- O BFF de pedidos não encaminha atualmente o IP original do navegador. O backend pode aplicar um contador compartilhado aos clientes que usam o mesmo servidor/egress do Next.js.
- Produção deve avaliar limite compartilhado em ingress, proxy ou WAF.
- Configure `TRUST_PROXY_HOPS` somente quando a topologia de proxies for conhecida.
- Uma configuração ampla de proxy pode permitir falsificação de IP via headers encaminhados.

## Rollback e backup

- Rollback da aplicação: restaurar uma imagem compatível anterior.
- Migrations não devem ser revertidas automaticamente.
- Mudanças incompatíveis exigem estratégia expansível/contrátil ou backup validado.
- O repositório não contém configuração de backup, retenção ou restauração de produção.

## Validação pós-publicação

1. Confirmar `GET /health` com aplicação e banco saudáveis.
2. Confirmar contrato de `GET /products`; a API retorna ativos e inativos.
3. Validar a loja com produtos ativos, carrinho e criação de pedido exclusivamente em ambiente não produtivo.
4. Validar acesso administrativo sem e com credenciais apropriadas.
5. Validar transições de pedido e reposição de estoque sem usar dados reais.
6. Revisar logs sem expor dados pessoais ou segredos.

## Lacunas operacionais

- Provedor do backend desconhecido no repositório.
- Ausência de CI versionada.
- Ausência de observabilidade, métricas e alertas versionados.
- Ausência de backup/restore documentado para produção.
- CORS sem allowlist explícita.
- Rate limiter não compartilhado.
- Imagens base sem pin de patch ou digest.

Consulte [PROJECT_STATUS.md](PROJECT_STATUS.md) para priorização. Contratos do healthcheck e pedidos estão em [API.md](API.md).
