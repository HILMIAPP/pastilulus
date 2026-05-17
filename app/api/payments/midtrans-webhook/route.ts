import { createHash, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function createSignature(payload: Record<string, unknown>) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return null;

  const orderId = String(payload.order_id ?? "");
  const statusCode = String(payload.status_code ?? "");
  const grossAmount = String(payload.gross_amount ?? "");

  return createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest("hex");
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Record<string, unknown>;
  const expectedSignature = createSignature(payload);
  const receivedSignature = String(payload.signature_key ?? "");

  if (!expectedSignature || !receivedSignature || !safeCompare(expectedSignature, receivedSignature)) {
    return Response.json({ received: false, message: "Invalid Midtrans signature." }, { status: 401 });
  }

  const orderId = String(payload.order_id ?? "");
  const transactionStatus = String(payload.transaction_status ?? "");
  const fraudStatus = String(payload.fraud_status ?? "");
  const isPaid = (transactionStatus === "settlement" || transactionStatus === "capture") && fraudStatus !== "deny";
  const status = isPaid ? "paid" : transactionStatus === "expire" ? "expired" : transactionStatus === "deny" || transactionStatus === "cancel" ? "failed" : "pending";
  const supabaseAdmin = createAdminClient();

  if (supabaseAdmin && orderId) {
    const { data: existingTransaction } = await supabaseAdmin
      .from("payment_transactions")
      .select("status,promo_code,affiliate_code,amount,user_id,plan")
      .eq("order_id", orderId)
      .maybeSingle<{
        status: string;
        promo_code: string | null;
        affiliate_code: string | null;
        amount: number;
        user_id: string | null;
        plan: "belajar" | "pro";
      }>();
    const shouldApplyPaidSideEffects = isPaid && existingTransaction?.status !== "paid";

    const { data: transaction } = await supabaseAdmin
      .from("payment_transactions")
      .update({
        status,
        payment_method: payload.payment_type ? String(payload.payment_type) : null,
        midtrans_transaction_id: payload.transaction_id ? String(payload.transaction_id) : null,
        raw_payload: payload,
        paid_at: isPaid ? String(payload.transaction_time ?? new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)
      .select("user_id,plan,amount,promo_code,affiliate_code")
      .maybeSingle();

    // claim_promo_code uses SELECT FOR UPDATE + limit check: concurrent webhooks
    // for the same promo code queue up, and only valid slots are incremented.
    // If the promo was already exhausted by a concurrent payment, used_count
    // stays at the limit rather than going over. The user keeps their subscription.
    if (shouldApplyPaidSideEffects && transaction?.promo_code) {
      await supabaseAdmin.rpc("claim_promo_code", {
        p_code: transaction.promo_code,
        p_base_amount: transaction.amount,
      });
    }

    if (shouldApplyPaidSideEffects && transaction?.affiliate_code) {
      await supabaseAdmin.rpc("increment_affiliate_conversion", {
        affiliate: transaction.affiliate_code,
        paid_amount: transaction.amount,
      });
    }

    if (shouldApplyPaidSideEffects && transaction?.user_id) {
      const periodStart = new Date();
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabaseAdmin.from("subscriptions").upsert(
        {
          user_id: transaction.user_id,
          plan: transaction.plan,
          status: "active",
          midtrans_order_id: orderId,
          amount: transaction.amount,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "midtrans_order_id" },
      );

      // Only upgrade tier — never downgrade (e.g. Pro user repurchasing Belajar via promo).
      const tierRank: Record<string, number> = { free: 0, belajar: 1, pro: 2 };
      const { data: currentProfile } = await supabaseAdmin
        .from("profiles")
        .select("tier")
        .eq("id", transaction.user_id)
        .maybeSingle<{ tier: string }>();

      const currentRank = tierRank[currentProfile?.tier ?? "free"] ?? 0;
      const newRank = tierRank[transaction.plan] ?? 0;

      if (newRank > currentRank) {
        await supabaseAdmin
          .from("profiles")
          .update({ tier: transaction.plan, updated_at: new Date().toISOString() })
          .eq("id", transaction.user_id);
      }
    }
  }

  return Response.json({
    received: true,
    orderId,
    transactionStatus,
    fraudStatus,
    status,
  });
}
