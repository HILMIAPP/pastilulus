import { cookies } from "next/headers";
import {
  encodeSession,
  decodeSession,
  SESSION_COOKIE_NAME,
  type AppSession,
  type UserRole,
  type UserTier,
} from "@/lib/session-codec";
import { whiteLabel } from "@/lib/site-config";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export { SESSION_COOKIE_NAME, decodeSession, encodeSession };
export type { AppSession, UserRole, UserTier };

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function setSession(session: AppSession) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function getRoleForEmail(email: string): UserRole {
  const normalizedEmail = email.toLowerCase();
  if (normalizedEmail === whiteLabel.auth.superAdminEmail.toLowerCase()) return "super_admin";
  if (normalizedEmail === whiteLabel.auth.adminEmail.toLowerCase()) return "admin";
  return "student";
}

export function getTierForRole(role: UserRole): UserTier {
  return role === "student" ? "free" : "pro";
}

export function canAccessTier(userTier: UserTier, required: "gratis" | "belajar_pro") {
  if (required === "gratis") return true;
  return userTier === "belajar" || userTier === "pro";
}
