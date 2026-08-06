'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/cart-context';
import { formatCurrency, getCartTotal } from '@/features/cart/cart-utils';

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity } = useCart();
  const total = getCartTotal(items);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-extrabold tracking-tight">Meu carrinho</h1>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-10 text-center">
          <p className="mb-4 text-muted-foreground">Seu carrinho está vazio.</p>
          <Button asChild>
            <Link href="/produtos">Ver produtos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex flex-col gap-4 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold text-gray-950">{item.product.name}</h2>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.product.price)} cada</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.product.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button asChild className="w-full rounded-xl py-6 text-base">
              <Link href="/checkout">Finalizar pedido</Link>
            </Button>
          </aside>
        </div>
      )}
    </main>
  );
}
