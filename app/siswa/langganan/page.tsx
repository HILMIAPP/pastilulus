import Link from "next/link";
import { Check, Flame, Lock, Zap } from "lucide-react";
import { billingPlans, freePlan, calcCurrentPrice, calcQuotaPct, formatIdr, type BillingPlan } from "@/lib/billing";
import { getPlanBuyerCounts } from "@/lib/supabase/plan-stats";
import { getCurrentSession } from "@/lib/session";

export const metadata = { title: "Langganan" };

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

function PlanCard({
  plan,
  buyerCount,
  isActive,
  highlight,
}: {
  plan: BillingPlan;
  buyerCount: number;
  isActive: boolean;
  highlight: boolean;
}) {
  const currentPrice = calcCurrentPrice(plan, buyerCount);
  const quotaPct = calcQuotaPct(plan, buyerCount);
  const earlyBirdFull = buyerCount >= plan.earlyBirdQuota;
  const slotsLeft = Math.max(plan.earlyBirdQuota - buyerCount, 0);

  return (
    <div
      className={`relative flex flex-col rounded-3xl border bg-white p-7 shadow-sm ${
        isActive
          ? "border-emerald-400 ring-2 ring-emerald-400/20"
          : highlight
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-slate-200"
      }`}
    >
      {isActive && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Paket aktif
        </span>
      )}
      {!isActive && highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Paling populer
        </span>
      )}

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">{plan.displayName}</h2>
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

      <div className="mt-3">
        {!earlyBirdFull && (
          <p className="text-xs text-slate-400 line-through">{formatIdr(plan.originalPrice)}</p>
        )}
        <p className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-900">{formatIdr(currentPrice)}</span>
          <span className="text-xs text-slate-500">/ {plan.cadenceLabel.toLowerCase()}</span>
        </p>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Flame size={11} className="text-orange-500" />
            {buyerCount.toLocaleString("id-ID")} orang bergabung
          </span>
          {earlyBirdFull ? (
            <span className="font-black text-rose-600">Slot penuh</span>
          ) : (
            <span className="text-amber-700">{slotsLeft} sisa</span>
          )}
        </div>
        <ProgressBar pct={quotaPct} />
      </div>

      <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-slate-600">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 shrink-0 text-emerald-600" size={16} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {isActive ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3 text-sm font-bold text-emerald-700">
          <Check size={16} /> Paket kamu saat ini
        </div>
      ) : (
        <Link
          href={`/pembayaran?paket=${plan.id}`}
          className={`mt-6 block rounded-2xl py-3 text-center text-sm font-bold transition ${
            highlight
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "border border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          {plan.id === "belajar" ? "Mulai Belajar" : "Upgrade Belajar Full"}
        </Link>
      )}
    </div>
  );
}

export default async function LanggananPage() {
  const [session, buyerCounts] = await Promise.all([getCurrentSession(), getPlanBuyerCounts()]);
  const userTier = session?.tier ?? "free";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-amber-800">
          <Zap size={12} /> Harga Early Bird — terbatas
        </span>
        <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Pilih Paket</h1>
        <p className="mt-2 text-sm text-slate-600">
          Harga naik otomatis setelah slot early bird habis. Semakin cepat, semakin hemat.
        </p>
      </div>

      {/* Free tier note for free users */}
      {userTier === "free" && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <Lock size={16} className="text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Kamu pakai paket Gratis</p>
            <p className="text-xs text-slate-500">
              Akses terbatas: 1 tryout tiap jalur + modul materi pertama saja.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {/* Free tier card */}
        <div
          className={`flex flex-col rounded-3xl border bg-white p-7 shadow-sm ${
            userTier === "free" ? "border-emerald-400 ring-2 ring-emerald-400/20" : "border-slate-200"
          } relative`}
        >
          {userTier === "free" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Paket aktif
            </span>
          )}
          <h2 className="text-base font-bold text-slate-900">{freePlan.name}</h2>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">{freePlan.priceLabel}</span>
            <span className="text-xs text-slate-500">/ {freePlan.cadence}</span>
          </p>
          <div className="mt-3 h-2 rounded-full bg-slate-100" />
          <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-slate-600">
            {freePlan.features.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 shrink-0 text-slate-400" size={16} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {userTier === "free" ? (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3 text-sm font-bold text-emerald-700">
              <Check size={16} /> Paket kamu saat ini
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-slate-100 py-3 text-center text-sm font-bold text-slate-400">
              Paket Gratis
            </div>
          )}
        </div>

        <PlanCard
          plan={billingPlans[0]}
          buyerCount={buyerCounts.belajar}
          isActive={userTier === "belajar"}
          highlight={true}
        />
        <PlanCard
          plan={billingPlans[1]}
          buyerCount={buyerCounts.pro}
          isActive={userTier === "pro"}
          highlight={false}
        />
      </div>
    </main>
  );
}
