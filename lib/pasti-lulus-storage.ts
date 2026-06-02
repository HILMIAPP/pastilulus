/**
 * Supabase Storage helpers untuk PASTI LULUS 1.
 *
 * Bucket: "pasti-lulus" (private)
 * Struktur path:
 *   original/{nomor}_{originalFilename}   ← soal asli yang dimigrasi dari VPS
 *   soal/{nomor}_soal.pdf                 ← soal custom yang diupload admin
 *   pembahasan/{nomor}_pembahasan.pdf     ← pembahasan yang diupload admin
 */

import { createAdminClient } from "@/lib/supabase/admin";

export const STORAGE_BUCKET = "pasti-lulus";

/** Hasilkan signed URL (berlaku 2 jam) dari storage path.
 *  Mengembalikan null jika storage tidak tersedia / path tidak ada. */
export async function getSignedUrl(storagePath: string): Promise<string | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 2); // 2 jam

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** Upload buffer ke Supabase Storage. Upsert (overwrite) jika sudah ada. */
export async function uploadToStorage(
  storagePath: string,
  buffer: Buffer,
  contentType = "application/pdf",
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, error: "Supabase admin client tidak tersedia." };

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Buat storage path dari nomor + type. */
export function makeStoragePath(nomor: string, type: "soal" | "pembahasan"): string {
  return `${type}/${nomor}_${type}.pdf`;
}

/** Buat storage path untuk PDF asli (original). */
export function makeOriginalStoragePath(nomor: string, originalFilename: string): string {
  return `original/${nomor}_${originalFilename}`;
}
