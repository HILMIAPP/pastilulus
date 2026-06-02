import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { makeStoragePath, uploadToStorage } from "@/lib/pasti-lulus-storage";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession().catch(() => null);
  if (!session || !["admin", "super_admin"].includes(session.role)) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Form data tidak valid." }, { status: 400 });
  }

  const nomor = (formData.get("nomor") as string | null)?.trim();
  const universitas = (formData.get("universitas") as string | null)?.trim() ?? "";
  const jurusan = (formData.get("jurusan") as string | null)?.trim() ?? "";
  const type = (formData.get("type") as string | null)?.trim();
  const file = formData.get("file") as File | null;

  if (!nomor || !type || !file) {
    return NextResponse.json({ error: "nomor, type, dan file wajib diisi." }, { status: 400 });
  }
  if (type !== "soal" && type !== "pembahasan") {
    return NextResponse.json({ error: "type harus 'soal' atau 'pembahasan'." }, { status: 400 });
  }
  if (!/^\d{2}$/.test(nomor)) {
    return NextResponse.json({ error: "nomor harus 2 digit angka." }, { status: 400 });
  }
  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    return NextResponse.json({ error: "Hanya file PDF yang diizinkan." }, { status: 400 });
  }

  const storagePath = makeStoragePath(nomor, type as "soal" | "pembahasan");
  const arrayBuffer = await file.arrayBuffer();
  const result = await uploadToStorage(storagePath, Buffer.from(arrayBuffer));

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Gagal upload ke storage." }, { status: 500 });
  }

  // Upsert ke pasti_lulus_materials
  const supabase = createAdminClient();
  if (supabase) {
    const updateField = type === "soal" ? "soal_storage_path" : "pembahasan_storage_path";
    await supabase.from("pasti_lulus_materials").upsert(
      {
        nomor,
        universitas,
        jurusan,
        [updateField]: storagePath,
        uploaded_by: session.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "nomor" },
    );
  }

  return NextResponse.json({ ok: true, storagePath });
}
