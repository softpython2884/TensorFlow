import { NextResponse, type NextRequest } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth-edge'; 
import { TOKEN_COOKIE_NAME } from '@/lib/schemas';
import type { User } from '@/lib/types';

const AUTHENTICATED_PATHS = [
  '/dashboard',
  '/projects',
  '/tasks',
  '/calendar',
  '/shared-resources',
  '/communication',
  '/profile',
  '/settings', // Keep /settings for general user settings
  '/admin',   // Admin section is also an authenticated path
];

const ADMIN_ONLY_PATHS = ['/admin']; // Specific admin section paths

const PUBLIC_PATHS = [
  '/login',
  '/register', // Allow access to register page
  '/setup-initial-admin', // Allow access to the secret admin setup page
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const tokenCookie = req.cookies.get(TOKEN_COOKIE_NAME);

  const isApiRoute = pathname.startsWith('/api/');
  const isNextInternal = pathname.startsWith('/_next/');
  const isStaticAsset = /\.(png|jpg|jpeg|gif|svg|ico|css|js)$/i.test(pathname);

  if (isApiRoute || isNextInternal || isStaticAsset) {
    return NextResponse.next();
  }
  
  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  if (tokenCookie?.value) {
    const user = await verifyTokenEdge<User>(tokenCookie.value);
    if (user) {
      // User is authenticated
      if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/setup-initial-admin') || pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      const isAdminPath = ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p));
      if (isAdminPath && user.role !== 'Owner' && user.role !== 'ADMIN') {
        const forbiddenUrl = new URL('/dashboard', req.url);
        forbiddenUrl.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(forbiddenUrl);
      }
      return NextResponse.next();
    } else {
      // Invalid or expired token
      const response = isPublicPath ? NextResponse.next() : NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete(TOKEN_COOKIE_NAME); // Clear invalid token
      return response;
    }
  } else {
    // No token, user is not authenticated
    if (!isPublicPath && AUTHENTICATED_PATHS.some(p => pathname.startsWith(p))) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all paths except specific Next.js internals and static assets
    '/((?!_next/static|_next/image|images/|favicon.ico).*)',
  ],
};