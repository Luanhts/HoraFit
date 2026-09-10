import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api';
import { ADMIN_COOKIE, getAdminSessionValue } from '@/lib/admin-auth';

export async function isAdminRequestAuthenticated(request: NextRequest) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const sessionValue = configuredPassword ? await getAdminSessionValue(configuredPassword) : null;

  return Boolean(sessionValue && request.cookies.get(ADMIN_COOKIE)?.value === sessionValue);
}

export function getAdminApiKey() {
  const apiKey = process.env.ADMIN_API_KEY;

  if (!apiKey) {
    throw new Error('ADMIN_API_KEY não está configurada.');
  }

  return apiKey;
}

export async function forwardAdminRequest(request: NextRequest, path: string, method: string) {
  if (!(await isAdminRequestAuthenticated(request))) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  let apiKey: string;
  let apiUrl: string;

  try {
    apiKey = getAdminApiKey();
    apiUrl = getApiUrl();
  } catch (error) {
    console.error('Falha na configuração da API admin:', error);
    return NextResponse.json({ message: 'API administrativa não configurada.' }, { status: 500 });
  }

  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();
  const headers: HeadersInit = {
    'x-admin-api-key': apiKey,
  };

  if (body) {
    headers['Content-Type'] = request.headers.get('content-type') ?? 'application/json';
  }

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method,
      headers,
      body,
      cache: 'no-store',
    });
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (error) {
    console.error(`Falha ao encaminhar requisição admin ${method} ${path}:`, error);
    return NextResponse.json({ message: 'Não foi possível conectar à API administrativa.' }, { status: 502 });
  }
}
