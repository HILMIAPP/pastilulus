import type { User } from "@supabase/supabase-js";
import { getRoleForEmail, getTierForRole, setSession, type AppSession } from "@/lib/session";
import { site } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  full_name: string | null;
  email: string | null;
  role: AppSession["role"] | null;
  tier: AppSession["tier"] | null;
};

function getUserDisplayName(user: User, fallbackEmail: string) {
  const metadata = user.user_metadata;
  const metadataName = metadata?.full_name ?? metadata?.name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();
  return fallbackEmail.split("@")[0] || `Siswa ${site.name}`;
}

export async function readProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name,email,role,tier")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  return data;
}

export async function createAppSessionFromUser(user: User) {
  const email = user.email ?? "";
  const profile = await readProfile(user.id);
  const role = profile?.role ?? getRoleForEmail(email);
  const session: AppSession = {
    userId: user.id,
    name: profile?.full_name ?? getUserDisplayName(user, email),
    email: profile?.email ?? email,
    role,
    tier: profile?.tier ?? getTierForRole(role),
    createdAt: Date.now(),
  };

  await setSession(session);
  return session;
}
