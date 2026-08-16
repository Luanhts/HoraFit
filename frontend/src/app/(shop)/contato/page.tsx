import { Clock, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ContactForm from "./contact-form";

const CONTACT_CHANNELS = [
  {
    title: "Telefone",
    description: "Fale com nossa equipe pelo WhatsApp ou ligação.",
    value: "(11) 99999-9999",
    href: "tel:+5511999999999",
    icon: Phone,
    className: "bg-pink-50 text-primary border-pink-100",
  },
  {
    title: "E-mail",
    description: "Envie dúvidas, sugestões ou solicitações comerciais.",
    value: "contato@ahorafit.com",
    href: "mailto:contato@ahorafit.com",
    icon: Mail,
    className: "bg-teal-50/70 text-secondary border-teal-100",
  },
  {
    title: "Localização",
    description: "Atendimento e entregas na região de São Paulo.",
    value: "São Paulo, SP",
    href: "https://maps.google.com/?q=S%C3%A3o%20Paulo%2C%20SP",
    icon: MapPin,
    className: "bg-pink-50 text-primary border-pink-100",
  },
];

export const metadata = {
  title: "Contato | A Hora Fit",
  description:
    "Entre em contato com a A Hora Fit para tirar dúvidas sobre produtos, pedidos e atendimento.",
};

export default function ContatoPage() {
  return (
    <main className="overflow-hidden">
      <section className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-50/50 via-white to-white py-16 lg:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-secondary shadow-sm">
              <MessageCircle className="h-4 w-4" />
              Contato
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-[#111827] sm:text-5xl lg:text-[56px]">
              Estamos aqui para deixar sua rotina mais leve.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
              Tire dúvidas sobre produtos, pedidos, disponibilidade ou atendimento. Nossa equipe responde com clareza para ajudar você a escolher melhor.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {CONTACT_CHANNELS.map((channel) => {
              const Icon = channel.icon;

              return (
                <a
                  key={channel.title}
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${channel.className}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h2 className="mt-5 text-lg font-bold text-gray-950">{channel.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{channel.description}</p>
                  <span className="mt-4 block text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">
                    {channel.value}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 lg:grid-cols-[1fr_360px]">
          <ContactForm />

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-[#fafafa] p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-secondary shadow-sm">
                <Clock className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-extrabold text-gray-950">Horário de atendimento</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-500">
                <div className="flex justify-between gap-4 border-b border-gray-200/70 pb-3">
                  <span>Segunda a sexta</span>
                  <strong className="font-semibold text-gray-900">08h às 18h</strong>
                </div>
                <div className="flex justify-between gap-4 border-b border-gray-200/70 pb-3">
                  <span>Sábado</span>
                  <strong className="font-semibold text-gray-900">09h às 13h</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Domingo</span>
                  <strong className="font-semibold text-gray-900">Fechado</strong>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-teal-50/80 p-6 shadow-sm">
              <Instagram className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-xl font-extrabold text-gray-950">Acompanhe novidades</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Veja lançamentos, dicas e atualizações do cardápio pelos nossos canais sociais.
              </p>
              <Button asChild variant="secondaryBtn" className="mt-5 rounded-xl bg-white font-semibold">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Ver Instagram
                </a>
              </Button>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-gray-950">Quer fazer um pedido?</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Acesse o cardápio e escolha seus produtos saudáveis em poucos passos.
              </p>
              <Button asChild className="mt-5 rounded-xl font-semibold">
                <Link href="/produtos">Ver cardápio</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
