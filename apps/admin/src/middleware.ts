import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Login page and its sub-routes are public (SSO callback, etc.)
const isPublicRoute = createRouteMatcher(['/login(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth();

  // Not signed in → go to login
  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Check admin: either listed in ADMIN_USER_IDS env var or Clerk publicMetadata.role === 'admin'
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
  const adminIds = (process.env.ADMIN_USER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (role !== 'admin' && !adminIds.includes(userId)) {
    return NextResponse.redirect(new URL('https://staticwears.com', req.url));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
