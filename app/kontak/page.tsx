import { Mail, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";

export const metadata = {
  title: "Kontak",
};

export default function KontakPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-14 sm:px-6">
        <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Kontak</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Butuh bantuan?</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
          Hubungi tim {site.name} untuk pertanyaan paket belajar, kerja sama sekolah/bimbel, atau kendala akun.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <Mail className="text-[#0A66FF]" />
            <h2 className="mt-4 font-black text-slate-950">Email</h2>
            <p className="mt-2 text-sm text-slate-600">{site.emailKontak}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <MessageCircle className="text-[#0A66FF]" />
            <h2 className="mt-4 font-black text-slate-950">WhatsApp</h2>
            <p className="mt-2 text-sm text-slate-600">Nomor support akan ditambahkan sebelum go-live.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
