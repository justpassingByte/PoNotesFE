import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy Convention
 */
const PROTECTED_ROUTES = ['/dashboard', '/players', '/history', '/analyzer', '/settings'];
const PUBLIC_ONLY_ROUTES = ['/login'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // 1. Redirect to login if accessing protected route without token
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Redirect to dashboard if logged in and accessing public route
    const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.some(route => pathname.startsWith(route));
    if (isPublicOnlyRoute && token) {
        return NextResponse.redirect(new URL('/players', request.url));
    }

    return NextResponse.next();
}

/**
 * Configure which paths the proxy runs on
 */
export const config = {
    matcher: ['/dashboard/:path*', '/players/:path*', '/login', '/history/:path*', '/analyzer/:path*', '/settings/:path*'],
};
