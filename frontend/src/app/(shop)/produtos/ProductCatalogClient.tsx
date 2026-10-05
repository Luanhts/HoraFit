'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/features/cart/cart-context';
import { formatCurrency } from '@/features/cart/cart-utils';
import { Produto } from '@/types/produto';

export default function ProductCatalogClient({ products, error }: { products: Produto[]; error?: string | null }) {
  const { addItem } = useCart();
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  function handleAddToCart(product: Produto, price: number) {
    addItem({ id: product.id, name: product.name, price, imageUrl: product.imageUrl, stock: product.stock });
    setAddedProductId(product.id);
    toast.success(`${product.name} adicionado ao carrinho.`);

    window.setTimeout(() => setAddedProductId(null), 1400);
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-10 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
        Nenhum produto disponível no momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const price = Number(product.price);
        const isAvailable = product.active && product.stock > 0;
        const wasAdded = addedProductId === product.id;

        return (
          <article key={product.id} className="flex flex-col rounded-3xl border bg-white p-3 shadow-sm">
            <Link href={`/produtos/${product.id}`} className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem imagem</div>
              )}
            </Link>

            <div className="flex flex-1 flex-col gap-3 p-2 pt-4">
              <div className="flex items-center justify-between gap-3">
                <Badge className="bg-secondary text-white hover:bg-secondary">{product.category.name}</Badge>
              </div>

              <div>
                <h2 className="line-clamp-2 text-lg font-bold text-gray-900">{product.name}</h2>
                {product.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>}
              </div>

              <div className="mt-auto space-y-2 pt-2">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-xl text-primary">{formatCurrency(price)}</strong>
                  <Button
                    disabled={!isAvailable}
                    onClick={() => handleAddToCart(product, price)}
                    className={`gap-2 rounded-xl transition-all cursor-pointer hover:shadow-md active:scale-[0.97] ${
                      wasAdded ? 'bg-secondary text-white shadow-md hover:bg-secondary/80' : ''
                    }`}
                  >
                    {wasAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                    {wasAdded ? 'Adicionado' : isAvailable ? 'Adicionar' : 'Esgotado'}
                  </Button>
                </div>

                {wasAdded && (
                  <p className="text-right text-xs font-semibold text-primary" role="status">
                    Produto adicionado ao carrinho.
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
