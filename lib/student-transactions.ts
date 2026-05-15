import { createAdminClient } from "@/lib/supabase/admin";

export type StudentPaymentTransaction = {
  id: string;
  order_id: string;
  plan: string;
  amount: number;
  status: "pending" | "paid" | "expired" | "failed";
  payment_method: string | null;
  promo_code: string | null;
  affiliate_code: string | null;
  created_at: string;
  paid_at: string | null;
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

export function formatTransactionDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export async function getTransactionsForStudent(userId?: string, email?: string) {
  const supabase = createAdminClient();
  if (!supabase || (!userId && !email)) return [];

  const filters = [];
  if (userId && !userId.startsWith("dev-")) filters.push(`user_id.eq.${userId}`);
  if (email) filters.push(`customer_email.eq.${email}`);

  const { data } = await supabase
    .from("payment_transactions")
    .select("id,order_id,plan,amount,status,payment_method,promo_code,affiliate_code,created_at,paid_at")
    .or(filters.join(","))
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as StudentPaymentTransaction[];
}
