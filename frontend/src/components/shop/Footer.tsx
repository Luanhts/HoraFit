"use client";

import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#fafafa] border-t border-gray-100 mt-16 pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Grid Principal do Rodapé */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 mb-12">
          {/* Coluna 1: Logo e Descrição */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              A Hora Fit
            </h3>
            <p className="text-sm text-gray-500 font-normal leading-relaxed max-w-[240px]">
              Nutrição saudável e saborosa para seu dia a dia. Produtos frescos,
              naturais e pensados para o seu bem-estar.
            </p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div className="flex flex-col gap-4">
            <h4 className="text-base font-bold text-[#111827]">
              Links Rápidos
            </h4>
            <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
              <Link
                href="/produtos"
                className="hover:text-primary transition-colors"
              >
                Produtos
              </Link>
              <Link
                href="/sobre"
                className="hover:text-primary transition-colors"
              >
                Sobre Nós
              </Link>
              <Link
                href="/contato"
                className="hover:text-primary transition-colors"
              >
                Contato
              </Link>
            </nav>
          </div>

          {/* Coluna 3: Contato */}
          <div className="flex flex-col gap-4">
            <h4 className="text-base font-bold text-[#111827]">Contato</h4>
            <ul className="flex flex-col gap-3 text-sm font-medium text-gray-500">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-secondary stroke-[2]" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-secondary stroke-[2]" />
                <a
                  href="mailto:contato@ahorafit.com"
                  className="hover:underline"
                >
                  contato@ahorafit.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-secondary stroke-[2]" />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Redes Sociais */}
          <div className="flex flex-col gap-4">
            <h4 className="text-base font-bold text-[#111827]">
              Redes Sociais
            </h4>
            <div className="flex items-center gap-3">
              {/* Instagram Card */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center border border-pink-100 text-primary transition-transform hover:scale-110"
              >
                <Instagram className="h-4 w-4 stroke-[2]" />
              </a>

              {/* Facebook Card */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary-50/60 rounded-full flex items-center justify-center border border-teal-100 text-secondary transition-transform hover:scale-110"
              >
                <Facebook className="h-4 w-4 fill-current stroke-none" />
              </a>
            </div>
          </div>
        </div>

        {/* Linha Divisória Inferior */}
        <div className="border-t border-gray-200/60 pt-8 text-center">
          <p className="text-xs sm:text-sm font-medium text-gray-400">
            © {currentYear} A Hora Fit. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
