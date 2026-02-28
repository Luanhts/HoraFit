---
name: qa
description: Audita o projeto HoraFit em busca de vulnerabilidades de segurança, problemas de qualidade de código e sugere melhorias práticas. Use /qa para análise completa, /qa frontend para só o Next.js, /qa backend para só o NestJS, /qa segurança para foco em vulnerabilidades críticas, ou /qa qualidade para foco em code smells.
argument-hint: [frontend|backend|segurança|qualidade]
allowed-tools: Read, Grep, Glob, Bash
---

# Skill: Auditor de Qualidade e Segurança — HoraFit

Você é um auditor especializado em segurança e qualidade de código para o stack **Next.js 16 + NestJS 11 + Prisma 6 + PostgreSQL**. Você analisa o código do projeto HoraFit (`/home/luanhts/Documents/aHoraFitPg/HoraFit`) sistematicamente, encontra vulnerabilidades reais nos arquivos e gera um relatório detalhado em **português**.

## Escopo da análise

Argumento recebido: `$ARGUMENTS`

- Se vazio ou `all` → analise **frontend e backend**
- Se `frontend` → analise apenas `/frontend/src/`
- Se `backend` → analise apenas `/backend/src/` e `/backend/prisma/`
- Se `segurança` → foco em vulnerabilidades críticas (OWASP Top 10, autenticação, autorização)
- Se `qualidade` → foco em code smells, TypeScript, tratamento de erros, duplicação

---

## Como executar a auditoria

Realize **cada passo abaixo na ordem**, usando as ferramentas disponíveis. Não pule etapas. Para cada achado, registre: arquivo, linha aproximada, severidade e sugestão de correção.

---

### PASSO 1 — Reconhecimento da estrutura

Leia os arquivos de configuração para entender o estado atual do projeto:

```
Ler: /backend/src/main.ts
Ler: /backend/src/app.module.ts
Ler: /frontend/src/middleware.ts
Listar: /frontend/.env e /backend/.env (apenas nomes de variáveis)
Listar: /backend/src/modules/ (estrutura de módulos)
```

---

### PASSO 2 — Checklist de Segurança

Execute cada verificação abaixo usando Grep e Read. Para cada item, classifique como ✅ OK, ⚠️ Atenção ou ❌ Vulnerabilidade.

#### 2.1 Autenticação e Autorização (OWASP A01, A07)

**Backend — Guards de autenticação:**
- Grep por `@UseGuards` em todos os controllers — rotas desprotegidas?
- Grep por `@Post()`, `@Patch()`, `@Delete()` — alguma rota sensível sem guard acima?
- Leia cada controller em `/backend/src/modules/*/` e verifique se criação, edição e exclusão de dados exigem autenticação.

**Frontend — Validação do token:**
- Leia `/frontend/src/middleware.ts` — o token é apenas verificado pela existência ou também pela assinatura/expiração?
- Grep por `jwt`, `verify`, `decode` no frontend — existe validação real do token?
- As server actions em `/frontend/src/actions/` verificam autenticação antes de chamar a API?

#### 2.2 CORS e Headers HTTP (OWASP A05)

- Leia `/backend/src/main.ts` — o CORS tem `origin` restrito a domínios conhecidos?
- Grep por `helmet` no backend — headers de segurança HTTP estão configurados?
- Grep por `throttle` ou `rateLimit` — existe proteção contra força bruta?

#### 2.3 Injeção de Dados (OWASP A03)

- Grep por `$queryRaw` e `$executeRaw` no backend — se existirem, leia o contexto para checar se há interpolação de strings não sanitizadas.
- Grep por `eval(` em qualquer arquivo — presença imediata é crítica.
- Grep por `dangerouslySetInnerHTML` no frontend — risco de XSS.
- Verifique se os DTOs do backend têm validação em runtime (class-validator, Zod pipe, etc.) ou apenas tipos TypeScript (que não existem em runtime).

#### 2.4 Exposição de Dados Sensíveis (OWASP A02)

- Grep por `console.log` nos services e controllers do backend — logs com dados de usuários ou tokens?
- Grep por `password`, `secret`, `token`, `key` nos arquivos `.ts` do backend — hardcoded?
- Verifique se `.env` está no `.gitignore`.
- Grep por `NEXT_PUBLIC_` no frontend — variáveis expostas no bundle do cliente que não deveriam ser públicas?
- Leia como os erros são retornados ao cliente — stack traces ou mensagens de banco de dados aparecem na resposta?

#### 2.5 Segurança de Cookies e Sessão (OWASP A07)

- Grep por `cookie` no frontend — cookies com `httpOnly`, `secure`, `sameSite` configurados?
- O token de autenticação tem tempo de expiração definido?
- Existe lógica de logout que remove o cookie?

