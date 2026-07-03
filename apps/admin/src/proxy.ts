import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublic = createRouteMatcher(['/login(.*)', '/unauthorized']);

export default clerkMiddleware(async (auth, req) => {
  // Always allow login and unauthorized pages through
  if (isPublic(req)) return;

  const { userId } = await auth();

  // Not logged in → login page
  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Fast path: check ADMIN_USER_IDS env var (no API call)
  const adminIds = (process.env.ADMIN_USER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (adminIds.includes(userId)) return; // confirmed admin, allow through

  // Fallback: check Clerk publicMetadata role
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.role === 'admin') return; // confirmed admin
  } catch {
    // Clerk API error — deny access to be safe
  }

  // Logged in but not admin → redirect to storefront
  return NextResponse.redirect('https://staticwears.com');
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
