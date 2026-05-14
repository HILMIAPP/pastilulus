"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/session";
import { createAppSessionFromUser } from "@/lib/auth-session";
import { site } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeName(value: FormDataEntryValue | null, email: string) {
  const name = String(value ?? "").trim();
  return name || email.split("@")[0] || `Siswa ${site.name}`;
}

function validateCredentials(email: string, password: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email tidak valid.";
  }

  if (password.length < 8) {
    return "Kata sandi minimal 8 karakter.";
  }

  return null;
}

export async function signInAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const error = validateCredentials(email, password);

  if (error) {
    redirect(`/masuk?error=${encodeURIComponent(error)}`);
  }

  const supabase = await createClient();
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !data.user) {
    redirect(`/masuk?error=${encodeURIComponent(signInError?.message ?? "Email atau kata sandi salah.")}`);
  }

  const session = await createAppSessionFromUser(data.user);

  redirect(session.role === "student" ? "/siswa" : "/admin");
}

export async function signUpAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const name = normalizeName(formData.get("name"), email);
  const error = validateCredentials(email, password);

  if (error) {
    redirect(`/daftar?error=${encodeURIComponent(error)}`);
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
    redirect(`/daftar?error=${encodeURIComponent(signUpError.message)}`);
  }

  if (!data.session || !data.user) {
    redirect(
      `/masuk?message=${encodeURIComponent("Akun berhasil dibuat. Cek email kamu untuk verifikasi, lalu masuk kembali.")}`,
    );
  }

  await createAppSessionFromUser(data.user);

  redirect("/siswa/onboarding");
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${site.url}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    redirect(`/masuk?error=${encodeURIComponent(error?.message ?? "Login Google belum bisa diproses.")}`);
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearSession();
  redirect("/masuk");
}
