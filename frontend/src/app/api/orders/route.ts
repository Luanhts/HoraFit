import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api';

export async function POST(request: NextRequest) {
  let apiUrl: string;

  try {
    apiUrl = getApiUrl();
  } catch (error) {
    console.error('Falha na configuração da API de pedidos:', error);
    return NextResponse.json({ message: 'A loja está temporariamente indisponível.' }, { status: 503 });
  }

  try {
    const response = await fetch(`${apiUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': request.headers.get('content-type') ?? 'application/json' },
      body: await request.text(),
      cache: 'no-store',
    });

    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' },
    });
  } catch (error) {
    console.error('Falha ao encaminhar criação de pedido:', error);
    return NextResponse.json({ message: 'Não foi possível conectar ao servidor de pedidos.' }, { status: 502 });
  }
}
