import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Exemplo simples: permite continuar a requisição
  // Você pode adicionar lógica de autenticação/redirects aqui.
  return NextResponse.next();
}

// Opcional: limite as rotas onde o middleware é aplicado
export const config = {
  matcher: [
    /*
      Exemplo: aplica o middleware a tudo exceto assets, imagens internas e favicon.
      Ajuste conforme necessário (por exemplo: '/admin/:path*' para aplicar só em /admin).
    */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};