"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/lib/session";

async function assertAdmin() {
  const session = await getCurrentSession();
  if (session?.role !== "admin" && session?.role !== "super_admin") {
    throw new Error("Unauthorized admin action.");
  }
}

function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "PL1-";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function generatePastiLulusTokensAction(input: {
  count: number;
  note?: string;
  expiresAt?: string;
}) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const session = await getCurrentSession();
  const count = Math.min(500, Math.max(1, Math.round(input.count)));
  const tokens: string[] = [];

  for (let i = 0; i < count; i++) {
    tokens.push(generateToken());
  }

  const rows = tokens.map((token) => ({
    token,
    note: input.note?.trim() || null,
    created_by: session?.userId ?? null,
    expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
  }));

  const { error } = await supabase.from("pasti_lulus_tokens").insert(rows);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  return { ok: true, tokens };
}

export async function deactivatePastiLulusTokenAction(tokenId: string) {
  await assertAdmin();
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  const { error } = await supabase
    .from("pasti_lulus_tokens")
    .update({ is_active: false })
    .eq("id", tokenId);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function bulkUpdatePastiLulusTokensAction(
  ids: string[],
  action: "deactivate" | "activate" | "delete",
) {
  await assertAdmin();
  if (!ids.length) return { ok: false, message: "Tidak ada token yang dipilih." };
  if (ids.length > 500) return { ok: false, message: "Maksimal 500 token sekaligus." };

  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diisi." };

  let error: { message: string } | null = null;

  if (action === "delete") {
    // Hanya hapus token yang belum pernah diredeeem
    const result = await supabase
      .from("pasti_lulus_tokens")
      .delete()
      .in("id", ids)
      .is("redeemed_by", null);
    error = result.error;
  } else {
    const result = await supabase
      .from("pasti_lulus_tokens")
      .update({ is_active: action === "activate" })
      .in("id", ids);
    error = result.error;
  }

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function checkPastiLulusAccessAction(): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session) return false;
  if (session.role === "admin" || session.role === "super_admin") return true;

  const supabase = createAdminClient();
  if (!supabase) return false;

  const { data } = await supabase
    .from("pasti_lulus_tokens")
    .select("id")
    .eq("redeemed_by", session.userId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

export async function redeemPastiLulusTokenAction(token: string): Promise<{ ok: boolean; message: string }> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, message: "Silakan masuk terlebih dahulu." };

  const supabase = createAdminClient();
  if (!supabase) return { ok: false, message: "Server error, coba lagi nanti." };

  const upperToken = token.trim().toUpperCase();

  const { data: existing } = await supabase
    .from("pasti_lulus_tokens")
    .select("id,redeemed_by,is_active,expires_at")
    .eq("token", upperToken)
    .maybeSingle();

  if (!existing) return { ok: false, message: "Kode token tidak ditemukan. Periksa kembali penulisannya." };
  if (!existing.is_active) return { ok: false, message: "Token ini sudah tidak aktif." };
  if (existing.expires_at && new Date(existing.expires_at) < new Date()) {
    return { ok: false, message: "Token sudah kadaluarsa." };
  }
  if (existing.redeemed_by) {
    if (existing.redeemed_by === session.userId) {
      return { ok: false, message: "Kamu sudah pernah meredeem token ini — akses sudah aktif." };
    }
    return { ok: false, message: "Token ini sudah digunakan oleh pengguna lain." };
  }

  const { error } = await supabase
    .from("pasti_lulus_tokens")
    .update({ redeemed_by: session.userId, redeemed_at: new Date().toISOString() })
    .eq("id", existing.id);

  if (error) return { ok: false, message: error.message };

  return { ok: true, message: "Token berhasil diaktifkan! Selamat datang di PASTI LULUS 1." };
}
