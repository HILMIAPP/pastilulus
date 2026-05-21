import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

type JsonObject = Record<string, unknown>;

type PaymentTransactionForWebhook = {
  order_id: string;
  status: string;
  promo_code: string | null;
  affiliate_code: string | null;
  amount: number;
  user_id: string | null;
  plan: "belajar" | "pro";
  customer_email: string | null;
};

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getMayarBaseUrl() {
  return (process.env.MAYAR_BASE_URL ?? "https://api.mayar.id/hl/v1").replace(/\/+$/, "");
}

function getNestedObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : null;
}

function findStringByKeys(value: unknown, keys: string[]): string | null {
  const object = getNestedObject(value);
  if (!object) return null;

  for (const key of keys) {
    const found = object[key];
    if (typeof found === "string" && found.trim()) return found.trim();
    if (typeof found === "number" && Number.isFinite(found)) return String(found);
  }

  for (const child of Object.values(object)) {
    const found = findStringByKeys(child, keys);
    if (found) return found;
  }

  return null;
}

function findNumberByKeys(value: unknown, keys: string[]): number | null {
  const object = getNestedObject(value);
  if (!object) return null;

  for (const key of keys) {
    const found = object[key];
    if (typeof found === "number" && Number.isFinite(found)) return found;
    if (typeof found === "string" && found.trim() && Number.isFinite(Number(found))) return Number(found);
  }

  for (const child of Object.values(object)) {
    const found = findNumberByKeys(child, keys);
    if (found !== null) return found;
  }

  return null;
}

function extractWebhookData(payload: JsonObject) {
  const eventName = findStringByKeys(payload, ["event", "eventName", "type", "status"])?.toLowerCase() ?? "";
  const orderId = findStringByKeys(payload, ["orderId", "order_id", "referenceId", "reference_id", "externalId", "external_id"]);
  const providerPaymentId = findStringByKeys(payload, ["invoiceId", "invoice_id", "paymentId", "payment_id", "id"]);
  const providerTransactionId = findStringByKeys(payload, ["transactionId", "transaction_id"]);
  const paymentMethod = findStringByKeys(payload, ["paymentMethod", "payment_method", "method", "channel"]);
  const email = findStringByKeys(payload, ["email", "customerEmail", "customer_email"]);
  const paidAt = findStringByKeys(payload, ["paidAt", "paid_at", "transactionTime", "transaction_time", "createdAt", "created_at"]);
  const amount = findNumberByKeys(payload, ["amount", "totalAmount", "total_amount", "paidAmount", "paid_amount", "grossAmount", "gross_amount"]);

  return { eventName, orderId, providerPaymentId, providerTransactionId, paymentMethod, email, paidAt, amount };
}

function isPaidEvent(eventName: string) {
  if (!eventName) return false;
  return ["payment.received", "paid", "success", "received", "completed", "settlement"].some((status) => eventName.includes(status));
}

async function verifyMayarInvoiceStatus(providerPaymentId: string) {
  if (!process.env.MAYAR_API_KEY) return process.env.NODE_ENV !== "production";

  try {
    const response = await fetch(`${getMayarBaseUrl()}/invoice/${encodeURIComponent(providerPaymentId)}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.MAYAR_API_KEY}`,
      },
    });

    if (!response.ok) return false;

    const payload = (await response.json()) as JsonObject;
    const status = findStringByKeys(payload, ["status", "paymentStatus", "payment_status"])?.toLowerCase() ?? "";
    return ["paid", "success", "received", "completed", "settlement"].some((paidStatus) => status.includes(paidStatus));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const expectedSecret = process.env.MAYAR_WEBHOOK_SECRET;
  const receivedSecret =
    request.headers.get("x-mayar-webhook-secret") ??
    request.headers.get("x-webhook-secret") ??
    new URL(request.url).searchParams.get("secret") ??
    "";

  if (!expectedSecret || !receivedSecret || !safeCompare(expectedSecret, receivedSecret)) {
    return Response.json({ received: false, message: "Invalid Mayar webhook secret." }, { status: 401 });
  }

  const payload = (await request.json()) as JsonObject;
  const { eventName, orderId, providerPaymentId, providerTransactionId, paymentMethod, email, paidAt, amount } = extractWebhookData(payload);

  if (!isPaidEvent(eventName)) {
    return Response.json({ received: true, status: "ignored", eventName });
  }

  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin) {
    return Response.json({ received: false, message: "Supabase admin client is not configured." }, { status: 503 });
  }

  let transactionQuery = supabaseAdmin
    .from("payment_transactions")
    .select("order_id,status,promo_code,affiliate_code,amount,user_id,plan,customer_email")
    .limit(1);

  if (orderId) {
    transactionQuery = transactionQuery.eq("order_id", orderId);
  } else if (providerPaymentId) {
    transactionQuery = transactionQuery.eq("provider_payment_id", providerPaymentId);
  } else {
    return Response.json({ received: false, message: "Mayar webhook is missing order/payment identifier." }, { status: 400 });
  }

  const { data: existingTransaction } = await transactionQuery.maybeSingle<PaymentTransactionForWebhook>();
  if (!existingTransaction) {
    return Response.json({ received: false, message: "Payment transaction not found." }, { status: 404 });
  }

  if (amount !== null && Number(existingTransaction.amount) !== Number(amount)) {
    return Response.json({ received: false, message: "Payment amount mismatch." }, { status: 409 });
  }

  if (email && existingTransaction.customer_email && email.toLowerCase() !== existingTransaction.customer_email.toLowerCase()) {
    return Response.json({ received: false, message: "Payment customer mismatch." }, { status: 409 });
  }

  if (providerPaymentId) {
    const verified = await verifyMayarInvoiceStatus(providerPaymentId);
    if (!verified) {
      return Response.json({ received: false, message: "Mayar invoice status is not paid." }, { status: 409 });
    }
  }

  const shouldApplyPaidSideEffects = existingTransaction.status !== "paid";
  const resolvedOrderId = orderId ?? existingTransaction.order_id;

  const { data: transaction } = await supabaseAdmin
    .from("payment_transactions")
    .update({
      status: "paid",
      payment_provider: "mayar",
      payment_method: paymentMethod,
      provider_payment_id: providerPaymentId,
      provider_transaction_id: providerTransactionId,
      raw_payload: payload,
      paid_at: paidAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq(orderId ? "order_id" : "provider_payment_id", orderId ?? providerPaymentId)
    .select("user_id,plan,amount,promo_code,affiliate_code")
    .maybeSingle<{
      user_id: string | null;
      plan: "belajar" | "pro";
      amount: number;
      promo_code: string | null;
      affiliate_code: string | null;
    }>();

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
    if (transaction.plan === "pro") {
      periodEnd.setFullYear(2099, 11, 31);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 6);
    }

    await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: transaction.user_id,
        plan: transaction.plan,
        status: "active",
        provider_order_id: resolvedOrderId,
        amount: transaction.amount,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider_order_id" },
    );

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

  return Response.json({
    received: true,
    eventName,
    orderId: resolvedOrderId,
    providerPaymentId,
    providerTransactionId,
    status: "paid",
  });
}
