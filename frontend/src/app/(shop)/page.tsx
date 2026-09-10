import AboutSection from "@/components/shop/AboutPage";
import BestSellers from "@/components/shop/BestSellers";
import Categories from "@/components/shop/Categories";
import Hero from "@/components/shop/Hero";
import { getApiUrl } from "@/lib/api";
import { Produto } from "@/types/produto";

export const dynamic = "force-dynamic";

type FeaturedProductsResult =
  | { products: Produto[]; error: null }
  | { products: []; error: string };

async function getFeaturedProducts(): Promise<FeaturedProductsResult> {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/products`, { cache: "no-store" });

    if (!res.ok) {
      console.error(`Falha ao buscar destaques: GET /products retornou ${res.status}.`);
      return { products: [], error: "Não foi possível carregar os produtos agora." };
    }

    const products: Produto[] = await res.json();
    return { products: products.filter((product) => product.active).slice(0, 4), error: null };
  } catch (error) {
    console.error("Falha ao conectar com a API para buscar destaques:", error);
    return { products: [], error: "Não foi possível conectar ao servidor de produtos." };
  }
}

export default async function ShopPage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <main>
      <Hero />
      <Categories />
      <BestSellers products={featuredProducts.products} error={featuredProducts.error} />
      <AboutSection />
    </main>
  );
}
