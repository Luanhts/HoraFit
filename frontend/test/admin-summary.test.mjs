import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeAdminOperations } from '../src/lib/admin-summary.ts';

test('counts operational orders and active product stock without financial metrics', () => {
  const summary = summarizeAdminOperations(
    [
      { status: 'PENDING' },
      { status: 'CONFIRMED' },
      { status: 'PREPARING' },
      { status: 'READY' },
      { status: 'DELIVERED' },
      { status: 'CANCELED' },
    ],
    [
      { active: true, stock: 0 },
      { active: true, stock: 2 },
      { active: false, stock: 0 },
    ],
  );

  assert.deepEqual(summary, {
    pendingOrders: 1,
    activeOrders: 3,
    activeProducts: 2,
    outOfStockProducts: 1,
  });
});

test('returns zero counts for genuinely empty lists', () => {
  assert.deepEqual(summarizeAdminOperations([], []), {
    pendingOrders: 0,
    activeOrders: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
  });
});
