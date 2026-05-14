export type BillingPlan = {
  id: "belajar" | "pro";
  name: string;
  price: number;
  priceLabel: string;
  cadence: string;
  features: string[];
};

function planPrice(envValue: string | undefined, fallback: number) {
  const value = Number(envValue);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function formatIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, " ");
}

export const freePlan = {
  id: "free",
  name: "Free",
  price: 0,
  priceLabel: "Rp 0",
  cadence: "/bulan",
  features: ["Try out terbatas dan info PTN dasar", "Reminder deadline terbatas", "Akses contoh materi belajar"],
};

export const billingPlans: BillingPlan[] = [
  {
    id: "belajar",
    name: "Belajar",
    price: planPrice(process.env.NEXT_PUBLIC_PLAN_BELAJAR_PRICE, 29000),
    priceLabel: formatIdr(planPrice(process.env.NEXT_PUBLIC_PLAN_BELAJAR_PRICE, 29000)),
    cadence: "/bulan",
    features: [
      "Soal dan simulasi tanpa batas praktis",
      "Info PTN lengkap dan deadline tracker",
      "Jadwal belajar personal",
      "Try out paket UM produksi",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: planPrice(process.env.NEXT_PUBLIC_PLAN_PRO_PRICE, 49000),
    priceLabel: formatIdr(planPrice(process.env.NEXT_PUBLIC_PLAN_PRO_PRICE, 49000)),
    cadence: "/bulan",
    features: [
      "Semua fitur Belajar",
      "Rasionalisasi nilai dan target PTN",
      "Analitik kelemahan mendalam",
      "Prioritas support dan fitur AI tutor",
    ],
  },
];

export function getBillingPlan(id: string | null) {
  return billingPlans.find((plan) => plan.id === id) ?? billingPlans[0];
}
