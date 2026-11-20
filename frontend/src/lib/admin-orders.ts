import type { Order } from '@/types/order';

export async function fetchAdminOrders(
  apiUrl: string,
  apiKey: string,
  request: typeof fetch = fetch,
): Promise<Order[]> {
  const response = await request(`${apiUrl}/orders`, {
    cache: 'no-store',
    headers: { 'x-admin-api-key': apiKey },
  });

  if (!response.ok) {
    throw new Error(`GET /orders retornou ${response.status}.`);
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error('GET /orders retornou uma lista inválida.');
  }

  return body as Order[];
}
