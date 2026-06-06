"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
      <Link href={`/produtos/${product.id}`} className="block relative w-full h-56 bg-gray-100">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
        )}
      </Link>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <span className="text-sm font-medium text-gray-700">{formatPrice(product.price)}</span>
        </div>
        {product.description && <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>}
        <div className="mt-3 flex items-center gap-2">
          <Button asChild size="sm">
            <Link href={`/produtos/${product.id}`}>Ver</Link>
          </Button>
          <Button variant="outline" size="sm">Adicionar</Button>
        </div>
      </div>
    </div>
  );
}
