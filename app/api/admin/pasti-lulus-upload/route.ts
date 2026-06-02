import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getCurrentSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const UPLOAD_BASE = path.join(process.cwd(), "uploads", "pasti-lulus");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

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

  if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
    return NextResponse.json({ error: "Hanya file PDF yang diizinkan." }, { status: 400 });
  }

  // Sanitize nomor: only 2-digit numbers
  if (!/^\d{2}$/.test(nomor)) {
    return NextResponse.json({ error: "nomor harus 2 digit angka." }, { status: 400 });
  }

  const targetDir = path.join(UPLOAD_BASE, type);
  ensureDir(targetDir);

  // Filename: {nomor}_{type}.pdf — deterministic, so re-upload replaces old
  const filename = `${nomor}_${type}.pdf`;
  const filePath = path.join(targetDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

  // Upsert to pasti_lulus_materials
  const supabase = createAdminClient();
  if (supabase) {
    const updateField = type === "soal" ? "soal_filename" : "pembahasan_filename";
    const { error } = await supabase
      .from("pasti_lulus_materials")
      .upsert(
        {
          nomor,
          universitas,
          jurusan,
          [updateField]: filename,
          uploaded_by: session.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "nomor" },
      );

    if (error) {
      console.error("[pasti-lulus-upload]", error.message);
    }
  }

  return NextResponse.json({ ok: true, filename });
}
