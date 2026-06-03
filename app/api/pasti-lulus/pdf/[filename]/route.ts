import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getCurrentSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSignedUrl } from "@/lib/pasti-lulus-storage";
import { PASTI_LULUS_ITEMS, getPastiLulusDefaultFolder } from "@/lib/pasti-lulus-data";

export const runtime = "nodejs";

async function hasPastiLulusAccess(session: Awaited<ReturnType<typeof getCurrentSession>>): Promise<boolean> {
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

function getLocalPdfPath(nomor: string, filename: string) {
  const itemNumber = Number(nomor);
  if (itemNumber <= 27) {
    return path.join(process.cwd(), "tryout_univ_jurusan_pastilulus_pdf", filename);
  }
  if (itemNumber <= 36) {
    return path.join(process.cwd(), "tryout_tambahan_univ_jurusan_pastilulus_pdf", filename);
  }
  return path.join(process.cwd(), "tryout_tambahan_batch2_univ_jurusan_pastilulus_pdf", filename);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const session = await getCurrentSession();
  if (!await hasPastiLulusAccess(session)) {
    return new NextResponse("Akses ditolak.", { status: 403 });
  }

  const { filename } = await params;
  if (!/^[\w\-\.]+\.pdf$/i.test(filename)) {
    return new NextResponse("Nama file tidak valid.", { status: 400 });
  }

  const item = PASTI_LULUS_ITEMS.find((entry) => entry.defaultSoalFilename === filename);
  const candidatePaths = [
    `original/${filename}`,
    ...(item
      ? [
          `original/${item.nomor}_${filename}`,
          `original/${getPastiLulusDefaultFolder(item.nomor)}/${filename}`,
        ]
      : []),
  ];
  let signedUrl: string | null = null;
  for (const path of candidatePaths) {
    signedUrl = await getSignedUrl(path);
    if (signedUrl) break;
  }
  if (!signedUrl) {
    if (!item) {
      return new NextResponse("File tidak ditemukan di storage. Lakukan migrasi PDF terlebih dahulu.", { status: 404 });
    }

    try {
      const buffer = await readFile(getLocalPdfPath(item.nomor, filename));
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "private, max-age=300",
        },
      });
    } catch {
      return new NextResponse("File tidak ditemukan di storage atau folder lokal.", { status: 404 });
    }
  }

  return NextResponse.redirect(signedUrl);
}
