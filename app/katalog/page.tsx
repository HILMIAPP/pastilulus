import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";

const catalogUrl = "/katalog/katalog-pastilulus-um-ptn-2026.pdf";

export const metadata = {
  title: "Katalog Produk",
};

export default function KatalogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Katalog Produk</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
                Katalog {site.name} Ujian Mandiri PTN 2026
              </h1>
              <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
                Dokumen ini menjadi materi presentasi produk untuk calon siswa, orang tua, partner sekolah, dan tim
                internal. Versi digitalnya disimpan langsung di proyek agar mudah dibagikan.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={catalogUrl}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A66FF] px-5 py-3 text-sm font-black text-white hover:bg-[#0052D6]"
              >
                <FileText size={17} /> Buka PDF
              </Link>
              <a
                href={catalogUrl}
                download
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
              >
                <Download size={17} /> Unduh
              </a>
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <iframe src={`${catalogUrl}#view=FitH`} title={`Katalog ${site.name}`} className="h-[760px] w-full bg-slate-100" />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
