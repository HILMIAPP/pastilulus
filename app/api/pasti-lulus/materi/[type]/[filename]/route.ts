import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getCurrentSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const UPLOAD_BASE = path.join(process.cwd(), "uploads", "pasti-lulus");

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
  { params }: { params: Promise<{ type: string; filename: string }> },
) {
  const session = await getCurrentSession();
  const hasAccess = await hasPastiLulusAccess(session);

  if (!hasAccess) {
    return new NextResponse("Akses ditolak. Redeem kode token terlebih dahulu.", { status: 403 });
  }

  const { type, filename } = await params;

  if (type !== "soal" && type !== "pembahasan") {
    return new NextResponse("Tipe tidak valid.", { status: 400 });
  }

  if (!/^[\w\-\.]+\.pdf$/i.test(filename)) {
    return new NextResponse("Nama file tidak valid.", { status: 400 });
  }

  const filePath = path.join(UPLOAD_BASE, type, filename);

  if (!filePath.startsWith(UPLOAD_BASE)) {
    return new NextResponse("Akses ditolak.", { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File tidak ditemukan.", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
