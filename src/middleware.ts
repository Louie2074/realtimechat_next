import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const protectedRoutes = ['/'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
