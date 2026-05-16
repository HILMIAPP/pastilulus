import Link from "next/link";
import { AlertCircle, CreditCard, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";

export const metadata = {
  title: "Kontak",
  description: `Kontak dan bantuan resmi ${site.name} untuk akun, pembayaran, paket belajar, dan grup WhatsApp.`,
  alternates: {
    canonical: `${site.url}/kontak`,
  },
};

export default function KontakPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-14 sm:px-6">
        <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Kontak</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-5xl">Butuh bantuan?</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
          Hubungi tim {site.name} untuk pertanyaan paket belajar, kerja sama sekolah/bimbel, atau kendala akun.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Mail className="text-[#0A66FF]" />
            <h2 className="mt-4 font-black text-slate-950">Email</h2>
            <p className="mt-2 text-sm text-slate-600">{site.emailKontak}</p>
            <a
              href={`mailto:${site.emailKontak}`}
              className="mt-5 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Kirim email
            </a>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <MessageCircle className="text-[#0A66FF]" />
            <h2 className="mt-4 font-black text-slate-950">Grup WhatsApp</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Masuk grup untuk info deadline, update tryout, diskusi, dan pengumuman penting.
            </p>
            <Link
              href={site.whatsappGroupUrl}
              target={site.whatsappGroupUrl.startsWith("http") ? "_blank" : undefined}
              className="mt-5 inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black text-white hover:bg-emerald-600"
            >
              Gabung grup WA
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0A66FF]">
              <CreditCard size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">Bantuan pembayaran dan aktivasi paket</h2>
              <p className="mt-2 leading-relaxed text-slate-600">
                Jika pembayaran sudah berhasil tetapi paket belum aktif, kirim data berikut agar tim bisa mengecek lebih cepat.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {["Email akun", "Order ID transaksi", "Screenshot bukti bayar"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                    <ShieldCheck size={16} className="text-emerald-600" /> {item}
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-800">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                Jangan kirim password, OTP, atau data kartu penuh. Tim hanya butuh email akun, order ID, dan bukti transaksi.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
