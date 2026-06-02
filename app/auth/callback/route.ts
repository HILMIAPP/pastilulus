import { NextResponse, type NextRequest } from "next/server";
import { createAppSessionFromUser } from "@/lib/auth-session";
import { getRequestOrigin } from "@/lib/auth-route-helpers";
import { createClient } from "@/lib/supabase/server";

function getInternalNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/siswa";
  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = requestUrl.searchParams.get("code");
  const next = getInternalNext(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/masuk?error=Callback login Google tidak valid.", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(new URL(`/masuk?error=${encodeURIComponent(error.message)}`, origin));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("[auth/callback] getUser error:", userError?.message);
    return NextResponse.redirect(new URL("/masuk?error=Session Google tidak ditemukan.", origin));
  }

  try {
    const session = await createAppSessionFromUser(user);
    const destination = session.role === "student" ? next : "/admin";
    return NextResponse.redirect(new URL(destination, origin));
  } catch (err) {
    console.error("[auth/callback] createAppSessionFromUser error:", err);
    // Tetap redirect ke siswa walau session cookie gagal dibuat
    return NextResponse.redirect(new URL("/siswa", origin));
  }
}
