import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/lib/session";

/**
 * POST /api/admin/paket/upload
 *
 * Menyimpan paket tryout baru (metadata + soal) ke tabel question_bank_uploads.
 * Hanya bisa diakses admin / super_admin.
 */
export async function POST(request: Request) {
  const session = await getCurrentSession().catch(() => null);
  if (!session || !["admin", "super_admin"].includes(session.role)) {
    return Response.json({ error: "Akses ditolak." }, { status: 403 });
  }

  let body: {
    slug: string;
    title: string;
    subtitle: string;
    durasiMenit: number;
    akses: "gratis" | "belajar_pro";
    scoringType: "classical" | "irt";
    questions: unknown[];
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }

  const { slug, title, subtitle, durasiMenit, akses, scoringType, questions } = body;

  if (!slug?.trim() || !title?.trim() || !Array.isArray(questions) || questions.length === 0) {
    return Response.json({ error: "Slug, judul, dan soal wajib diisi." }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return Response.json({ error: "Database tidak terkonfigurasi." }, { status: 500 });
  }

  const { error } = await supabase.from("question_bank_uploads").upsert(
    {
      paket_id: slug.trim(),
      paket_title: title.trim(),
      paket_subtitle: subtitle?.trim() ?? "",
      soal_count: questions.length,
      durasi_menit: durasiMenit ?? 120,
      akses: akses ?? "belajar_pro",
      scoring_type: scoringType ?? "classical",
      questions,
      uploaded_by: session.email,
      created_at: new Date().toISOString(),
    },
    { onConflict: "paket_id" },
  );

  if (error) {
    console.error("[admin/paket/upload]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, slug, count: questions.length });
}
