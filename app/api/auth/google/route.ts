import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRequestOrigin, redirectPath } from "@/lib/auth-route-helpers";

export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    return redirectPath(request, `/masuk?error=${encodeURIComponent(error?.message ?? "Login Google belum bisa diproses.")}`);
  }

  return redirectPath(request, data.url, 302);
}
