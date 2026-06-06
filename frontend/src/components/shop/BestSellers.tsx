"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Tipagem local para os produtos mais vendidos
type BestSellerProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
};

const MOCK_BEST_SELLERS: BestSellerProduct[] = [
  {
    id: "mv-1",
    name: "Smoothie Dragon Fruit Power",
    price: 18.9,
    image: "/assets/mv-smoothie.jpg", // Substitua pelos seus caminhos de imagem
    category: "Bebidas",
    tags: ["Vegan", "Low Carb"],
  },
  {
    id: "mv-2",
    name: "Açaí Bowl Proteico",
    price: 22.5,
    image: "/assets/mv-acai.jpg",
    category: "Sobremesas",
    tags: ["Proteína", "Antioxidante"],
  },
  {
    id: "mv-3",
    name: "Shake de Chocolate Fit",
    price: 16.9,
    image: "/assets/mv-shake.jpg",
    category: "Bebidas",
    tags: ["Proteína", "Zero Açúcar"],
  },
  {
    id: "mv-4",
    name: "Bowl de Frutas Tropicais",
    price: 19.9,
    image: "/assets/mv-frutas.jpg",
    category: "Snacks",
    tags: ["Vegan", "Natural"],
  },
];

export default function BestSellers() {
  return (
    <section className="w-full py-12 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Cabeçalho da Seção */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">
            Mais Vendidos
          </h2>
          <Link
            href="/produtos"
            className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-[#db2777] transition-colors group"
          >
            Ver Todos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MOCK_BEST_SELLERS.map((product) => (
            <div
              key={product.id}
              className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-3 hover:shadow-md transition-shadow"
            >
              {/* Imagem do Produto */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Informações e Conteúdo */}
              <div className="flex flex-col flex-1 px-1 pb-2">
                {/* Tag da Categoria Principal */}
                <div className="mb-2">
                  <Badge className="bg-secondary hover:bg-secondary text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md border-none">
                    {product.category}
                  </Badge>
                </div>

                {/* Título do Produto */}
                <h3 className="text-lg font-bold text-gray-900 leading-snug min-h-[56px] line-clamp-2 mb-2">
                  {product.name}
                </h3>

                {/* Sub-tags (Características) */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {product.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-gray-50 text-gray-500 border-gray-200/60 text-[10px] font-medium px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Rodapé do Card: Preço e Botão */}
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-primary text-xs font-bold leading-none">
                      R$
                    </span>
                    <span className="text-primary text-2xl font-black tracking-tight leading-tight">
                      {product.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    className="cursor-pointer font-semibold rounded-xl px-3.5 h-10 flex items-center gap-1.5 text-xs shadow-sm shadow-purple-100 transition-colors"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
