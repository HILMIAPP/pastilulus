"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { getBillingPlan } from "@/lib/billing";
import { site } from "@/lib/site-config";
import { useRouter } from "next/navigation";

export function PaymentCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = getBillingPlan(searchParams.get("paket"));
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const canPay = agreeTerms && agreeRefund;

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_380px]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Checkout</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Aktifkan Paket {plan.name}</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
          {site.name} menggunakan alur pembayaran Midtrans Snap. Pada lingkungan pengembangan, transaksi diarahkan ke
          status simulasi internal tanpa memproses pembayaran nyata.
        </p>

        <div className="mt-8 grid gap-4">
          <PolicyCard
            title="Sebelum membayar"
            items={[
              "Pastikan paket, harga, dan email akun sudah benar.",
              "Akses paket aktif setelah pembayaran dikonfirmasi oleh sistem.",
              "Gunakan metode pembayaran resmi yang tampil di halaman Midtrans Snap.",
            ]}
          />
          <PolicyCard
            title="Ringkasan ketentuan digital"
            items={[
              "Akun dan akses belajar hanya untuk penggunaan pribadi.",
              "Konten soal, pembahasan, analitik, dan rasionalisasi tidak boleh disalin atau dijual ulang.",
              "Rasionalisasi nilai adalah estimasi belajar, bukan jaminan kelulusan kampus.",
            ]}
          />
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(event) => setAgreeTerms(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-sm font-semibold leading-relaxed text-slate-700">
              Saya menyetujui{" "}
              <Link href="/syarat-layanan" className="font-black text-blue-700 hover:underline">
                Syarat Layanan
              </Link>{" "}
              dan{" "}
              <Link href="/kebijakan-privasi" className="font-black text-blue-700 hover:underline">
                Kebijakan Privasi
              </Link>{" "}
              {site.name}.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={agreeRefund}
              onChange={(event) => setAgreeRefund(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-sm font-semibold leading-relaxed text-slate-700">
              Saya memahami bahwa paket digital yang sudah aktif mengikuti{" "}
              <Link href="/kebijakan-pembayaran" className="font-black text-blue-700 hover:underline">
                Kebijakan Pembayaran dan Refund
              </Link>
              .
            </span>
          </label>
        </div>
      </section>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <CreditCard size={23} />
        </div>
        <h2 className="mt-4 text-xl font-black text-slate-950">Ringkasan pesanan</h2>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Paket {plan.name}</span>
            <span className="font-black text-slate-950">{plan.priceLabel}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">Tagihan {plan.cadence}</p>
        </div>

        <ul className="mt-5 space-y-3 text-sm font-semibold text-slate-700">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={!canPay || isCreatingPayment}
          onClick={async () => {
            setIsCreatingPayment(true);
            const response = await fetch("/api/payments/snap-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ planId: plan.id }),
            });
            const data = (await response.json()) as { redirectUrl?: string };
            router.push(data.redirectUrl ?? "/pembayaran/status?status=pending");
          }}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isCreatingPayment ? "Menyiapkan pembayaran..." : "Lanjut ke Midtrans Snap"} <ExternalLink size={16} />
        </button>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="flex items-center gap-2 text-sm font-black text-blue-950">
            <ShieldCheck size={17} />
            Mode pengembangan
          </p>
          <p className="mt-2 text-xs leading-relaxed text-blue-900">
            Endpoint saat ini mengembalikan respons simulasi. Saat kredensial Midtrans aktif, gunakan Snap token dari
            server dan verifikasi webhook.
          </p>
        </div>
      </aside>
    </main>
  );
}

function PolicyCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="font-black text-slate-950">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
