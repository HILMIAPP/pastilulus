import Link from "next/link";
import { Check } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { billingPlans, freePlan } from "@/lib/billing";
import { site } from "@/lib/site-config";

const tiers = [
  {
    name: freePlan.name,
    price: freePlan.priceLabel,
    cadence: freePlan.cadence,
    highlight: false,
    bullets: freePlan.features,
    cta: { href: "/daftar", label: "Daftar gratis" },
  },
  {
    name: billingPlans[0].name,
    price: billingPlans[0].priceLabel,
    cadence: billingPlans[0].cadence,
    highlight: true,
    bullets: billingPlans[0].features,
    cta: { href: "/pembayaran?paket=belajar", label: "Mulai Belajar" },
  },
  {
    name: billingPlans[1].name,
    price: billingPlans[1].priceLabel,
    cadence: billingPlans[1].cadence,
    highlight: false,
    bullets: billingPlans[1].features,
    cta: { href: "/pembayaran?paket=pro", label: "Upgrade Pro" },
  },
];

export default function HargaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">Harga yang masuk akal untuk pelajar</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Paket digital untuk persiapan ujian mandiri: tryout, target PTN, jadwal belajar, dan rasionalisasi nilai
            dengan harga yang ramah pelajar.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-3xl border bg-white p-8 shadow-sm ${
                tier.highlight ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200"
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Paling populer
                </span>
              )}
              <h2 className="text-lg font-bold text-slate-900">{tier.name}</h2>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{tier.price}</span>
                <span className="text-sm text-slate-500">{tier.cadence}</span>
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-600">
                {tier.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <Check className="mt-0.5 shrink-0 text-emerald-600" size={18} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.cta.href}
                className={`mt-8 block rounded-2xl py-3 text-center text-sm font-bold ${
                  tier.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {tier.cta.label}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-slate-500">
          Pembayaran diproses melalui Midtrans Snap saat produksi. Dengan melanjutkan pembayaran, pengguna menyetujui
          Syarat Layanan dan Kebijakan Pembayaran {site.name}.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
