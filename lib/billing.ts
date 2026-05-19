export type BillingPlan = {
  id: "belajar" | "pro";
  name: string;
  displayName: string;
  earlyBirdPrice: number;
  originalPrice: number;
  earlyBirdQuota: number;
  priceStepSize: number;
  cadenceLabel: string;
  features: string[];
};

export function formatIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, " ");
}

export function calcCurrentPrice(plan: BillingPlan, buyerCount: number): number {
  if (buyerCount < plan.earlyBirdQuota) return plan.earlyBirdPrice;
  const stepsOver = Math.floor((buyerCount - plan.earlyBirdQuota) / plan.priceStepSize);
  const price = plan.earlyBirdPrice * Math.pow(1.05, stepsOver);
  return Math.min(Math.round(price / 1000) * 1000, plan.originalPrice);
}

export function calcQuotaPct(plan: BillingPlan, buyerCount: number): number {
  return Math.min(Math.round((buyerCount / plan.earlyBirdQuota) * 100), 100);
}

export const freePlan = {
  id: "free",
  name: "Gratis",
  price: 0,
  priceLabel: "Rp 0",
  cadence: "selamanya",
  features: [
    "1 paket tryout Ujian Mandiri PTN",
    "1 paket tryout UM PTKIN",
    "Materi belajar modul pertama tiap jalur",
    "Info PTN & jadwal ujian",
  ],
};

export const billingPlans: BillingPlan[] = [
  {
    id: "belajar",
    name: "Belajar",
    displayName: "Belajar",
    earlyBirdPrice: 25000,
    originalPrice: 150000,
    earlyBirdQuota: 500,
    priceStepSize: 25,
    cadenceLabel: "6 bulan",
    features: [
      "Semua paket tryout Ujian Mandiri PTN",
      "Semua paket tryout UM PTKIN",
      "Semua modul materi belajar",
      "Info PTN lengkap & deadline tracker",
      "Masa aktif 6 bulan",
    ],
  },
  {
    id: "pro",
    name: "Belajar Full",
    displayName: "Belajar Full",
    earlyBirdPrice: 75000,
    originalPrice: 450000,
    earlyBirdQuota: 100,
    priceStepSize: 10,
    cadenceLabel: "Selamanya",
    features: [
      "Semua fitur Belajar",
      "Masa aktif selamanya",
      "Prioritas support",
      "Akses semua fitur baru mendatang",
    ],
  },
];

export function getBillingPlan(id: string | null) {
  return billingPlans.find((plan) => plan.id === id) ?? billingPlans[0];
}
