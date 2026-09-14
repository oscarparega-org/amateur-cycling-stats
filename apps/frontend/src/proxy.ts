import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isLocale, localeCookieName } from '@/lib/i18n';
import { detectLocale } from '@/lib/locale-detection';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split('/')[1];

  if (firstSegment && isLocale(firstSegment)) return NextResponse.next();

  const locale = detectLocale(request.cookies.get(localeCookieName)?.value, request.headers.get('accept-language'));
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)']
};
