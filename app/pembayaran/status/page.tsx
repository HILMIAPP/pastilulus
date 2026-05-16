import Link from "next/link";
import { CheckCircle2, Clock3, Mail, MessageCircle, XCircle } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizePaymentStatus, paymentStatusCopy } from "@/lib/payment-status";
import { site } from "@/lib/site-config";

type Props = {
  searchParams: Promise<{ status?: string; order_id?: string }>;
};

export const metadata = {
  title: "Status Pembayaran",
};

export default async function PaymentStatusPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = normalizePaymentStatus(params.status ?? null);
  const copy = paymentStatusCopy[status];
  const Icon = status === "success" ? CheckCircle2 : status === "failed" ? XCircle : Clock3;
  const tone =
    copy.tone === "emerald"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : copy.tone === "rose"
        ? "bg-rose-50 text-rose-800 border-rose-200"
        : "bg-amber-50 text-amber-800 border-amber-200";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-14 sm:px-6">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border ${tone}`}>
            <Icon size={30} />
          </div>
          <h1 className="mt-6 text-3xl font-black text-slate-950">{copy.title}</h1>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-slate-600">{copy.desc}</p>
          {params.order_id && (
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
              Order ID: {params.order_id}
            </p>
          )}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/siswa" className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white">
              Buka dashboard
            </Link>
            <Link
              href="/siswa/transaksi"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
            >
              Riwayat transaksi
            </Link>
            <Link
              href="/harga"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
            >
              Kembali ke harga
            </Link>
          </div>
          <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-slate-50 px-4 py-4 text-left text-sm font-semibold leading-relaxed text-slate-600">
            <p>
              Jika pembayaran sudah berhasil tetapi paket belum aktif, hubungi support dengan email akun, Order ID, dan
              screenshot bukti bayar.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${site.emailKontak}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-800">
                <Mail size={16} /> Email support
              </a>
              <Link
                href={site.whatsappGroupUrl}
                target={site.whatsappGroupUrl.startsWith("http") ? "_blank" : undefined}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-white"
              >
                <MessageCircle size={16} /> Grup WA
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
