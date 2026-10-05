'use client';

import { Fragment, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, RotateCcw, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/features/cart/cart-utils';
import { Order, OrderStatus } from '@/types/order';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendente', CONFIRMED: 'Confirmado', PREPARING: 'Preparando',
  READY: 'Pronto', DELIVERED: 'Entregue', CANCELED: 'Cancelado',
};

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELED'], CONFIRMED: ['PREPARING', 'CANCELED'],
  PREPARING: ['READY', 'CANCELED'], READY: ['DELIVERED', 'CANCELED'],
  DELIVERED: [], CANCELED: [],
};

export default function PedidosClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    return orders.filter((order) => {
      const date = new Date(order.createdAt);
      const matchesQuery = !normalizedQuery || [String(order.id), order.customerName, order.customerPhone, order.customerEmail ?? '']
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(normalizedQuery));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesFrom = !fromDate || date >= new Date(`${fromDate}T00:00:00`);
      const matchesTo = !toDate || date <= new Date(`${toDate}T23:59:59.999`);
      return matchesQuery && matchesStatus && matchesFrom && matchesTo;
    });
  }, [orders, query, statusFilter, fromDate, toDate]);

  async function handleStatusChange(orderId: number, status: OrderStatus) {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(body?.message ?? 'Não foi possível atualizar o status do pedido.');
        return;
      }
      const updatedOrder = body as Order;
      setOrders((current) => current.map((order) => order.id === updatedOrder.id ? updatedOrder : order));
      toast.success(`Pedido #${updatedOrder.id} atualizado para ${STATUS_LABEL[updatedOrder.status]}.`);
    } catch {
      toast.error('Não foi possível conectar ao servidor.');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function clearFilters() {
    setQuery(''); setStatusFilter('all'); setFromDate(''); setToDate('');
  }

  const hasFilters = Boolean(query || statusFilter !== 'all' || fromDate || toDate);
  if (orders.length === 0) return <p className="text-sm text-muted-foreground">Nenhum pedido recebido ainda.</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-4">
        <div className="min-w-[220px] flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="order-search">Buscar</label>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="order-search" className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pedido, cliente, telefone ou e-mail" />
          </div>
        </div>
        <div className="w-[170px] space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | OrderStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="all">Todos</SelectItem>{Object.entries(STATUS_LABEL).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
          </SelectContent></Select>
        </div>
        <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground" htmlFor="order-from">De</label><Input id="order-from" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></div>
        <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground" htmlFor="order-to">Até</label><Input id="order-to" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></div>
        {hasFilters && <Button variant="ghost" onClick={clearFilters}><RotateCcw className="mr-2 h-4 w-4" />Limpar</Button>}
      </div>

      <p className="text-sm text-muted-foreground">{filteredOrders.length} de {orders.length} pedido(s)</p>
      {filteredOrders.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Nenhum pedido corresponde aos filtros.</p> : (
        <Table>
          <TableHeader><TableRow><TableHead>Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Itens</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Detalhes</TableHead></TableRow></TableHeader>
          <TableBody>{filteredOrders.map((order) => {
            const availableTransitions = STATUS_TRANSITIONS[order.status];
            const isExpanded = expandedOrderId === order.id;
            return <Fragment key={order.id}>
              <TableRow key={order.id}>
                <TableCell className="font-semibold">#{order.id}</TableCell>
                <TableCell><div className="font-medium">{order.customerName}</div><div className="text-xs text-muted-foreground">{order.customerPhone}</div></TableCell>
                <TableCell><div className="max-w-[260px] text-sm text-muted-foreground">{order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(', ')}</div></TableCell>
                <TableCell className="font-bold">{formatCurrency(order.total)}</TableCell>
                <TableCell><div className="flex flex-wrap items-center gap-2"><Badge className="bg-primary/15 text-primary hover:bg-primary/20">{STATUS_LABEL[order.status]}</Badge>
                  {availableTransitions.length > 0 ? <Select disabled={updatingOrderId === order.id} onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}><SelectTrigger className="h-8 w-[154px]"><SelectValue placeholder="Alterar para..." /></SelectTrigger><SelectContent>{availableTransitions.map((value) => <SelectItem key={value} value={value}>{STATUS_LABEL[value]}</SelectItem>)}</SelectContent></Select> : <span className="text-xs text-muted-foreground">Status final</span>}
                </div></TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}<span className="sr-only">{isExpanded ? 'Ocultar' : 'Ver'} detalhes</span></Button></TableCell>
              </TableRow>
              {isExpanded && <TableRow key={`${order.id}-details`} className="bg-muted/30 hover:bg-muted/30"><TableCell colSpan={7}><div className="grid gap-6 p-2 md:grid-cols-[minmax(0,1fr)_260px]">
                <div><h3 className="mb-2 font-semibold">Itens do pedido</h3><ul className="space-y-1 text-sm">{order.items.map((item) => <li key={item.id} className="flex justify-between gap-4"><span>{item.quantity}x {item.product.name}</span><span>{formatCurrency(Number(item.subtotal))}</span></li>)}</ul></div>
                <div className="space-y-3 text-sm"><div><span className="font-medium">E-mail</span><p className="text-muted-foreground">{order.customerEmail || 'Não informado'}</p></div><div><span className="font-medium">Observações</span><p className="whitespace-pre-wrap text-muted-foreground">{order.notes || 'Nenhuma observação.'}</p></div></div>
              </div></TableCell></TableRow>}
            </Fragment>;
          })}</TableBody>
        </Table>
      )}
    </div>
  );
}
