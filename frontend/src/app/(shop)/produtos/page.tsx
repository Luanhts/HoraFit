import { API_URL } from '@/lib/api';
import { Produto } from '@/types/produto';
import ProductCatalogClient from './ProductCatalogClient';

export const dynamic = 'force-dynamic';

async function getProducts(): Promise<Produto[]> {
  try {
    const res = await fetch(`${API_URL}/products`, { cache: 'no-store' });

    if (!res.ok) return [];

    const products: Produto[] = await res.json();
    return products.filter((product) => product.active);
  } catch {
    return [];
  }
}

export default async function ProdutosPage() {
  const products = await getProducts();

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">Cardápio</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-950">Produtos disponíveis</h1>
        <p className="max-w-2xl text-muted-foreground">
          Escolha seus produtos saudáveis e finalize o pedido em poucos passos.
        </p>
      </div>

      <ProductCatalogClient products={products} />
    </main>
  );
}
