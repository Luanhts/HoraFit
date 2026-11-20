import type { Order } from '@/types/order';
import type { Produto } from '@/types/produto';

export function summarizeAdminOperations(
  orders: Pick<Order, 'status'>[],
  products: Pick<Produto, 'active' | 'stock'>[],
) {
  return {
    pendingOrders: orders.filter((order) => order.status === 'PENDING').length,
    activeOrders: orders.filter((order) =>
      ['CONFIRMED', 'PREPARING', 'READY'].includes(order.status),
    ).length,
    activeProducts: products.filter((product) => product.active).length,
    outOfStockProducts: products.filter((product) => product.active && product.stock === 0).length,
  };
}
