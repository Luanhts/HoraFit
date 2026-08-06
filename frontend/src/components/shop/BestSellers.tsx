"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/features/cart/cart-utils";
import { Produto } from "@/types/produto";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BestSellers({ products }: { products: Produto[] }) {
  return (
    <section className="w-full py-14 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <span className="text-sm font-bold uppercase tracking-wide text-primary">
              Prévia da loja
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-[#111827] tracking-tight">
              Destaques do Cardápio
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Uma amostra dos produtos disponíveis para você conhecer antes de acessar o cardápio completo.
            </p>
          </div>
          <Link
            href="/produtos"
            className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-[#db2777] transition-colors group"
          >
            Ver cardápio completo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">
            Nenhum produto ativo para destacar no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const price = Number(product.price);

              return (
                <div
                  key={product.id}
                  className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-3 hover:shadow-md transition-shadow"
                >
                  <Link href={`/produtos/${product.id}`} className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem imagem</div>
                    )}
                  </Link>

              {/* Informações e Conteúdo */}
              <div className="flex flex-col flex-1 px-1 pb-2">
                {/* Tag da Categoria Principal */}
                <div className="mb-2">
                  <Badge className="bg-secondary hover:bg-secondary text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md border-none">
                    {product.category.name}
                  </Badge>
                </div>

                {/* Título do Produto */}
                <h3 className="text-lg font-bold text-gray-900 leading-snug min-h-[56px] line-clamp-2 mb-2">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="line-clamp-2 text-sm text-gray-500 mb-5">{product.description}</p>
                )}

                {/* Rodapé do Card: Preço e Botão */}
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-primary text-2xl font-black tracking-tight leading-tight">
                      {formatCurrency(price)}
                    </span>
                  </div>

                  <Button asChild variant="default" size="sm" className="cursor-pointer font-semibold rounded-xl px-3.5 h-10 text-xs shadow-sm shadow-purple-100 transition-colors">
                    <Link href={`/produtos/${product.id}`}>Ver produto</Link>
                  </Button>
                </div>
              </div>
            </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
