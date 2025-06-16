// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { TOKEN_COOKIE_NAME, ENV } from '@/lib/schemas'; // Use ENV for JWT_SECRET_KEY
import type { UserRole } from '@/lib/types';

// Ensure JWT_SECRET_KEY is a Uint8Array for middleware
const getEdgeJwtSecretKey = () => {
  const secret = ENV.JWT_SECRET_KEY;
  if (!secret || secret.length < 32) {
    console.error("EDGE: JWT_SECRET_KEY is not defined or too short. It must be at least 32 characters.");
    // Fallback to a default for critical failure, though ENV schema should catch this on server init
    return new TextEncoder().encode("fallback-edge-secret-key-must-be-32-chars"); 
  }
  return new TextEncoder().encode(secret);
};


const AUTHENTICATED_PATHS = [
  '/dashboard',
  '/projects',
  '/tasks',
  '/calendar',
  '/shared-resources',
  '/communication',
  '/profile',
  '/settings',
  '/admin',
];

const ADMIN_PATHS = ['/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const tokenCookie = req.cookies.get(TOKEN_COOKIE_NAME);

  // Check if the path requires authentication
  const requiresAuth = AUTHENTICATED_PATHS.some(p => pathname.startsWith(p));
  
  if (requiresAuth) {
    if (!tokenCookie?.value) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(tokenCookie.value, getEdgeJwtSecretKey());
      const userRole = payload.role as UserRole;

      // Check for admin path authorization
      const requiresAdmin = ADMIN_PATHS.some(p => pathname.startsWith(p));
      if (requiresAdmin && userRole !== 'Owner' && userRole !== 'Project Manager') { // As per AdminPage logic
        const forbiddenUrl = new URL('/dashboard', req.url); // Redirect to dashboard or a specific forbidden page
        forbiddenUrl.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(forbiddenUrl);
      }
      // Valid token, allow request to proceed
      return NextResponse.next();
    } catch (err) {
      console.log('Middleware JWT verification error:', (err as Error).message);
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'session_expired');
       // Clear the invalid cookie by overwriting it with an expired one
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(TOKEN_COOKIE_NAME, '', { maxAge: -1, path: '/' });
      return response;
    }
  }

  // If on login page and already authenticated, redirect to dashboard
  if (pathname === '/login' && tokenCookie?.value) {
    try {
      await jwtVerify(tokenCookie.value, getEdgeJwtSecretKey());
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } catch (err) {
      // Invalid token, let them stay on login page or clear cookie
      const response = NextResponse.next(); // Stay on login
      response.cookies.set(TOKEN_COOKIE_NAME, '', { maxAge: -1, path: '/' }); // Clear bad cookie
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all paths except static assets and _next internals
    '/((?!api/pod/|_next/static|_next/image|favicon.ico|images/).*)',
    // Explicitly include /login to handle redirect if authenticated
    '/login', 
  ],
};
