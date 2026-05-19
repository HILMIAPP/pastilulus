import { createAdminClient } from "@/lib/supabase/admin";

export async function getPlanBuyerCounts(): Promise<{ belajar: number; pro: number }> {
  const supabase = createAdminClient();
  if (!supabase) return { belajar: 0, pro: 0 };

  const { data } = await supabase
    .from("payment_transactions")
    .select("plan")
    .eq("status", "paid");

  if (!data) return { belajar: 0, pro: 0 };

  const belajar = data.filter((r) => r.plan === "belajar").length;
  const pro = data.filter((r) => r.plan === "pro").length;

  return { belajar, pro };
}
