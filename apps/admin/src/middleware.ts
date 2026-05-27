import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/products(.*)',
  '/orders(.*)',
  '/users(.*)',
  '/categories(.*)',
  '/brands(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
