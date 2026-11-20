const assert = require('node:assert/strict');
const test = require('node:test');
const { isCurrentClient } = require('../scripts/ensure-prisma-client.cjs');

test('accepts the generated client for equivalent schema formatting and version', () => {
  assert.equal(isCurrentClient('model Order { id Int @id }', 'model Order {\n id Int @id\n}', '6.19.3', '6.19.3', true), true);
});

test('requires generation when schema, version or engine changes', () => {
  assert.equal(isCurrentClient('model Order { id Int @id }', 'model Product { id Int @id }', '6.19.3', '6.19.3', true), false);
  assert.equal(isCurrentClient('model Order {}', 'model Order {}', '6.19.3', '6.18.0', true), false);
  assert.equal(isCurrentClient('model Order {}', 'model Order {}', '6.19.3', '6.19.3', false), false);
});
