'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/features/cart/cart-context';
import { formatCurrency } from '@/features/cart/cart-utils';
import { Produto } from '@/types/produto';

export default function ProductCatalogClient({ products }: { products: Produto[] }) {
  const { addItem } = useCart();

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
                <span className="text-xs text-muted-foreground">Estoque: {product.stock}</span>
              </div>

              <div>
                <h2 className="line-clamp-2 text-lg font-bold text-gray-900">{product.name}</h2>
                {product.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>}
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <strong className="text-xl text-primary">{formatCurrency(price)}</strong>
                <Button
                  disabled={!isAvailable}
                  onClick={() => addItem({ id: product.id, name: product.name, price, imageUrl: product.imageUrl, stock: product.stock })}
                  className="gap-2 rounded-xl"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isAvailable ? 'Adicionar' : 'Esgotado'}
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
