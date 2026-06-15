import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtected = createRouteMatcher([
  '/account(.*)',
  '/orders(.*)',
  '/checkout(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    const { userId } = await auth();
    if (!userId) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(loginUrl);
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
