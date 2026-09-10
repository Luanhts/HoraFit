import { getAdminApiKey } from '@/lib/admin-api';
import { getApiUrl } from '@/lib/api';
import { Order } from '@/types/order';
import PedidosClient from './PedidosClient';

export const dynamic = 'force-dynamic';

async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${getApiUrl()}/orders`, {
      cache: 'no-store',
      headers: { 'x-admin-api-key': getAdminApiKey() },
    });

    if (!res.ok) {
      console.error(`Falha ao buscar pedidos admin: GET /orders retornou ${res.status}.`);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Falha ao conectar com a API para buscar pedidos admin:', error);
    return [];
  }
}

export default async function AdminPedidosPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">Acompanhe os pedidos recebidos pela loja.</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <PedidosClient initialOrders={orders} />
      </div>
    </div>
  );
}
