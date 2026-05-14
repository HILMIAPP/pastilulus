import { NextResponse, type NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE_NAME } from "@/lib/session-codec";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

const STUDENT_PREFIX = "/siswa";
const ADMIN_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabaseResponse = await refreshSupabaseSession(request);
  const session = decodeSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname.startsWith(STUDENT_PREFIX) && !session) {
    return NextResponse.redirect(new URL("/masuk", request.url));
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!session) {
      return NextResponse.redirect(new URL("/masuk", request.url));
    }

    if (session.role !== "admin" && session.role !== "super_admin") {
      return NextResponse.redirect(new URL("/siswa", request.url));
    }
  }

  if ((pathname === "/masuk" || pathname === "/daftar") && session) {
    return NextResponse.redirect(new URL(session.role === "student" ? "/siswa" : "/admin", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/siswa/:path*", "/admin/:path*", "/masuk", "/daftar"],
};
