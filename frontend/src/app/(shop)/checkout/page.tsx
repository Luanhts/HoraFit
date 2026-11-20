'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/features/cart/cart-context';
import { formatCurrency, getCartTotal } from '@/features/cart/cart-utils';
import { getCreatedOrderId } from '@/lib/created-order';

const pendingAttemptStorageKey = 'horafit_checkout_attempt_v1';

type PendingAttempt = { payloadHash: string; key: string };

function readPendingAttempt(): PendingAttempt | null {
  try {
    const raw = sessionStorage.getItem(pendingAttemptStorageKey);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' &&
      value !== null &&
      'payloadHash' in value &&
      typeof value.payloadHash === 'string' &&
      /^[0-9a-f]{64}$/.test(value.payloadHash) &&
      'key' in value &&
      typeof value.key === 'string' &&
      /^[0-9a-f-]{36}$/.test(value.key)
    ) {
      return { payloadHash: value.payloadHash, key: value.key };
    }
  } catch {
    // O retry continua protegido enquanto esta página permanecer aberta.
  }
  return null;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const pendingAttempt = useRef<PendingAttempt | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const requestBody = JSON.stringify({
        customerName,
        customerPhone,
        customerEmail,
        notes,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      });
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(requestBody));
      const payloadHash = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('');
      let attempt = pendingAttempt.current;
      if (!attempt || attempt.payloadHash !== payloadHash) {
        attempt = readPendingAttempt();
      }
      if (!attempt || attempt.payloadHash !== payloadHash) {
        attempt = { payloadHash, key: crypto.randomUUID() };
        try {
          sessionStorage.setItem(pendingAttemptStorageKey, JSON.stringify(attempt));
        } catch {
          // O retry na página atual ainda reutiliza a chave em memória.
        }
      }
      pendingAttempt.current = attempt;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attempt.key },
        body: requestBody,
      });

      const body = await res.json().catch(() => null);

      const orderId = getCreatedOrderId(res.status, body);
      if (orderId === null) {
        setError(
          res.ok
            ? 'A resposta do pedido veio incompleta. Tente novamente.'
            : body?.message ?? 'Não foi possível finalizar o pedido.',
        );
        return;
      }

      pendingAttempt.current = null;
      try {
        sessionStorage.removeItem(pendingAttemptStorageKey);
      } catch {
        // A sessão pode não permitir armazenamento.
      }
      setCreatedOrderId(orderId);
      clearCart();
    } catch {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdOrderId !== null) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
          <h1 className="mb-3 text-3xl font-extrabold text-gray-950">Pedido recebido</h1>
          <p className="mb-6 text-muted-foreground">Seu pedido #{createdOrderId} foi registrado com sucesso.</p>
          <Button asChild>
            <Link href="/produtos">Continuar comprando</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">Adicione produtos ao carrinho antes de finalizar.</p>
          <Button asChild>
            <Link href="/produtos">Ver produtos</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-extrabold tracking-tight">Finalizar pedido</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome *</Label>
            <Input id="customerName" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Telefone *</Label>
            <Input id="customerPhone" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">E-mail</Label>
            <Input id="customerEmail" type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>

          {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

          <Button disabled={isSubmitting} className="w-full rounded-xl py-6 text-base">
            {isSubmitting ? 'Enviando...' : 'Enviar pedido'}
          </Button>
        </form>

        <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold">Resumo</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between gap-4 text-sm">
                <span>{item.quantity}x {item.product.name}</span>
                <span>{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between border-t pt-4 font-bold">
            <span>Total</span>
            <span>{formatCurrency(getCartTotal(items))}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
