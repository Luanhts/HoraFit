# HoraFit
A hora fit pg

## Publicação

O frontend e o backend são serviços separados. No ambiente do frontend (Vercel), configure `API_URL` com a URL HTTPS pública do backend, além de `ADMIN_PASSWORD` e `ADMIN_API_KEY`. Não é necessário expor `NEXT_PUBLIC_API_URL` para o fluxo normal da loja.

No ambiente do backend, configure `DATABASE_URL` e `ADMIN_API_KEY`. O diretório `backend` inclui um `Dockerfile` que executa `prisma migrate deploy` antes de iniciar a API. Depois do primeiro deploy, execute uma única vez `npm run db:seed` no serviço do backend para inserir o catálogo inicial sem apagar produtos ou pedidos existentes.

Validação após a publicação:

1. `GET https://<api>/health` deve responder `{ "status": "ok", "database": "ok" }`.
2. `GET https://<api>/products` deve retornar produtos ativos.
3. Abra a loja, adicione um produto, atualize a quantidade, recarregue a página e finalize um pedido.
4. Confirme o pedido em `/admin/pedidos` e avance seu status respeitando as transições mostradas pela interface.
