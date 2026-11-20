import assert from 'node:assert/strict';
import test from 'node:test';
import { getCreatedOrderId } from '../src/lib/created-order.ts';

test('accepts a created order with a positive integer ID', () => {
  assert.equal(getCreatedOrderId(201, { id: 42 }), 42);
});

test('does not confirm a failed or incomplete order response', () => {
  assert.equal(getCreatedOrderId(400, { id: 42 }), null);
  assert.equal(getCreatedOrderId(200, { id: 42 }), null);
  assert.equal(getCreatedOrderId(201, null), null);
  assert.equal(getCreatedOrderId(201, {}), null);
  assert.equal(getCreatedOrderId(201, { id: '42' }), null);
  assert.equal(getCreatedOrderId(201, { id: 0 }), null);
  assert.equal(getCreatedOrderId(201, { id: 1.5 }), null);
});
