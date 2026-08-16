import { BadgeCheck, HeartPulse, Leaf, PackageCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    title: "Ingredientes de verdade",
    description:
      "Priorizamos produtos frescos, naturais e selecionados para entregar mais qualidade em cada escolha.",
    icon: Leaf,
    className: "bg-pink-50 text-primary border-pink-100",
  },
  {
    title: "Rotina mais prática",
    description:
      "Montamos uma curadoria pensada para quem quer comer melhor sem perder tempo no dia a dia.",
    icon: PackageCheck,
    className: "bg-teal-50/70 text-secondary border-teal-100",
  },
  {
    title: "Equilíbrio com sabor",
    description:
      "Acreditamos que alimentação saudável precisa ser gostosa, acessível e fácil de manter.",
    icon: HeartPulse,
    className: "bg-pink-50 text-primary border-pink-100",
  },
];

const NUMBERS = [
  { value: "100%", label: "foco em ingredientes naturais" },
  { value: "500+", label: "clientes satisfeitos" },
  { value: "50+", label: "opções no cardápio" },
];

export const metadata = {
  title: "Sobre | A Hora Fit",
  description:
    "Conheça a A Hora Fit, uma loja criada para tornar a alimentação saudável mais prática, saborosa e presente na rotina.",
};

export default function SobrePage() {
  return (
    <main className="overflow-hidden">
      <section className="relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50/40 via-white to-white py-16 lg:py-24">
        <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              Sobre A Hora Fit
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.12] tracking-tight text-[#111827] sm:text-5xl lg:text-[56px]">
              Nutrição simples para uma rotina com mais energia.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
              A Hora Fit nasceu para aproximar pessoas de escolhas saudáveis sem complicar o dia. Reunimos produtos práticos, equilibrados e saborosos para quem quer cuidar do corpo mantendo prazer à mesa.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-xl px-7 font-semibold shadow-sm">
                <Link href="/produtos">Conhecer cardápio</Link>
              </Button>
              <Button asChild variant="secondaryBtn" size="lg" className="rounded-xl px-7 font-semibold shadow-sm">
                <Link href="/contato">Falar conosco</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[36px] border border-gray-100 bg-white p-4 shadow-2xl shadow-gray-200/60">
            <div className="rounded-[28px] bg-gradient-to-br from-pink-50 via-white to-teal-50/80 p-8 sm:p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                <BadgeCheck className="h-8 w-8" />
              </div>
              <h2 className="mt-8 text-2xl font-extrabold tracking-tight text-gray-950">
                Comer bem deve caber no seu dia.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-500 sm:text-base">
                Nossa curadoria valoriza opções que combinam qualidade, conveniência e transparência para facilitar decisões melhores no café da manhã, almoço, lanche ou pós-treino.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {NUMBERS.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                    <strong className="block text-2xl font-black tracking-tight text-primary">
                      {item.value}
                    </strong>
                    <span className="mt-1 block text-xs font-medium leading-snug text-gray-500">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-wide text-primary">
              Nosso jeito de cuidar
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
              Escolhas melhores, sem abrir mão da experiência.
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUES.map((value) => {
              const Icon = value.icon;

              return (
                <article key={value.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${value.className}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-950">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#fafafa] py-14 lg:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <span className="text-sm font-bold uppercase tracking-wide text-secondary">
                  Propósito
                </span>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-950">
                  Ajudar você a manter constância.
                </h2>
              </div>
              <div className="space-y-5 text-base leading-relaxed text-gray-500">
                <p>
                  Alimentação saudável não precisa depender de dietas difíceis ou decisões perfeitas. Nosso papel é deixar boas opções mais próximas, claras e desejáveis.
                </p>
                <p>
                  Por isso, cada produto da loja é apresentado com foco em praticidade, sabor e utilidade real para a rotina de quem busca mais energia, equilíbrio e bem-estar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
