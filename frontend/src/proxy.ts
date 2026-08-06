import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, getAdminSessionValue } from '@/lib/admin-auth';

const LOGIN_ROUTE = '/sign-in';

export async function proxy(request: NextRequest) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const sessionValue = configuredPassword ? await getAdminSessionValue(configuredPassword) : null;
  const isAuthenticated = Boolean(sessionValue && request.cookies.get(ADMIN_COOKIE)?.value === sessionValue);

  if (isAuthenticated) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = LOGIN_ROUTE;
  redirectUrl.searchParams.set('from', request.nextUrl.pathname);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
