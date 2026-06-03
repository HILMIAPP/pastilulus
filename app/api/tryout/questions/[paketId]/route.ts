import { tryoutPaket, tryoutUmptkinPaket, tryoutPastiLulusPaket, soalPaketById } from "@/lib/app-data";
import { canAccessTier, getCurrentSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkPastiLulusAccessAction } from "@/lib/pasti-lulus-actions";

/**
 * GET /api/tryout/questions/[paketId]
 *
 * Urutan lookup:
 * 1. Tabel question_bank_uploads di Supabase (paket yang diupload via admin)
 * 2. Static question bank di server (fallback untuk paket bawaan)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paketId: string }> },
) {
  const { paketId } = await params;

  // Cari metadata paket (PTN atau PTKIN)
  const allPaket = [...tryoutPaket, ...tryoutUmptkinPaket, ...tryoutPastiLulusPaket];
  const paket = allPaket.find((p) => p.slug === paketId);

  // Cek sesi & tier
  const session = await getCurrentSession();

  // ── 1. Coba ambil dari database (paket yang diupload admin) ──────────────
  const supabase = createAdminClient();
  if (supabase) {
    const { data: uploaded } = await supabase
      .from("question_bank_uploads")
      .select("paket_id,paket_title,akses,soal_count,durasi_menit,scoring_type,questions")
      .eq("paket_id", paketId)
      .maybeSingle();

    if (uploaded) {
      // Paket ditemukan di DB — gunakan akses dari DB
      const aksesDb = (uploaded.akses ?? "belajar_pro") as "gratis" | "belajar_pro";
      if (!canAccessTier(session?.tier ?? "free", aksesDb)) {
        return Response.json(
          { error: "Akses ditolak. Upgrade paket untuk mengerjakan soal ini." },
          { status: 403 },
        );
      }

      const soal = uploaded.questions as unknown[];
      if (!soal || soal.length === 0) {
        return Response.json({ error: "Soal belum tersedia untuk paket ini." }, { status: 404 });
      }

      return Response.json({ soal }, { headers: { "Cache-Control": "private, max-age=300" } });
    }
  }

  // ── 2. Fallback ke static question bank ──────────────────────────────────
  if (!paket) {
    return Response.json({ error: "Paket tidak ditemukan." }, { status: 404 });
  }

  if (paket.requiresPastiLulusToken) {
    const hasPastiLulusAccess = await checkPastiLulusAccessAction();
    if (!hasPastiLulusAccess) {
      return Response.json(
        { error: "Akses ditolak. Masukkan token PASTI LULUS untuk mengerjakan paket ini." },
        { status: 403 },
      );
    }
  } else if (!canAccessTier(session?.tier ?? "free", paket.akses)) {
    return Response.json(
      { error: "Akses ditolak. Upgrade paket untuk mengerjakan soal ini." },
      { status: 403 },
    );
  }

  const soal = soalPaketById[paketId];
  if (!soal || soal.length === 0) {
    return Response.json(
      { error: "Soal belum tersedia untuk paket ini." },
      { status: 404 },
    );
  }

  return Response.json(
    { soal },
    { headers: { "Cache-Control": "private, max-age=300" } },
  );
}
