import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Tangkap ?code= yang landing di root (/) akibat Supabase OAuth fallback ke Site URL.
  // Forward ke /auth/callback agar sesi Google diproses dengan benar.
  if (pathname === "/" && searchParams.has("code")) {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.search = searchParams.toString();
    return NextResponse.redirect(callbackUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
