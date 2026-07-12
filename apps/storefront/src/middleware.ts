import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtected = createRouteMatcher([
  '/account(.*)',
  '/orders(.*)',
  '/checkout(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtected(req)) return;

  try {
    const { userId } = await auth();
    if (!userId) {
      const url = new URL('/login', req.url);
      url.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  } catch {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
