import { API_URL } from "@/lib/api";
import { Category, Produto } from "@/types/produto";
import ProdutosClient from "./ProdutosClient";

// Ambas as funções rodam no servidor (Server Component).
// As requisições são paralelas com Promise.all para reduzir o tempo de carregamento.

async function getProdutos(): Promise<Produto[]> {
  try {
    const res = await fetch(`${API_URL}/products`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Erro ao buscar produtos");
    return res.json();
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      // Categorias mudam raramente — pode usar cache padrão ou revalidar a cada hora
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Erro ao buscar categorias");
    return res.json();
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

export default async function ProdutosPage() {
  // Requisições em paralelo: não esperamos produtos para então buscar categorias
  const [produtos, categories] = await Promise.all([
    getProdutos(),
    getCategories(),
  ]);

  return <ProdutosClient initialProdutos={produtos} categories={categories} />;
}
