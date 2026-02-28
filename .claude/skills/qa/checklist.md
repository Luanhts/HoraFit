# Checklist de Referência — Stack HoraFit

> Arquivo de referência usado pela skill `/qa`. Contém descrições detalhadas de cada
> categoria de risco para o stack Next.js 16 + NestJS 11 + Prisma 6 + PostgreSQL.

---

## OWASP Top 10 — Aplicado ao Stack

### A01 — Broken Access Control
**O que checar:**
- Endpoints `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` exigem `@UseGuards(AuthGuard)`?
- Middleware do Next.js valida a assinatura JWT (não apenas a existência do cookie)?
- Server actions verificam autenticação antes de chamar a API?
- Existe verificação de propriedade? (ex: usuário só pode editar seus próprios pedidos)

**Grep patterns:**
```
@UseGuards        → deve aparecer antes de @Post/@Patch/@Delete
jwt.verify        → validação real de token
jwt.decode        → apenas decodifica, não valida assinatura (risco!)
```

---

### A02 — Cryptographic Failures
**O que checar:**
- Senhas armazenadas com hash (bcrypt/argon2) ou em plain text?
- Tokens JWT com secret forte (mín. 32 chars) ou padrão "secret"?
- HTTPS forçado em produção?
- Cookies com flag `secure` e `httpOnly`?

**Grep patterns:**
```
bcrypt | argon2   → hashing de senha
JWT_SECRET        → secret fraco?
password          → hardcoded em código?
```

---

### A03 — Injection
**O que checar:**
- `$queryRaw` ou `$executeRaw` com string interpolation (`${variavel}`)? → SQL Injection
- `dangerouslySetInnerHTML` no React? → XSS
- `eval()` em qualquer lugar? → Code Injection
- Prisma ORM parameterizado corretamente? (padrão é seguro)

**Nota:** Prisma com queries normais (`.create()`, `.findMany()`) é seguro por default.
O risco existe apenas em `$queryRaw` sem tagged template literal.

**Seguro:**
```typescript
this.prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`
```
**Inseguro:**
```typescript
this.prisma.$queryRaw(`SELECT * FROM users WHERE id = ${id}`)
```

---

### A04 — Insecure Design
**O que checar:**
- Rate limiting nas rotas de autenticação (login, registro)?
- Exposição de IDs sequenciais (permite enumeration de recursos)?
- Soft delete implementado? (registros críticos nunca devem ser deletados permanentemente)
- Dados sensíveis retornados desnecessariamente na resposta?

---

### A05 — Security Misconfiguration
**O que checar:**
- `app.enableCors()` sem `origin` restrito?
- Porta do PostgreSQL exposta no `docker-compose.yml`?
- Headers de segurança HTTP (Helmet)?
- Stack traces aparecendo em respostas de erro?
- TypeScript com `strict: false` no backend?

**Configuração correta do CORS:**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

**Helmet básico:**
```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

### A06 — Vulnerable and Outdated Components
**O que checar:**
- Versões de dependências com vulnerabilidades conhecidas?
- `npm audit` retorna vulnerabilidades críticas?

**Comando:** `cd frontend && npm audit --audit-level=high`
**Comando:** `cd backend && npm audit --audit-level=high`

---

### A07 — Identification and Authentication Failures
**O que checar:**
- Login com credenciais inválidas dá mensagem genérica ("credenciais inválidas") ou específica ("email não encontrado")?
- Token JWT tem tempo de expiração (`exp` claim)?
- Existe refresh token com rotação?
- Logout invalida o token no servidor (blacklist) ou apenas remove o cookie?
- Proteção contra brute force no endpoint de login?

---

### A09 — Security Logging and Monitoring Failures
**O que checar:**
- Tentativas de login falhas são logadas?
- Operações críticas (criar produto, deletar) têm audit trail?
- `console.log` com dados sensíveis no código de produção?
- Logger estruturado (Winston, Pino) ou apenas `console.log`?

---

## Checklist Específico NestJS

### DTOs e Validação
```
❌ Problema: DTOs com apenas tipagem TypeScript não validam em runtime
✅ Solução: class-validator + class-transformer + ValidationPipe global

// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // Remove campos não declarados no DTO
  forbidNonWhitelisted: true, // Rejeita requisições com campos extras
  transform: true,        // Converte tipos automaticamente
}));
```

