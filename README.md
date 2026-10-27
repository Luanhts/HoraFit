# HoraFit
A hora fit pg

## Publicação

O frontend e o backend são serviços separados. No ambiente do frontend (Vercel), configure `API_URL` com a URL HTTPS pública do backend, além de `ADMIN_PASSWORD` e `ADMIN_API_KEY`. Não é necessário expor `NEXT_PUBLIC_API_URL` para o fluxo normal da loja.

No ambiente do backend, configure `DATABASE_URL` e `ADMIN_API_KEY`. O `Dockerfile` possui targets separados para migração e runtime, evitando alterar o schema durante cada reinício da API:

```bash
docker build --target migration -t horafit-backend-migration ./backend
docker run --rm --env-file <arquivo-seguro> horafit-backend-migration

docker build --target runtime -t horafit-backend ./backend
docker run --rm --env-file <arquivo-seguro> -p 3333:3333 horafit-backend
```

Execute o target `migration` como job de release antes de substituir a versão da API. Se a migração falhar, não publique a nova imagem. O rollback da aplicação consiste em restaurar a imagem anterior; migrations não devem ser revertidas automaticamente. Para mudanças incompatíveis, use migrations expansíveis ou restaure um backup validado do banco.

Depois do primeiro deploy, use a imagem de migração para executar uma única vez o seed atual, que insere o catálogo inicial sem apagar produtos ou pedidos existentes:

```bash
docker run --rm --env-file <arquivo-seguro> horafit-backend-migration npm run db:seed
```

Não execute o seed automaticamente a cada inicialização.

Validação após a publicação:

1. `GET https://<api>/health` deve responder `{ "status": "ok", "database": "ok" }`.
2. `GET https://<api>/products` deve retornar produtos ativos.
3. Abra a loja, adicione um produto, atualize a quantidade, recarregue a página e finalize um pedido.
4. Confirme o pedido em `/admin/pedidos` e avance seu status respeitando as transições mostradas pela interface.
