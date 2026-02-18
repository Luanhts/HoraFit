import { Middleware } from "next/dist/lib/load-custom-routes"
import { MiddlewareConfig, NextRequest, NextResponse } from "next/server"

const publicRoutes = [
    { path: "/sign-in", whenAuthenticated: "redirect" },
    { path: "/register", whenAuthenticated: "redirect" },
    { path: "/pricing", whenAuthenticated: "next" },

]

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/sign-in"

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const publicRoute = publicRoutes.find(route => route.path === path)
    const authToken = request.cookies.get("token")

    if (!authToken && publicRoute) {
        return NextResponse.next()
    }

    if (!authToken && !publicRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
        return NextResponse.redirect(redirectUrl);
    }

    if (authToken && publicRoute && publicRoute.whenAuthenticated === "redirect") {
    const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/';
        return NextResponse.redirect(redirectUrl);
    }

    if(authToken && !publicRoute) {
        // Checar se o JWT esta expirado
        // Se sim, remover o cookie e redirecionar para a página de login
        // Aplicar uma estrategia de refresh

        return NextResponse.next()
    }

    return NextResponse.next()
}
export const config: MiddlewareConfig = {
    matcher: [
        /**
         * Redireciona para a página de login caso o usuário não esteja autenticado e tente acessar uma rota protegida.
         * Exclui rotas públicas, rotas de API, arquivos estáticos e outros recursos que não devem ser protegidos.
         * A rota de login (REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE) também é excluída para evitar loops de redirecionamento.
         * A expressão regular abaixo corresponde a todas as rotas, exceto as listadas (api, _next/static, _next/image, favicon.ico, sistemap.xml, robots.txt e as rotas públicas definidas).
         * A ordem das exclusões é importante: as rotas públicas são listadas primeiro, seguidas pelas exclusões de rotas de API e arquivos estáticos.
         * A expressão regular utiliza uma negação (?!...) para excluir as rotas que correspondem aos padrões listados, garantindo que apenas as rotas protegidas sejam interceptadas pelo middleware.
         * A expressão regular é aplicada a todas as rotas, mas apenas as rotas protegidas (que não correspondem aos padrões de exclusão) serão redirecionadas para a página de login se o usuário não estiver autenticado.
         * Exemplo de expressão regular: '/((?!api|_next/static|_next/image|favicon.ico|sistemap.xml|robots.txt|sign-in).*)'
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sistemap.xml|robots.txt).*)',
    ],
}