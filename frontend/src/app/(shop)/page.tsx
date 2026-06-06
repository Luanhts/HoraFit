import AboutSection from "@/components/shop/AboutPage";
import BestSellers from "@/components/shop/BestSellers";
import Categories from "@/components/shop/Categories";
import Hero from "@/components/shop/Hero";
import ProductCard from "@/components/shop/product-card";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Smoothie de Morango",
    price: 12.5,
    image: "/assets/prod1.jpg",
    description: "Delicioso smoothie fresco",
  },
  {
    id: "2",
    name: "Bowl Energético",
    price: 24.9,
    image: "/assets/prod2.jpg",
    description: "Toppings saudáveis",
  },
  {
    id: "3",
    name: "Refeição Pronta Fit",
    price: 29.9,
    image: "/assets/prod3.jpg",
    description: "Pronta para levar",
  },
  {
    id: "4",
    name: "Suco Verde",
    price: 9.5,
    image: "/assets/prod4.jpg",
    description: "Refrescante e nutritivo",
  },
  {
    id: "5",
    name: "Barra de Proteína",
    price: 7.0,
    image: "/assets/prod5.jpg",
    description: "Rápido e prático",
  },
  {
    id: "6",
    name: "Iogurte com Granola",
    price: 15.0,
    image: "/assets/prod6.jpg",
    description: "Combinação perfeita",
  },
];

export default function ShopPage() {
  return (
    <main>
      <Hero />
      <Categories />
      <BestSellers />
      <AboutSection />
    </main>
  );
}
