import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PaymentCheckout } from "@/components/payment-checkout";
import { StudentShell } from "@/components/student-shell";
import { getPaymentGuideContent, getYoutubeEmbedUrl } from "@/lib/public-content";
import { getCurrentSession } from "@/lib/session";

export const metadata = {
  title: "Pembayaran",
};

const fallbackPaymentGuide = {
  title: "Tata cara pembayaran",
  body: "Pilih paket yang sesuai, cek ringkasan pesanan, lalu klik Lanjutkan pembayaran. Kamu akan diarahkan ke halaman pembayaran resmi Mayar. Setelah pembayaran berhasil, paket aktif otomatis setelah sistem menerima konfirmasi.",
  youtubeUrl: "",
  qrisSteps: "Pilih QRIS di halaman pembayaran.\nBuka aplikasi mobile banking atau e-wallet.\nScan kode QR yang tampil.\nPastikan nominal dan nama merchant sudah benar.\nKonfirmasi pembayaran dan tunggu status berhasil.",
  virtualAccountSteps: "Pilih Virtual Account dan pilih bank yang tersedia.\nSalin nomor virtual account.\nBuka mobile banking, internet banking, atau ATM.\nPilih menu Transfer atau Pembayaran Virtual Account.\nMasukkan nomor virtual account, cek nominal, lalu bayar.",
  ewalletSteps: "Pilih e-wallet yang tersedia.\nMasukkan nomor HP jika diminta.\nBuka aplikasi e-wallet dan cek notifikasi pembayaran.\nKonfirmasi pembayaran di aplikasi.\nKembali ke halaman status untuk melihat aktivasi paket.",
  cardSteps: "Pilih Kartu Debit atau Kredit jika tersedia.\nMasukkan data kartu pada halaman pembayaran aman.\nIkuti verifikasi OTP atau 3DS dari bank.\nPastikan transaksi berhasil.\nSimpan bukti pembayaran jika diperlukan.",
};

function splitSteps(value: string) {
  return value
    .split("\n")
    .map((step) => step.trim().replace(/^\d+[\.)]\s*/, ""))
    .filter(Boolean);
}

export default async function PembayaranPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/masuk");

  const paymentGuide = await getPaymentGuideContent(fallbackPaymentGuide);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(paymentGuide.youtubeUrl);
  const methodGuides = [
    { title: "QRIS", steps: splitSteps(paymentGuide.qrisSteps) },
    { title: "Virtual Account", steps: splitSteps(paymentGuide.virtualAccountSteps) },
    { title: "E-wallet", steps: splitSteps(paymentGuide.ewalletSteps) },
    { title: "Kartu Debit/Kredit", steps: splitSteps(paymentGuide.cardSteps) },
  ];

  return (
    <StudentShell session={session}>
      <Suspense fallback={<div className="mx-auto w-full max-w-6xl flex-1 px-4 py-14">Memuat checkout...</div>}>
        <PaymentCheckout />
      </Suspense>
      <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-700">Panduan Pembayaran</p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">{paymentGuide.title}</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold leading-7 text-slate-600">
              {paymentGuide.body.split("\n").filter(Boolean).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                title={paymentGuide.title}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex aspect-video items-center justify-center p-6 text-center text-sm font-bold text-slate-500">
                Video panduan akan tampil setelah URL YouTube diisi dari admin.
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="mt-2 grid gap-4 md:grid-cols-2">
              {methodGuides.map((method) => (
                <article key={method.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-black text-slate-950">{method.title}</h3>
                  <ol className="mt-3 space-y-2 text-sm font-semibold leading-relaxed text-slate-600">
                    {method.steps.map((step, index) => (
                      <li key={step} className="flex gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-700 text-[11px] font-black text-white">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </StudentShell>
  );
}
