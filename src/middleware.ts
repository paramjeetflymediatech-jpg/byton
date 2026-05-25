import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Protect all admin routes
  if (pathname.startsWith('/admin')) {
    // No token → redirect to sign‑in page
    if (!token) {
      const signInUrl = request.nextUrl.clone();
      signInUrl.pathname = '/login';
      return NextResponse.redirect(signInUrl);
    }
    // Ensure user has admin role
    if (token.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
