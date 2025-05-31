import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('authToken')?.value

  // Debug logs removed for cleaner production code
  // console.log(`[Middleware] Path: ${pathname}, Method: ${request.method}, Token: ${authToken ? 'Present' : 'Absent'}`)

  const isProductDetailsPage = /^\/products\/[^\/]+$/.test(pathname)

  const publicPaths = [
    '/', 
    '/login',
    '/products',
    '/api/auth/login',
    '/about', // Adding About page to public paths
    '/contact' // Adding Contact page to public paths
  ]

  if (
    publicPaths.includes(pathname) ||
    isProductDetailsPage ||
    (pathname.startsWith('/api/products') && request.method === 'GET') ||
    (pathname.startsWith('/api/categories') && request.method === 'GET') // Allow GET for categories
  ) {
    // console.log(`[Middleware] Allowing public path: ${pathname}`)
    return NextResponse.next()
  }

  // console.log(`[Middleware] Path ${pathname} is PROTECTED.`)

  if (!JWT_SECRET) {
    console.error('JWT_SECRET не определен. Защищенные маршруты будут недоступны в производственной среде.')
    // In production, strict denial. In dev, can be more lenient for setup but with a warning.
    if (process.env.NODE_ENV === 'production') {
      // It's better to redirect to a generic error page or login with a clear message
      // rather than exposing server_config error directly in URL if possible.
      return NextResponse.redirect(new URL('/login?error=server_config_issue', request.url))
    }
    // For development, if JWT_SECRET is missing, we might allow access or show a more prominent warning.
    // However, for security hardening, it's better to enforce JWT_SECRET even in dev.
    // Consider if you want to block access or allow with warning during development.
    // For now, let's be strict in dev too, prompting proper setup.
    console.warn('Режим разработки: JWT_SECRET отсутствует. Настройте .env.local. Доступ будет заблокирован.')
    return NextResponse.redirect(new URL('/login?error=jwt_secret_missing', request.url))
  }

  if (!authToken) {
    // console.log('[Middleware] No auth token. Redirecting to /login.')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    jwt.verify(authToken, JWT_SECRET)
    // console.log('[Middleware] Token verified. Allowing access.')
    return NextResponse.next()
  } catch (error: any) {
    // console.warn('[Middleware] JWT verification failed:', error.name, error.message)
    const response = NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
    // console.log('[Middleware] Deleting invalid authToken cookie.')
    // Aggressively clear the cookie
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), 
      path: '/', 
      sameSite: 'lax'
      // domain: 'localhost' // Usually not needed for same-origin cookies, can cause issues if misconfigured
    })
    // Fallback delete, though setting to expired should be sufficient
    response.cookies.delete('authToken', { path: '/' /*, domain: 'localhost' */ }); 
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except for static assets and image optimization.
     * This ensures the middleware runs for all page navigations and API calls.
     * Specific public paths are then handled within the middleware logic.
     * Added common static file extensions to the exclusion list.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|logo/.*|images/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*) ',
  ],
} 