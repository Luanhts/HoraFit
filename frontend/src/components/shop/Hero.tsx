"use client";
import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import img from "@/assets/photo-coca.jpg"; // Imagem de exemplo, substitua pelo caminho correto

export default function Hero() {
  return (
    // Fundo com gradiente radial suave e sutil igual ao da imagem
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50/30 via-white to-white py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16">
          {/* Lado Esquerdo: Textos e Botões */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#111827] leading-[1.15]">
              Nutrição que <br />
              <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">transforma</span> seu <br />
              dia
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-500 max-w-lg font-normal leading-relaxed">
              Descubra sabores incríveis e saudáveis. Smoothies, bowls,
              refeições prontas e muito mais para você viver com energia!
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {/* Botão Principal Rosa */}
              <Button
                variant="default"
                size="lg"
                className="cursor-pointer rounded-xl px-7 py-4 font-medium shadow-sm transition-all flex items-center gap-2 text-sm"
              >
                Ver Cardápio <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Botão Secundário Branco */}
              <Button
                variant="secondaryBtn"
                size="lg"
                className="cursor-pointer border border-gray-200 rounded-xl px-7 py-4 font-medium shadow-sm transition-all text-sm"
              >
                Saiba Mais
              </Button>
            </div>
          </div>

          {/* Lado Direito: Container da Imagem com cantos arredondados suavizados */}
          <div className="w-full flex justify-center md:justify-end">
            <div className="relative w-full max-w-[480px] aspect-[1.05/1] rounded-[32px] overflow-hidden shadow-2xl shadow-gray-200/50">
              <Image
                src={img}
                alt="Refrescante Coca-Cola em lata cercada por gelo picado"
                fill
                priority
                className="object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
