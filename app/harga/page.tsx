import Link from "next/link";
import { Check, Flame, Zap } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { billingPlans, freePlan, calcCurrentPrice, calcQuotaPct, formatIdr, type BillingPlan } from "@/lib/billing";
import { getPlanBuyerCounts } from "@/lib/supabase/plan-stats";
import { site } from "@/lib/site-config";

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-rose-500" : "bg-amber-400"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PaidPlanCard({
  plan,
  buyerCount,
  highlight,
}: {
  plan: BillingPlan;
  buyerCount: number;
  highlight: boolean;
}) {
  const currentPrice = calcCurrentPrice(plan, buyerCount);
  const quotaPct = calcQuotaPct(plan, buyerCount);
  const earlyBirdFull = buyerCount >= plan.earlyBirdQuota;
  const slotsLeft = Math.max(plan.earlyBirdQuota - buyerCount, 0);

  return (
    <div
      className={`relative flex flex-col rounded-3xl border bg-white p-8 shadow-sm ${
        highlight ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200"
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Paling populer
        </span>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{plan.displayName}</h2>
        {earlyBirdFull ? (
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-black uppercase text-rose-700">
            Harga naik
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase text-amber-800">
            <Zap size={10} /> Early Bird
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mt-4">
        {!earlyBirdFull && (
          <p className="text-sm text-slate-400 line-through">{formatIdr(plan.originalPrice)}</p>
        )}
        <p className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-slate-900">{formatIdr(currentPrice)}</span>
          <span className="text-sm text-slate-500">/ {plan.cadenceLabel.toLowerCase()}</span>
        </p>
      </div>

      {/* Buyer counter + progress */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Flame size={12} className="text-orange-500" />
            {buyerCount.toLocaleString("id-ID")} orang sudah bergabung
          </span>
          {earlyBirdFull ? (
            <span className="font-black text-rose-600">Slot penuh</span>
          ) : (
            <span className="text-amber-700">{slotsLeft} slot tersisa</span>
          )}
        </div>
        <ProgressBar pct={quotaPct} />
        {!earlyBirdFull && (
          <p className="text-[11px] text-slate-500">
            {buyerCount} dari {plan.earlyBirdQuota} slot early bird terisi
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-600">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 shrink-0 text-emerald-600" size={18} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/pembayaran?paket=${plan.id}`}
        className={`mt-8 block rounded-2xl py-3 text-center text-sm font-bold transition ${
          highlight
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "border border-slate-200 bg-white hover:bg-slate-50"
        }`}
      >
        {plan.id === "belajar" ? "Mulai Belajar" : "Upgrade Belajar Full"}
      </Link>
    </div>
  );
}

export default async function HargaPage() {
  const buyerCounts = await getPlanBuyerCounts();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-amber-800">
            <Zap size={12} /> Harga Early Bird — terbatas
          </span>
          <h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
            Harga yang masuk akal untuk pelajar
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Dapatkan harga spesial sebelum slot early bird habis. Harga naik otomatis setelah kuota terpenuhi.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Free tier */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{freePlan.name}</h2>
            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">{freePlan.priceLabel}</span>
              <span className="text-sm text-slate-500">/ {freePlan.cadence}</span>
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100" />
            <p className="mt-2 text-[11px] text-slate-400">Tidak ada batas waktu</p>
            <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-600">
              {freePlan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 shrink-0 text-slate-400" size={18} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/daftar"
              className="mt-8 block rounded-2xl border border-slate-200 bg-white py-3 text-center text-sm font-bold hover:bg-slate-50"
            >
              Daftar gratis
            </Link>
          </div>

          {/* Belajar */}
          <PaidPlanCard plan={billingPlans[0]} buyerCount={buyerCounts.belajar} highlight={true} />

          {/* Belajar Full */}
          <PaidPlanCard plan={billingPlans[1]} buyerCount={buyerCounts.pro} highlight={false} />
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          Pembayaran diproses melalui kanal pembayaran resmi. Dengan melanjutkan pembayaran, pengguna menyetujui Syarat
          Layanan dan Kebijakan Pembayaran {site.name}.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
