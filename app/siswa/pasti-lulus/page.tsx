import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, BookText, Download, ExternalLink, FileText, Star, Trophy } from "lucide-react";
import { getCurrentSession } from "@/lib/session";
import { checkPastiLulusAccessAction } from "@/lib/pasti-lulus-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADDITIONAL_INDEX_PDF_FILENAMES, PASTI_LULUS_ITEMS, INDEX_PDF_FILENAME, getPastiLulusDefaultFolder } from "@/lib/pasti-lulus-data";
import { getSignedUrl } from "@/lib/pasti-lulus-storage";

type MaterialRecord = {
  nomor: string;
  soal_storage_path: string | null;
  pembahasan_storage_path: string | null;
};

type ResolvedItem = {
  nomor: string;
  universitas: string;
  jurusan: string;
  soalUrl: string | null;
  pembahasanUrl: string | null;
};

async function getFirstSignedUrl(paths: string[]): Promise<string | null> {
  for (const path of paths) {
    const url = await getSignedUrl(path);
    if (url) return url;
  }
  return null;
}

async function fetchResolvedItems(): Promise<ResolvedItem[]> {
  const supabase = createAdminClient();

  // Fetch materials from DB
  const materialsMap = new Map<string, MaterialRecord>();
  if (supabase) {
    const { data } = await supabase
      .from("pasti_lulus_materials")
      .select("nomor,soal_storage_path,pembahasan_storage_path");
    for (const row of data ?? []) {
      materialsMap.set(row.nomor, row as MaterialRecord);
    }
  }

  // Generate signed URLs in parallel
  const resolved = await Promise.all(
    PASTI_LULUS_ITEMS.map(async (item) => {
      const mat = materialsMap.get(item.nomor);

      // Soal: prefer custom upload, fallback to original files from all migrated folders.
      const fallbackSoalPaths = [
        `original/${item.defaultSoalFilename}`,
        `original/${item.nomor}_${item.defaultSoalFilename}`,
        `original/${getPastiLulusDefaultFolder(item.nomor)}/${item.defaultSoalFilename}`,
      ];
      const pembahasanPath = mat?.pembahasan_storage_path ?? null;

      const [soalUrl, pembahasanUrl] = await Promise.all([
        mat?.soal_storage_path ? getSignedUrl(mat.soal_storage_path) : getFirstSignedUrl(fallbackSoalPaths),
        pembahasanPath ? getSignedUrl(pembahasanPath) : Promise.resolve(null),
      ]);

      return {
        nomor: item.nomor,
        universitas: item.universitas,
        jurusan: item.jurusan,
        soalUrl,
        pembahasanUrl,
      };
    }),
  );

  // Signed URL for index PDF
  return resolved;
}

export default async function PastiLulusPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/masuk?next=/siswa/pasti-lulus");

  const hasAccess = await checkPastiLulusAccessAction();
  if (!hasAccess) redirect("/siswa/tryout?pasti-lulus=locked");

  const [items, indexUrl] = await Promise.all([
    fetchResolvedItems(),
    getSignedUrl(`original/${INDEX_PDF_FILENAME}`),
  ]);
  const additionalIndexUrls = await Promise.all(
    ADDITIONAL_INDEX_PDF_FILENAMES.map(async (filename) => ({
      filename,
      url: await getSignedUrl(`original/${filename}`),
    })),
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-yellow-600">Eksklusif</p>
            <h1 className="text-2xl font-black text-slate-900">PASTI LULUS 1</h1>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-slate-500">
          Kamu punya akses ke <strong>{PASTI_LULUS_ITEMS.length} paket tryout</strong> spesifik universitas &amp; jurusan.
          Setiap paket tersedia soal dan pembahasan (jika sudah diupload admin).
        </p>

        {/* Index shortcut */}
        {(indexUrl || additionalIndexUrls.some((item) => item.url)) && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <Star size={16} className="text-yellow-600 shrink-0" />
            <span className="text-sm font-semibold text-yellow-800">Lihat daftar lengkap semua tryout:</span>
            <div className="flex flex-wrap gap-2">
              {indexUrl && (
                <a href={indexUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-yellow-700">
                  <FileText size={13} /> Index Utama
                </a>
              )}
              {additionalIndexUrls.map((item, index) => item.url && (
                <a key={item.filename} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-yellow-700">
                  <FileText size={13} /> Index Tambahan {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid paket */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.nomor}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-sm font-black border border-blue-100">
                {item.nomor}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 truncate">{item.universitas}</p>
                <h3 className="mt-0.5 text-sm font-bold text-slate-900 leading-snug">{item.jurusan}</h3>
              </div>
            </div>

            {/* Status badges */}
            <div className="mt-3 flex gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${item.soalUrl ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-400"}`}>
                <FileText size={10} /> {item.soalUrl ? "Soal tersedia" : "Soal belum ada"}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${item.pembahasanUrl ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>
                <BookText size={10} /> {item.pembahasanUrl ? "Pembahasan tersedia" : "Pembahasan segera hadir"}
              </span>
            </div>

            {/* Buttons */}
            <div className="mt-4 space-y-2">
              {/* Soal */}
              {item.soalUrl ? (
                <div className="flex gap-2">
                  <a href={item.soalUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
                    <ExternalLink size={12} /> Buka Soal
                  </a>
                  <a href={item.soalUrl} download
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <Download size={12} />
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-semibold text-slate-400">
                  Soal belum diupload
                </div>
              )}

              {/* Pembahasan */}
              {item.pembahasanUrl ? (
                <div className="flex gap-2">
                  <a href={item.pembahasanUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">
                    <BookText size={12} /> Buka Pembahasan
                  </a>
                  <a href={item.pembahasanUrl} download
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <Download size={12} />
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-semibold text-slate-400">
                  Pembahasan belum diupload
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link href="/siswa/tryout"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <BookOpen size={16} /> Kembali ke halaman tryout
        </Link>
      </div>
    </main>
  );
}
