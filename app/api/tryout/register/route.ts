import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/lib/session";

/**
 * POST /api/tryout/register
 *
 * Menyimpan data pendaftaran tryout gratis.
 * - File kartu pelajar di-upload ke Supabase Storage bucket "uploads" (jika ada).
 * - Record disimpan ke tabel "tryout_registrations" (jika ada).
 * - Endpoint mengembalikan 200 OK meski storage/DB gagal — client tetap bisa lanjut.
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const nama = String(formData.get("nama") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const sekolah = String(formData.get("sekolah") ?? "").trim();
  const kelas = String(formData.get("kelas") ?? "").trim();
  const jurusan = String(formData.get("jurusan") ?? "").trim();
  const kartu = formData.get("kartu");
  const kartuFile = kartu instanceof File && kartu.size > 0 ? kartu : null;

  if (!nama || !whatsapp || !sekolah) {
    return Response.json({ error: "Data wajib tidak lengkap." }, { status: 400 });
  }

  const session = await getCurrentSession().catch(() => null);
  const supabase = createAdminClient();

  if (!supabase) {
    // Supabase tidak dikonfigurasi — tetap OK, data tersimpan di localStorage client
    return Response.json({ ok: true, stored: false });
  }

  // ── Upload kartu pelajar ──────────────────────────────────────────────────
  let kartuUrl: string | null = null;

  if (kartuFile) {
    try {
      const ext = kartuFile.name.split(".").pop() ?? "jpg";
      const path = `tryout-reg/${session?.userId ?? "anon"}-${Date.now()}.${ext}`;
      const buffer = await kartuFile.arrayBuffer();

      const { data: up, error: upErr } = await supabase.storage
        .from("uploads")
        .upload(path, buffer, { contentType: kartuFile.type, upsert: true });

      if (!upErr && up) {
        kartuUrl = supabase.storage.from("uploads").getPublicUrl(up.path).data
          .publicUrl;
      }
    } catch {
      // Storage mungkin belum dikonfigurasi — lanjut tanpa URL
    }
  }

  // ── Simpan record ke database ─────────────────────────────────────────────
  try {
    await supabase.from("tryout_registrations").upsert(
      {
        user_id: session?.userId ?? null,
        email: session?.email ?? null,
        nama,
        whatsapp,
        sekolah,
        kelas,
        jurusan,
        kartu_url: kartuUrl,
        registered_at: new Date().toISOString(),
      },
      { onConflict: "user_id", ignoreDuplicates: false },
    );
  } catch {
    // Tabel mungkin belum ada — tidak blok user
  }

  return Response.json({ ok: true, stored: true });
}
