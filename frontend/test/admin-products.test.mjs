import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchAdminProducts } from '../src/lib/admin-products.ts';

test('preserves successful empty lists and the existing cache policy', async () => {
  const calls = [];
  const data = await fetchAdminProducts('https://api.example', async (url, options) => {
    calls.push({ url, options });
    return Response.json([]);
  });

  assert.deepEqual(data, { produtos: [], categories: [] });
  assert.deepEqual(calls, [
    { url: 'https://api.example/products', options: { cache: 'no-store' } },
    { url: 'https://api.example/categories', options: { next: { revalidate: 3600 } } },
  ]);
});

test('returns both lists when the API succeeds', async () => {
  const produto = { id: 1, name: 'Produto', category: { id: 2, name: 'Categoria' } };
  const data = await fetchAdminProducts('https://api.example', async (url) =>
    Response.json(url.endsWith('/products') ? [produto] : [produto.category]),
  );

  assert.deepEqual(data, { produtos: [produto], categories: [produto.category] });
});

test('rejects HTTP failures in either request', async () => {
  for (const failingPath of ['/products', '/categories']) {
    await assert.rejects(
      fetchAdminProducts('https://api.example', async (url) =>
        url.endsWith(failingPath)
          ? Response.json({}, { status: 503 })
          : Response.json([]),
      ),
      /503/,
    );
  }
});

test('rejects malformed lists and connection failures', async () => {
  for (const malformedPath of ['/products', '/categories']) {
    await assert.rejects(
      fetchAdminProducts('https://api.example', async (url) =>
        Response.json(url.endsWith(malformedPath) ? { items: [] } : []),
      ),
      /lista.*inválida/,
    );
  }
  await assert.rejects(
    fetchAdminProducts('https://api.example', async () => {
      throw new Error('offline');
    }),
    /offline/,
  );
});
