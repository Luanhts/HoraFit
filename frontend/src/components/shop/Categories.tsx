"use client";

import { Apple, Coffee, Dumbbell, Salad } from "lucide-react";

const CATEGORIAS = [
  {
    id: "refeicoes",
    name: "Refeições Prontas",
    icon: Salad,
    bgColor: "bg-pink-50",
    iconColor: "text-pink-500",
  },
  {
    id: "snacks",
    name: "Snacks Saudáveis",
    icon: Apple,
    bgColor: "bg-teal-50/60",
    iconColor: "text-teal-400",
  },
  {
    id: "bebidas",
    name: "Bebidas Fit",
    icon: Coffee,
    bgColor: "bg-teal-50/60",
    iconColor: "text-teal-400",
  },
  {
    id: "suplementos",
    name: "Suplementos",
    icon: Dumbbell,
    bgColor: "bg-pink-50",
    iconColor: "text-pink-500",
  },
];

export default function Categories() {
  return (
    <section className="w-full py-12 bg-white">
      <div className="container mx-auto px-4 max-w-6xl text-center">
        {/* Título Principal */}
        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-16">
          Categorias de Produtos
        </h2>

        {/* Grid das Categorias */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          {CATEGORIAS.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={cat.id}
                className="flex flex-col items-center gap-4 cursor-pointer group"
              >
                {/* O Segredo da Animação: 
                  - transition-all duration-300: suaviza o movimento
                  - hover:scale-115: aumenta o tamanho em 15% simulando o efeito de ir para frente
                  - hover:shadow-md: dá profundidade ao crescer
                */}
                <div
                  className={`w-20 h-20 ${cat.bgColor} rounded-[24px] flex items-center justify-center 
                  transition-all duration-300 ease-out transform 
                  hover:scale-115 hover:shadow-sm`}
                >
                  <IconComponent
                    className={`w-8 h-8 ${cat.iconColor} stroke-[2]`}
                  />
                </div>

                {/* Texto da Categoria */}
                <span className="text-sm font-semibold text-gray-900 transition-colors duration-300 group-hover:text-gray-600">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
