import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSignedUrl } from "@/lib/pasti-lulus-storage";

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

  // Coba dari storage: original/{filename}
  const signedUrl = await getSignedUrl(`original/${filename}`);
  if (!signedUrl) {
    return new NextResponse("File tidak ditemukan di storage. Lakukan migrasi PDF terlebih dahulu.", { status: 404 });
  }

  return NextResponse.redirect(signedUrl);
}
