import { type NextRequest } from "next/server";
import {
  createDevelopmentAdminSession,
  isDevelopmentAdminLogin,
  normalizeEmail,
  redirectPath,
  signInWithPassword,
  validateCredentials,
} from "@/lib/auth-route-helpers";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const error = validateCredentials(email, password);

  if (error) {
    return redirectPath(request, `/masuk?error=${encodeURIComponent(error)}`);
  }

  if (isDevelopmentAdminLogin(email, password)) {
    await createDevelopmentAdminSession(email);
    return redirectPath(request, "/admin");
  }

  const result = await signInWithPassword(email, password);

  if (!result.session) {
    return redirectPath(request, `/masuk?error=${encodeURIComponent(result.error ?? "Email atau kata sandi salah.")}`);
  }

  return redirectPath(request, result.session.role === "student" ? "/siswa" : "/admin");
}
