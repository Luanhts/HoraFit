import { getAdminApiKey } from '@/lib/admin-api';
import { fetchAdminOrders } from '@/lib/admin-orders';
import { getApiUrl } from '@/lib/api';
import type { Order } from '@/types/order';
import PedidosClient from './PedidosClient';

export const dynamic = 'force-dynamic';

export default async function AdminPedidosPage() {
  let orders: Order[] | null = null;

  try {
    orders = await fetchAdminOrders(getApiUrl(), getAdminApiKey());
  } catch (error) {
    console.error('Falha ao buscar pedidos admin:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">Acompanhe os pedidos recebidos pela loja.</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {orders === null ? (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar os pedidos. Recarregue a página para tentar novamente.
          </p>
        ) : (
          <PedidosClient initialOrders={orders} />
        )}
      </div>
    </div>
  );
}
