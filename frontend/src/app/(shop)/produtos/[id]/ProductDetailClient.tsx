'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/cart-context';
import { formatCurrency } from '@/features/cart/cart-utils';
import { Produto } from '@/types/produto';

export default function ProductDetailClient({ product }: { product: Produto }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const price = Number(product.price);
  const isAvailable = product.active && product.stock > 0;

  function decrementQuantity() {
    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
  }

  function incrementQuantity() {
    setQuantity((currentQuantity) => Math.min(product.stock, currentQuantity + 1));
  }

  function handleAddToCart() {
    addItem(
      {
        id: product.id,
        name: product.name,
        price,
        imageUrl: product.imageUrl,
        stock: product.stock,
      },
      quantity,
    );
  }

  return (
    <section className="flex flex-col justify-center">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge className="bg-secondary text-white hover:bg-secondary">{product.category.name}</Badge>
        <Badge variant="outline" className={isAvailable ? 'text-primary' : 'text-destructive'}>
          {isAvailable ? `${product.stock} em estoque` : 'Produto esgotado'}
        </Badge>
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 md:text-5xl">{product.name}</h1>

      {product.description && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">{product.description}</p>
      )}

      <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold text-muted-foreground">Preço</span>
            <div className="text-3xl font-black text-primary">{formatCurrency(price)}</div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" disabled={!isAvailable || quantity <= 1} onClick={decrementQuantity}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center text-lg font-bold">{quantity}</span>
            <Button variant="outline" size="icon" disabled={!isAvailable || quantity >= product.stock} onClick={incrementQuantity}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-5 font-bold">
          <span>Total</span>
          <span>{formatCurrency(price * quantity)}</span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button disabled={!isAvailable} onClick={handleAddToCart} className="gap-2 rounded-xl py-6 text-base">
            <ShoppingCart className="h-4 w-4" />
            Adicionar ao carrinho
          </Button>
          <Button asChild variant="outline" className="rounded-xl py-6 text-base">
            <Link href="/carrinho">Ver carrinho</Link>
          </Button>
        </div>
      </div>

      <Link href="/produtos" className="mt-6 text-sm font-semibold text-muted-foreground hover:text-primary">
        Voltar para o cardápio
      </Link>
    </section>
  );
}
