/**
 * POST /api/admin/pasti-lulus-migrate
 *
 * Migrasi ONE-TIME: upload semua PDF dari folder lokal ke Supabase Storage.
 * Panggil sekali dari VPS sebelum pindah ke Vercel.
 * Hanya bisa diakses admin/super_admin.
 */
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getCurrentSession } from "@/lib/session";
import { uploadToStorage, makeOriginalStoragePath } from "@/lib/pasti-lulus-storage";

const PDF_DIR = path.join(process.cwd(), "tryout_univ_jurusan_pastilulus_pdf");

export async function POST() {
  const session = await getCurrentSession().catch(() => null);
  if (!session || !["admin", "super_admin"].includes(session.role)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  if (!fs.existsSync(PDF_DIR)) {
    return NextResponse.json({
      error: "Folder tryout_univ_jurusan_pastilulus_pdf tidak ditemukan. Jalankan endpoint ini dari VPS.",
    }, { status: 404 });
  }

  const files = fs.readdirSync(PDF_DIR).filter((f) => f.endsWith(".pdf"));
  const results: { file: string; status: "ok" | "error"; error?: string }[] = [];

  for (const filename of files) {
    // Parse nomor from filename: "01_tryout_..." → "01"
    const match = filename.match(/^(\d{2})_/);
    const nomor = match?.[1] ?? "00";

    const storagePath = makeOriginalStoragePath(nomor, filename);
    const buffer = fs.readFileSync(path.join(PDF_DIR, filename));
    const result = await uploadToStorage(storagePath, buffer);

    results.push({ file: filename, status: result.ok ? "ok" : "error", error: result.error });
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const errors = results.filter((r) => r.status === "error").length;

  return NextResponse.json({ ok: true, total: files.length, uploaded: ok, errors, results });
}
