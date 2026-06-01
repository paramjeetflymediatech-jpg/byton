import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Protect all admin and admin API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // No token → redirect to login (for page) or return 401 (for API)
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const signInUrl = request.nextUrl.clone();
      signInUrl.pathname = '/login';
      return NextResponse.redirect(signInUrl);
    }
    // Ensure user has admin role
    if (token.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
