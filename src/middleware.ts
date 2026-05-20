import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 *
 * PUBLIC QR SCAN REDIRECT:
 * If an unauthenticated user opens /cattle/[id] (e.g. from an old QR code
 * or a scan that resolved to the internal route), redirect them to the
 * public page /c/[id] so they can see cattle info without logging in.
 *
 * Authenticated users pass through normally to the full internal detail page.
 *
 * Auth detection: useAuthStore.setAuth() sets a lightweight 'bf-auth-token'
 * cookie alongside localStorage so middleware can read it.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /cattle/[id] (top-level detail page).
  // Sub-routes like /cattle/[id]/edit, /health, /feeding, /location
  // require login anyway — let the layout handle those.
  const cattleDetailMatch = pathname.match(/^\/cattle\/([^\/]+)$/);
  if (!cattleDetailMatch) {
    return NextResponse.next();
  }

  const cattleId = cattleDetailMatch[1];

  // Read the auth cookie set by useAuthStore.setAuth()
  const token = request.cookies.get('bf-auth-token')?.value;
  const isAuthenticated = !!(token && token.length > 10);

  if (!isAuthenticated) {
    // Unauthenticated user hit /cattle/[id] → redirect to public profile
    const publicUrl = request.nextUrl.clone();
    publicUrl.pathname = `/c/${cattleId}`;
    return NextResponse.redirect(publicUrl);
  }

  // Authenticated → let through to (modules)/layout.tsx
  return NextResponse.next();
}

export const config = {
  matcher: ['/cattle/:id'],
};

