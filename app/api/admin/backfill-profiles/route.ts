/**
 * POST /api/admin/backfill-profiles
 * Buat profile untuk semua auth user yang belum punya profile.
 * Panggil SEKALI dari admin setelah migrasi database.
 */
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const session = await getCurrentSession().catch(() => null);
  if (!session || !["admin", "super_admin"].includes(session.role)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase admin tidak tersedia." }, { status: 500 });

  // Ambil semua auth users
  const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 });

  // Ambil semua profile yang sudah ada
  const { data: existingProfiles } = await supabase.from("profiles").select("id");
  const existingIds = new Set((existingProfiles ?? []).map((p: { id: string }) => p.id));

  // Buat profile untuk yang belum ada
  const toInsert = authUsers.users
    .filter((u) => !existingIds.has(u.id))
    .map((u) => ({
      id: u.id,
      full_name: (u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split("@")[0] ?? "Siswa") as string,
      email: u.email ?? "",
      role: "student" as const,
      tier: "free" as const,
    }));

  if (toInsert.length === 0) {
    return NextResponse.json({ ok: true, created: 0, message: "Semua user sudah punya profile." });
  }

  const { error: insertErr } = await supabase.from("profiles").insert(toInsert);
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, created: toInsert.length, message: `${toInsert.length} profile berhasil dibuat.` });
}
