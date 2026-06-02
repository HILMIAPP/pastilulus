import { type NextRequest } from "next/server";
import { createAppSessionFromUser } from "@/lib/auth-session";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeEmail,
  normalizeName,
  redirectPath,
  validateCredentials,
} from "@/lib/auth-route-helpers";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const name = normalizeName(formData.get("name"), email);
  const error = validateCredentials(email, password);

  if (error) {
    return redirectPath(request, `/daftar?error=${encodeURIComponent(error)}`);
  }

  const supabase = await createClient();
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (signUpError) {
    return redirectPath(request, `/daftar?error=${encodeURIComponent(signUpError.message)}`);
  }

  if (!data.session || !data.user) {
    return redirectPath(
      request,
      `/masuk?message=${encodeURIComponent("Akun berhasil dibuat. Cek email kamu untuk verifikasi, lalu masuk kembali.")}`,
    );
  }

  await createAppSessionFromUser(data.user);
  return redirectPath(request, "/siswa/onboarding");
}
