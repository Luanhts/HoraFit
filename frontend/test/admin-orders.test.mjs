import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchAdminOrders } from '../src/lib/admin-orders.ts';

test('preserves a genuinely empty order list from a successful response', async () => {
  const calls = [];
  const orders = await fetchAdminOrders('https://api.example', 'test-key', async (url, options) => {
    calls.push({ url, options });
    return Response.json([]);
  });

  assert.deepEqual(orders, []);
  assert.equal(calls[0].url, 'https://api.example/orders');
  assert.equal(calls[0].options.headers['x-admin-api-key'], 'test-key');
  assert.equal(calls[0].options.cache, 'no-store');
});

test('rejects HTTP failures and malformed lists instead of returning empty', async () => {
  await assert.rejects(
    fetchAdminOrders('https://api.example', 'test-key', async () => Response.json({}, { status: 503 })),
    /503/,
  );
  await assert.rejects(
    fetchAdminOrders('https://api.example', 'test-key', async () => Response.json({ orders: [] })),
    /lista inválida/,
  );
});

test('propagates connection failures', async () => {
  await assert.rejects(
    fetchAdminOrders('https://api.example', 'test-key', async () => {
      throw new Error('offline');
    }),
    /offline/,
  );
});
