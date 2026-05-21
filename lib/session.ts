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
import { createAdminClient } from "@/lib/supabase/admin";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export { SESSION_COOKIE_NAME, decodeSession, encodeSession };
export type { AppSession, UserRole, UserTier };

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) return null;

  return refreshSessionFromDatabase(session);
}

async function refreshSessionFromDatabase(session: AppSession): Promise<AppSession> {
  if (session.userId.startsWith("dev-")) return session;

  const supabase = createAdminClient();
  if (!supabase) return session;

  const [{ data: profile }, { data: paidTransactions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email,role,tier")
      .eq("id", session.userId)
      .maybeSingle<{
        full_name: string | null;
        email: string | null;
        role: UserRole | null;
        tier: UserTier | null;
      }>(),
    supabase
      .from("payment_transactions")
      .select("plan,status")
      .or(`user_id.eq.${session.userId},customer_email.eq.${session.email}`)
      .eq("status", "paid")
      .limit(10),
  ]);

  const tierRank: Record<UserTier, number> = { free: 0, belajar: 1, pro: 2 };
  const profileTier = profile?.tier ?? session.tier;
  const paidTier = (paidTransactions ?? []).reduce<UserTier>((best, transaction) => {
    const plan = transaction.plan === "pro" ? "pro" : transaction.plan === "belajar" ? "belajar" : "free";
    return tierRank[plan] > tierRank[best] ? plan : best;
  }, profileTier);

  return {
    ...session,
    name: profile?.full_name ?? session.name,
    email: profile?.email ?? session.email,
    role: profile?.role ?? session.role,
    tier: tierRank[paidTier] > tierRank[profileTier] ? paidTier : profileTier,
  };
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
