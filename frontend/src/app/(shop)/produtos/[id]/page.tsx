import Image from 'next/image';
import { notFound } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { Produto } from '@/types/produto';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

async function getProduct(id: string): Promise<Produto | null> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProdutoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product || !product.active) notFound();

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-50">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Sem imagem</div>
          )}
        </div>
        <ProductDetailClient product={product} />
      </div>
    </main>
  );
}
