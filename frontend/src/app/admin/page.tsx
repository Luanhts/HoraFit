
import Link from 'next/link';
import { getAdminApiKey } from '@/lib/admin-api';
import { summarizeAdminOperations } from '@/lib/admin-summary';
import { getApiUrl } from '@/lib/api';
import type { Order } from '@/types/order';
import type { Produto } from '@/types/produto';

export const dynamic = 'force-dynamic';

async function loadSummary() {
  const apiUrl = getApiUrl();
  const [ordersResponse, productsResponse] = await Promise.all([
    fetch(`${apiUrl}/orders`, {
      cache: 'no-store',
      headers: { 'x-admin-api-key': getAdminApiKey() },
    }),
    fetch(`${apiUrl}/products`, { cache: 'no-store' }),
  ]);

  if (!ordersResponse.ok || !productsResponse.ok) {
    throw new Error('Falha ao carregar dados do painel.');
  }

  const [orders, products] = await Promise.all([
    ordersResponse.json() as Promise<Order[]>,
    productsResponse.json() as Promise<Produto[]>,
  ]);

  if (!Array.isArray(orders) || !Array.isArray(products)) {
    throw new Error('Resposta inválida ao carregar o painel.');
  }

  return summarizeAdminOperations(orders, products);
}

export default async function AdminIndexPage() {
  let summary: Awaited<ReturnType<typeof loadSummary>>;

  try {
    summary = await loadSummary();
  } catch (error) {
    console.error('Falha ao carregar resumo administrativo:', error);
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Painel da loja</h1>
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar o resumo agora. Recarregue a página para tentar novamente.
        </p>
      </div>
    );
  }

  const cards = [
    { label: 'Pedidos pendentes', value: summary.pendingOrders, href: '/admin/pedidos' },
    { label: 'Pedidos em andamento', value: summary.activeOrders, href: '/admin/pedidos' },
    { label: 'Produtos ativos', value: summary.activeProducts, href: '/admin/produtos' },
    { label: 'Produtos esgotados', value: summary.outOfStockProducts, href: '/admin/produtos' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel da loja</h1>
        <p className="text-muted-foreground">Resumo operacional dos pedidos registrados e do catálogo.</p>
      </div>

      <section aria-label="Resumo operacional" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-3 text-3xl font-bold tabular-nums">{card.value}</p>
            <span className="mt-4 inline-block text-sm font-medium text-primary">Ver {card.href.endsWith('pedidos') ? 'pedidos' : 'produtos'}</span>
          </Link>
        ))}
      </section>

      <p className="text-sm text-muted-foreground">Pedidos registrados ainda não representam pagamentos confirmados ou vendas concluídas.</p>
    </div>
  );
}
