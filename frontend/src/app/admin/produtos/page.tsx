import { getApiUrl } from '@/lib/api';
import { fetchAdminProducts } from '@/lib/admin-products';
import ProdutosClient from './ProdutosClient';

export const dynamic = 'force-dynamic';

export default async function ProdutosPage() {
  let data: Awaited<ReturnType<typeof fetchAdminProducts>>;

  try {
    data = await fetchAdminProducts(getApiUrl());
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Meus Produtos</h1>
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          <p>Não foi possível carregar produtos e categorias. Tente novamente.</p>
          <a href="/admin/produtos" className="mt-3 inline-block font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">
            Recarregar página
          </a>
        </div>
      </div>
    );
  }

  return <ProdutosClient initialProdutos={data.produtos} categories={data.categories} />;
}
