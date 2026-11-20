import assert from 'node:assert/strict';
import test from 'node:test';
import { getCheckoutErrorMessages } from '../src/lib/checkout-error.ts';

test('shows field validation details returned by the order API', () => {
  assert.deepEqual(
    getCheckoutErrorMessages({
      message: 'Dados inválidos.',
      errors: [
        { field: 'customerPhone', message: 'Telefone inválido.' },
        { field: 'customerEmail', message: 'E-mail inválido.' },
      ],
    }),
    ['Telefone inválido.', 'E-mail inválido.'],
  );
});

test('shows business and BFF errors when there are no field details', () => {
  assert.deepEqual(
    getCheckoutErrorMessages({ message: 'Estoque insuficiente para Produto.' }),
    ['Estoque insuficiente para Produto.'],
  );
  assert.deepEqual(
    getCheckoutErrorMessages({ message: 'A loja está temporariamente indisponível.' }),
    ['A loja está temporariamente indisponível.'],
  );
});

test('uses a safe fallback for malformed responses', () => {
  assert.deepEqual(getCheckoutErrorMessages(null), ['Não foi possível finalizar o pedido.']);
  assert.deepEqual(getCheckoutErrorMessages({ message: { detail: 'interno' } }), [
    'Não foi possível finalizar o pedido.',
  ]);
});
