import AboutSection from "@/components/shop/AboutPage";
import BestSellers from "@/components/shop/BestSellers";
import Categories from "@/components/shop/Categories";
import Hero from "@/components/shop/Hero";
import { API_URL } from "@/lib/api";
import { Produto } from "@/types/produto";

export const dynamic = "force-dynamic";

async function getFeaturedProducts(): Promise<Produto[]> {
  try {
    const res = await fetch(`${API_URL}/products`, { cache: "no-store" });

    if (!res.ok) return [];

    const products: Produto[] = await res.json();
    return products.filter((product) => product.active).slice(0, 4);
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <main>
      <Hero />
      <Categories />
      <BestSellers products={featuredProducts} />
      <AboutSection />
    </main>
  );
}