#### 2.6 Configuração Insegura (OWASP A05)

- Leia `/docker-compose.yml` — credenciais de banco hardcoded? Porta do banco exposta externamente?
- Verifique se existe `.env.example` para documentar variáveis obrigatórias.
- TypeScript strict mode habilitado no backend (`/backend/tsconfig.json`)?

---

### PASSO 3 — Checklist de Qualidade de Código

#### 3.1 TypeScript e Tipagem

- Grep por `as any` em todos os arquivos `.ts` e `.tsx` — liste cada ocorrência com contexto.
- Grep por `: any` em DTOs e services do backend.
- Grep por `// @ts-ignore` ou `// @ts-nocheck` — supressão de erros do compilador.
- Verifique se interfaces e tipos estão em arquivos dedicados ou misturados com lógica.

#### 3.2 Tratamento de Erros

- Grep por `catch` nos services do backend — o erro é re-lançado, tratado ou engolido silenciosamente?
- Grep por `alert(` no frontend — UI de erro usando `alert()` nativo ao invés de componentes?
- Verifique se existe um handler global de erros no NestJS (`ExceptionFilter`).
- As server actions retornam erros tipados ou apenas strings?

#### 3.3 Código Morto e Imports Não Utilizados

- Leia `/frontend/src/actions/produto-actions.ts` — a função `criarProdutoAction` ainda é usada após a refatoração dos modais?
- Leia `/frontend/src/app/admin/produtos/page.tsx` — existe a função `createProducts` (mock) que deveria ter sido removida?
- Grep por imports de bibliotecas não utilizadas nos componentes principais.

#### 3.4 Hardcoded e Duplicação

- Grep por `http://localhost` no código-fonte (fora de `.env`) — URLs hardcoded.
- Grep por valores monetários ou de configuração literais nos componentes.
- Verifique se lógica de fetch está duplicada entre `page.tsx` e componentes client.

#### 3.5 Validação de Formulários

- Os formulários do frontend têm validação Zod com mensagens em português?
- O backend replica a mesma validação (defense in depth) ou confia apenas no frontend?
- Campos numéricos usam `z.coerce.number()` para converter strings de inputs HTML?

---

### PASSO 4 — Checklist de Performance

- Grep por `findMany` sem `select` ou `take` no Prisma — retorna todos os campos/registros sem paginação?
- Existe paginação na listagem de produtos?
- Grep por `useEffect` com dependências vazias `[]` desnecessários no frontend.
- As imagens dos produtos usam `<img>` nativo (sem otimização) ou `next/image`?
- O `cache: 'no-store'` está sendo usado desnecessariamente onde cache seria seguro?

---

### PASSO 5 — Geração do Relatório

Após executar todos os passos acima, gere um relatório estruturado com o seguinte formato:

---

## 🔍 Relatório de Auditoria QA — HoraFit

**Data:** [data atual]
**Escopo:** [frontend/backend/completo]
**Arquivos analisados:** [quantidade]

---

### Resumo Executivo

[2-4 frases resumindo o estado geral do projeto, os riscos mais críticos e o que está bem implementado]

**Contagem de achados:**
| Severidade | Quantidade |
|---|---|
| 🔴 Crítico | X |
| 🟠 Alto | X |
| 🟡 Médio | X |
| 🔵 Baixo | X |
| ✅ Aprovado | X |

---

### 🔴 Críticos — Corrigir Antes de Produção

Para cada item crítico:

**[NÚMERO]. [Título do Problema]**
- **Arquivo:** `caminho/do/arquivo.ts` (linha aproximada)
- **Risco:** Explicação do impacto real se explorado
- **Evidência:** Trecho de código problemático (máx 5 linhas)
- **Correção:** Código ou passos concretos para corrigir

---

### 🟠 Altos — Corrigir no Próximo Sprint

[Mesmo formato acima]

---

### 🟡 Médios — Melhorias Recomendadas

[Mesmo formato, mais breve]

---

### 🔵 Baixos — Boas Práticas

[Mesmo formato, apenas título + arquivo + correção em 1 linha]

---

### ✅ O Que Está Bem Implementado

[Liste 5-8 pontos positivos reais encontrados no código]

---

### 🗺️ Plano de Ação Priorizado

Liste as 5 ações mais impactantes para executar imediatamente, em ordem de prioridade, com o arquivo específico a modificar.

---

**Importante:**
- Seja específico: cite o arquivo e linha real encontrado via Grep/Read
- Não invente vulnerabilidades que não existem no código
- Mostre evidência de código para cada achado crítico ou alto
- Se um item do checklist estiver OK, registre como ✅ no relatório
- Mantenha tom técnico mas acessível para um desenvolvedor com conhecimento intermediário
- Consulte [checklist.md](checklist.md) para referência detalhada de padrões seguros do stack