### Exception Filters
```
❌ Problema: Erros do Prisma (com código P2002) expostos diretamente
✅ Solução: ExceptionFilter global que converte erros internos em respostas seguras

// Nunca retornar ao cliente:
{ error: { code: 'P2002', meta: { target: ['sku'] } } }

// Sempre retornar:
{ statusCode: 400, message: 'Este SKU já está em uso.' }
```

### Guards e Decorators
```typescript
// ✅ Padrão correto para rotas protegidas
@Controller('products')
@UseGuards(JwtAuthGuard)  // Protege toda a controller
export class ProductsController {

  @Get()
  @Public()  // Decorator para exceções públicas
  findAll() { ... }

  @Post()   // Herda proteção da controller
  create() { ... }
}
```

---

## Checklist Específico Next.js

### Middleware
```typescript
// ❌ Apenas verifica existência (qualquer string serve como "token")
const token = request.cookies.get("token");
if (!token) redirect('/sign-in');

// ✅ Validar assinatura JWT (requer JWT_SECRET no .env)
import { jwtVerify } from 'jose';
try {
  await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET));
} catch {
  redirect('/sign-in');
}
```

### Server Actions
```typescript
// ❌ Sem autenticação
export async function criarProdutoAction(data: any) {
  return fetch('/products', { method: 'POST', body: JSON.stringify(data) });
}

// ✅ Verificar token + tipar dados
export async function criarProdutoAction(data: ProdutoFormData) {
  const token = cookies().get('token')?.value;
  if (!token) throw new Error('Não autorizado');

  return fetch('/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}
```

### Variáveis de Ambiente
```
NEXT_PUBLIC_*  → Exposto no bundle do cliente (JavaScript público)
               → Use APENAS para: URL da API, chaves públicas de analytics
               → NUNCA para: JWT secrets, chaves de API privadas, credenciais

Sem NEXT_PUBLIC_ → Disponível apenas no servidor (Server Components, Server Actions)
                 → Use para: secrets, conexões de banco, chaves privadas
```

---

## Checklist Específico Prisma

### Performance e N+1
```typescript
// ❌ N+1: Uma query por produto para buscar categoria
const products = await prisma.product.findMany();
for (const product of products) {
  const category = await prisma.category.findUnique({ where: { id: product.categoryId } });
}

// ✅ Eager loading com include
const products = await prisma.product.findMany({
  include: { category: true }
});
```

### Paginação
```typescript
// ❌ Retorna TODOS os produtos (problema com grandes volumes)
findMany()

// ✅ Com paginação
findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' }
})
```

### Erros Prisma — Mapeamento Seguro
| Código Prisma | Significado | Resposta Segura ao Cliente |
|---|---|---|
| P2002 | Unique constraint violada | "Este valor já está em uso" |
| P2025 | Registro não encontrado | "Recurso não encontrado" |
| P2003 | Foreign key violation | "Referência inválida" |
| P2000 | Valor muito longo | "Dado inválido" |

Nunca exponha o código Prisma `P2002` ou a estrutura `meta.target` ao cliente.

---

## Níveis de Severidade

| Nível | Critério | Prazo de Correção |
|---|---|---|
| 🔴 Crítico | Exploração imediata possível, perda de dados ou acesso não autorizado | Antes de ir a produção |
| 🟠 Alto | Risco significativo com pré-condições simples | Próximo sprint |
| 🟡 Médio | Risco limitado, defesa em profundidade | Próximo mês |
| 🔵 Baixo | Boas práticas, sem risco imediato | Backlog |
| ✅ OK | Implementado corretamente | — |

---

## Comandos de Diagnóstico Rápido

```bash
# Vulnerabilidades em dependências
cd frontend && npm audit --audit-level=moderate
cd backend && npm audit --audit-level=moderate

# Verificar se .env está no gitignore
cat /home/luanhts/Documents/aHoraFitPg/HoraFit/.gitignore | grep .env

# Tipos TypeScript no backend
cat /home/luanhts/Documents/aHoraFitPg/HoraFit/backend/tsconfig.json | grep -A5 "compilerOptions"

# Verificar endpoints sem guard
grep -r "@Post\|@Patch\|@Delete\|@Put" backend/src --include="*.ts" -l
```
