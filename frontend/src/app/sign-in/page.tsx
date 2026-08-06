import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/HoraFitLogo.jpg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; from?: string }> }) {
  const { error, from } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src={logo} alt="A Hora Fit" width={72} height={72} className="rounded-full object-cover" />
          <h1 className="mt-5 text-3xl font-black text-gray-950">Acesso admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre para gerenciar produtos e pedidos da loja.</p>
        </div>

        {error === 'invalid' && (
          <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            Senha inválida ou `ADMIN_PASSWORD` não configurada.
          </div>
        )}

        <form action="/api/admin/login" method="post" className="space-y-5">
          <input type="hidden" name="from" value={from?.startsWith('/admin') ? from : '/admin'} />

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>

          <Button type="submit" className="w-full rounded-xl py-6 text-base">
            Entrar
          </Button>
        </form>

        <Button asChild variant="ghost" className="mt-4 w-full">
          <Link href="/">Voltar para a loja</Link>
        </Button>
      </section>
    </main>
  );
}
