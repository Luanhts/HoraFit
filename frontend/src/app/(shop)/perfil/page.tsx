import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Meu perfil | A Hora Fit",
  description: "Encontre canais de atendimento e continue explorando a A Hora Fit.",
};

export default function PerfilPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
      <section className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-teal-50/70 p-7 sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm">
          <UserRound className="h-4 w-4" aria-hidden="true" />
          Meu perfil
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
          Seu espaço na A Hora Fit
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
          O histórico de compras e os dados de uma conta ainda não estão disponíveis nesta área.
          Se precisar de informações sobre um pedido, nossa equipe pode ajudar.
        </p>
      </section>

      <section aria-label="Opções disponíveis" className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-primary">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-gray-950">Ajuda com um pedido</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Fale com a loja para tirar dúvidas sobre pedidos e atendimento.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link href="/contato">Entrar em contato</Link>
          </Button>
        </article>

        <article className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-secondary">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-gray-950">Explore a loja</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Confira os produtos disponíveis no catálogo.
          </p>
          <Button asChild variant="secondaryBtn" className="mt-6 rounded-xl">
            <Link href="/produtos">Ver produtos</Link>
          </Button>
        </article>
      </section>
    </main>
  );
}
