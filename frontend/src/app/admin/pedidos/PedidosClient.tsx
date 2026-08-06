'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/features/cart/cart-utils';
import { API_URL } from '@/lib/api';
import { Order, OrderStatus } from '@/types/order';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
};

const STATUS_OPTIONS = Object.entries(STATUS_LABEL) as Array<[OrderStatus, string]>;

type Props = {
  initialOrders: Order[];
};

export default function PedidosClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  async function handleStatusChange(orderId: number, status: OrderStatus) {
    setUpdatingOrderId(orderId);

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert('Não foi possível atualizar o status do pedido.');
        return;
      }

      const updatedOrder: Order = await res.json();
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
      );
    } catch {
      alert('Não foi possível conectar ao servidor.');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum pedido recebido ainda.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pedido</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Itens</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-semibold">#{order.id}</TableCell>
            <TableCell>
              <div className="font-medium">{order.customerName}</div>
              <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
            </TableCell>
            <TableCell>
              <div className="max-w-[320px] text-sm text-muted-foreground">
                {order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(', ')}
              </div>
            </TableCell>
            <TableCell className="font-bold">{formatCurrency(order.total)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                  {STATUS_LABEL[order.status]}
                </Badge>
                <Select
                  value={order.status}
                  disabled={updatingOrderId === order.id}
                  onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                >
                  <SelectTrigger className="h-8 w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TableCell>
            <TableCell>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
