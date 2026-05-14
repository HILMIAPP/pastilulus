import { NextResponse, type NextRequest } from "next/server";
import { createAppSessionFromUser } from "@/lib/auth-session";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/siswa";

  if (!code) {
    return NextResponse.redirect(new URL("/masuk?error=Callback login Google tidak valid.", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/masuk?error=${encodeURIComponent(error.message)}`, request.url));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/masuk?error=Session Google tidak ditemukan.", request.url));
  }

  const session = await createAppSessionFromUser(user);
  const destination = session.role === "student" ? next : "/admin";

  return NextResponse.redirect(new URL(destination, request.url));
}
