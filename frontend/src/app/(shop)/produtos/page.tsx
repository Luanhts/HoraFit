import { getApiUrl } from '@/lib/api';
import { Produto } from '@/types/produto';
import ProductCatalogClient from './ProductCatalogClient';

export const dynamic = 'force-dynamic';

type ProductsResult =
  | { products: Produto[]; error: null }
  | { products: []; error: string };

async function getProducts(): Promise<ProductsResult> {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/products`, { cache: 'no-store' });

    if (!res.ok) {
      console.error(`Falha ao buscar catálogo: GET /products retornou ${res.status}.`);
      return { products: [], error: 'Não foi possível carregar o catálogo agora.' };
    }

    const products: Produto[] = await res.json();
    return { products: products.filter((product) => product.active), error: null };
  } catch (error) {
    console.error('Falha ao conectar com a API para buscar catálogo:', error);
    return { products: [], error: 'Não foi possível conectar ao servidor de produtos.' };
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

      <ProductCatalogClient products={products.products} error={products.error} />
    </main>
  );
}
