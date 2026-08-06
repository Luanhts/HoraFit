import { API_URL } from '@/lib/api';
import { Order } from '@/types/order';
import PedidosClient from './PedidosClient';

export const dynamic = 'force-dynamic';

async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_URL}/orders`, { cache: 'no-store' });

    if (!res.ok) return [];

    return res.json();
  } catch {
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
