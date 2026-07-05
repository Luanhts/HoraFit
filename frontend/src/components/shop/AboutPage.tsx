"use client";

export default function AboutSection() {
  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        {/* Título Principal */}
        <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-8">
          Sobre A Hora Fit
        </h2>

        {/* Textos Institucionais Centralizados */}
        <div className="space-y-6 max-w-3xl mx-auto text-gray-500 font-normal text-base sm:text-lg leading-relaxed">
          <p>
            Somos apaixonados por alimentação saudável e acreditamos que comer
            bem pode ser delicioso e prático. Nossos produtos são preparados com
            ingredientes frescos, naturais e pensados para nutrir seu corpo e
            mente.
          </p>
          <p>
            De smoothies vibrantes a refeições balanceadas, cada item do nosso
            cardápio é criado para te ajudar a manter uma vida ativa e saudável,
            sem abrir mão do sabor.
          </p>
        </div>

        {/* Bloco de Métricas / Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          {/* Card 1: Ingredientes Naturais */}
          <div className="bg-[#fffbfd] border border-pink-50/50 rounded-2xl p-6 shadow-sm shadow-pink-50/10 flex flex-col justify-center items-center">
            <span className="text-4xl sm:text-[40px] font-black tracking-tight text-primary mb-1">
              100%
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Ingredientes Naturais
            </span>
          </div>

          {/* Card 2: Clientes Satisfeitos */}
          <div className="bg-[#faffff] border border-teal-50/50 rounded-2xl p-6 shadow-sm shadow-teal-50/10 flex flex-col justify-center items-center">
            <span className="text-4xl sm:text-[40px] font-black tracking-tight text-secondary mb-1">
              500+
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Clientes Satisfeitos
            </span>
          </div>

          {/* Card 3: Produtos no Cardápio */}
          <div className="bg-[#fffbfd] border border-purple-50/50 rounded-2xl p-6 shadow-sm shadow-purple-100/10 flex flex-col justify-center items-center">
            <span className="text-4xl sm:text-[40px] font-black tracking-tight text-primary mb-1">
              50+
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Produtos no Cardápio
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
