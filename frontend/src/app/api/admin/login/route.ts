import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, getAdminSessionValue } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get('password');
  const from = formData.get('from');
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredPassword || password !== configuredPassword) {
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('error', 'invalid');

    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const redirectUrl = new URL(typeof from === 'string' && from.startsWith('/admin') ? from : '/admin', request.url);
  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  const sessionValue = await getAdminSessionValue(configuredPassword);

  response.cookies.set(ADMIN_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
