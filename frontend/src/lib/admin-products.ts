import type { Category, Produto } from '@/types/produto';

export async function fetchAdminProducts(
  apiUrl: string,
  request: typeof fetch = fetch,
): Promise<{ produtos: Produto[]; categories: Category[] }> {
  const [productsResponse, categoriesResponse] = await Promise.all([
    request(`${apiUrl}/products`, { cache: 'no-store' }),
    request(`${apiUrl}/categories`, { next: { revalidate: 3600 } }),
  ]);

  if (!productsResponse.ok) {
    throw new Error(`GET /products retornou ${productsResponse.status}.`);
  }
  if (!categoriesResponse.ok) {
    throw new Error(`GET /categories retornou ${categoriesResponse.status}.`);
  }

  const [produtos, categories]: [unknown, unknown] = await Promise.all([
    productsResponse.json(),
    categoriesResponse.json(),
  ]);
  if (!Array.isArray(produtos) || !Array.isArray(categories)) {
    throw new Error('A API retornou uma lista de produtos ou categorias inválida.');
  }

  return { produtos: produtos as Produto[], categories: categories as Category[] };
}
