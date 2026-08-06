"use client";

import * as React from "react";
import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";
import logo from "@/assets/HoraFitLogo.jpg";
import Image from "next/image";
import { useCart } from "@/features/cart/cart-context";

export default function Navbar() {
  const { itemsCount: cartItemsCount } = useCart();

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl h-20 flex items-center justify-between">
        {/* LOGO (Lado Esquerdo) */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Círculo do Logo Simulando a Imagem */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
            <Image
              src={logo}
              alt="Logo A Hora Fit"
              fill
              priority
              className="object-cover"
            />
          </div>
          {/* Texto do Logo Estilizado com cores idênticas */}
          <span className="text-xl font-extrabold tracking-tight">
            <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              A Hora Fit
            </span>
          </span>
        </Link>

        {/* LINKS DE NAVEGAÇÃO (Centro) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
          >
            Início
          </Link>
          <Link
            href="/produtos"
            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
          >
            Produtos
          </Link>
          <Link
            href="/sobre"
            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
          >
            Sobre
          </Link>
          <Link
            href="/contato"
            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
          >
            Contato
          </Link>
        </nav>

        {/* ÍCONES DE AÇÃO (Lado Direito) */}
        <div className="flex items-center gap-6">
          {/* Ícone de Perfil/Usuário */}
          <Link
            href="/perfil"
            className="text-gray-700 hover:text-primary transition-colors p-1"
          >
            <User className="h-5 w-5 stroke-[2]" />
          </Link>

          {/* Ícone do Carrinho com Badge do Contador */}
          <Link
            href="/carrinho"
            className="relative text-gray-700 hover:text-primary transition-colors p-1"
          >
            <ShoppingCart className="h-5 w-5 stroke-[2]" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-fade-in shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
