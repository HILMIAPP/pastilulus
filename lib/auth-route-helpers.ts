import { NextResponse, type NextRequest } from "next/server";
import { createAppSessionFromUser } from "@/lib/auth-session";
import { getRoleForEmail, getTierForRole, setSession, type AppSession } from "@/lib/session";
import { site, whiteLabel } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";

export function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

export function normalizeName(value: FormDataEntryValue | null, email: string) {
  const name = String(value ?? "").trim();
  return name || email.split("@")[0] || `Siswa ${site.name}`;
}

export function validateCredentials(email: string, password: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email tidak valid.";
  }

  if (password.length < 8) {
    return "Kata sandi minimal 8 karakter.";
  }

  return null;
}

export function redirectPath(request: NextRequest, path: string, status = 303) {
  if (/^https?:\/\//i.test(path)) {
    return NextResponse.redirect(path, status);
  }

  return NextResponse.redirect(new URL(path, getRequestOrigin(request)), status);
}

export function getRequestOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");

  if (
    process.env.NODE_ENV === "production" &&
    (!host || host.startsWith("0.0.0.0") || host.startsWith("127.0.0.1") || host.startsWith("localhost"))
  ) {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? site.url).origin;
  }

  if (!host) return new URL(process.env.NEXT_PUBLIC_APP_URL ?? site.url).origin;
  return new URL(`${proto}://${host}`).origin;
}

export function isDevelopmentAdminLogin(email: string, password: string) {
  const devPassword = process.env.DEV_ADMIN_PASSWORD;
  const allowedAdminEmails = [
    whiteLabel.auth.adminEmail.toLowerCase(),
    whiteLabel.auth.superAdminEmail.toLowerCase(),
  ];

  return process.env.NODE_ENV !== "production" && Boolean(devPassword) && password === devPassword && allowedAdminEmails.includes(email);
}

export async function createDevelopmentAdminSession(email: string) {
  const role = getRoleForEmail(email);
  const session: AppSession = {
    userId: `dev-${role}`,
    name: role === "super_admin" ? "Super Admin" : "Admin",
    email,
    role,
    tier: getTierForRole(role),
    createdAt: Date.now(),
  };

  await setSession(session);
  return session;
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { session: null, error: error?.message ?? "Email atau kata sandi salah." };
  }

  const session = await createAppSessionFromUser(data.user);
  return { session, error: null };
}
