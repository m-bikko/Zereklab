import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected admin paths
  const adminApiPaths = ['/api/products', '/api/categories'];

  // Check if it's a protected admin API path (except GET requests for public access)
  const isProtectedAdminApi = adminApiPaths.some(path =>
    pathname.startsWith(path)
  );

  if (isProtectedAdminApi && request.method !== 'GET') {
    // For now, we'll allow all non-GET requests since we're using client-side auth
    // In a production app, you might want to add additional server-side validation
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match API routes for admin operations
     */
    '/api/((?!auth).*)',
  ],
};
