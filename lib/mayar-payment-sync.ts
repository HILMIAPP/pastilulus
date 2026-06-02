import { createAdminClient } from "@/lib/supabase/admin";
import type { AppSession } from "@/lib/session-codec";

type JsonObject = Record<string, unknown>;

type PaymentTransactionForSync = {
  order_id: string;
  status: "pending" | "paid" | "expired" | "failed";
  promo_code: string | null;
  affiliate_code: string | null;
  amount: number;
  user_id: string | null;
  plan: "belajar" | "pro";
  customer_email: string | null;
  customer_name?: string | null;
  payment_method?: string | null;
  provider_payment_url?: string | null;
  provider_payment_id: string | null;
  provider_transaction_id: string | null;
  paid_at?: string | null;
};

let lastAdminBackfillAt = 0;

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

function hasPaidStatus(value: unknown) {
  const object = getNestedObject(value);
  if (!object) return false;

  const status = findStringByKeys(object, ["status", "paymentStatus", "payment_status"])?.toLowerCase() ?? "";
  if (["paid", "success", "received", "completed", "settlement"].some((paidStatus) => status.includes(paidStatus))) {
    return true;
  }

  const transactions = object.transactions;
  if (Array.isArray(transactions)) {
    return transactions.some((transaction) => {
      const transactionStatus = findStringByKeys(transaction, ["status", "paymentStatus", "payment_status"])?.toLowerCase() ?? "";
      return ["paid", "success", "received", "completed", "settlement"].some((paidStatus) => transactionStatus.includes(paidStatus));
    });
  }

  return false;
}

async function fetchMayarInvoice(providerPaymentId: string) {
  if (!process.env.MAYAR_API_KEY) return null;

  try {
    const response = await fetch(`${getMayarBaseUrl()}/invoice/${encodeURIComponent(providerPaymentId)}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.MAYAR_API_KEY}`,
      },
    });

    if (!response.ok) return null;
    return (await response.json()) as JsonObject;
  } catch {
    return null;
  }
}

async function fetchMayarInvoiceByOrderId(orderId: string) {
  if (!process.env.MAYAR_API_KEY) return null;

  for (let page = 1; page <= 5; page += 1) {
    try {
      const response = await fetch(`${getMayarBaseUrl()}/invoice?page=${page}`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.MAYAR_API_KEY}`,
        },
      });

      if (!response.ok) return null;
      const payload = (await response.json()) as JsonObject;
      const invoices = Array.isArray(payload.data) ? payload.data : [];
      const invoice = invoices.find((item) => JSON.stringify(item).includes(orderId));
      if (getNestedObject(invoice)) return invoice as JsonObject;

      if (payload.hasMore !== true) return null;
    } catch {
      return null;
    }
  }

  return null;
}

async function fetchMayarInvoicePage(page: number) {
  if (!process.env.MAYAR_API_KEY) return null;

  try {
    const response = await fetch(`${getMayarBaseUrl()}/invoice?page=${page}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.MAYAR_API_KEY}`,
      },
    });

    if (!response.ok) return null;
    return (await response.json()) as JsonObject;
  } catch {
    return null;
  }
}

function findBooleanHasMore(value: JsonObject) {
  return value.hasMore === true || value.has_more === true;
}

function getInvoiceList(value: JsonObject) {
  if (Array.isArray(value.data)) return value.data.filter(getNestedObject);
  if (Array.isArray(value.invoices)) return value.invoices.filter(getNestedObject);
  if (Array.isArray(value.items)) return value.items.filter(getNestedObject);
  return [];
}

function normalizeProviderStatus(value: unknown): "pending" | "paid" | "expired" | "failed" {
  if (hasPaidStatus(value)) return "paid";
  const status = findStringByKeys(value, ["status", "paymentStatus", "payment_status"])?.toLowerCase() ?? "";
  if (["expire", "expired"].some((expiredStatus) => status.includes(expiredStatus))) return "expired";
  if (["fail", "failed", "cancel", "void"].some((failedStatus) => status.includes(failedStatus))) return "failed";
  return "pending";
}

function deriveOrderIdFromInvoice(invoice: JsonObject, providerPaymentId: string) {
  const explicitOrderId = findStringByKeys(invoice, ["orderId", "order_id"]);
  if (explicitOrderId) return explicitOrderId;

  const raw = JSON.stringify(invoice);
  const match = raw.match(/PL-[a-z0-9_-]+-\d{10,}-[a-z0-9_-]+/i);
  if (match) return match[0];

  return `MYR-${providerPaymentId}`;
}

function derivePlanFromInvoice(invoice: JsonObject, orderId: string): "belajar" | "pro" {
  const plan = findStringByKeys(invoice, ["planId", "plan_id", "plan"])?.toLowerCase();
  if (plan === "pro" || orderId.toLowerCase().includes("-pro-")) return "pro";
  return "belajar";
}

async function upsertSubscriptionCompat(
  supabaseAdmin: NonNullable<ReturnType<typeof createAdminClient>>,
  input: {
    userId: string;
    plan: "belajar" | "pro";
    orderId: string;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
  },
) {
  const payload = {
    user_id: input.userId,
    plan: input.plan,
    status: "active",
    provider_order_id: input.orderId,
    midtrans_order_id: input.orderId,
    amount: input.amount,
    current_period_start: input.periodStart.toISOString(),
    current_period_end: input.periodEnd.toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: existingSubscription, error: lookupError } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("provider_order_id", input.orderId)
    .maybeSingle<{ id: string }>();
  if (lookupError) return lookupError;

  if (existingSubscription) {
    const { error } = await supabaseAdmin.from("subscriptions").update(payload).eq("id", existingSubscription.id);
    return error;
  }

  const { error } = await supabaseAdmin.from("subscriptions").insert(payload);
  return error;
}

async function applyPaidSideEffects(transaction: PaymentTransactionForSync) {
  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin || transaction.status === "paid") return;

  if (transaction.promo_code) {
    await supabaseAdmin.rpc("claim_promo_code", {
      p_code: transaction.promo_code,
      p_base_amount: transaction.amount,
    });
  }

  if (transaction.affiliate_code) {
    await supabaseAdmin.rpc("increment_affiliate_conversion", {
      affiliate: transaction.affiliate_code,
      paid_amount: transaction.amount,
    });
  }

  if (!transaction.user_id) return;

  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  if (transaction.plan === "pro") {
    periodEnd.setFullYear(2099, 11, 31);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 6);
  }

  const subscriptionError = await upsertSubscriptionCompat(supabaseAdmin, {
    userId: transaction.user_id,
    plan: transaction.plan,
    orderId: transaction.order_id,
    amount: transaction.amount,
    periodStart,
    periodEnd,
  });
  if (subscriptionError) return;

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

export async function backfillRecentMayarInvoicesForAdmin() {
  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin || !process.env.MAYAR_API_KEY) return { ok: false, imported: 0, synced: 0 };

  const now = Date.now();
  if (now - lastAdminBackfillAt < 60_000) return { ok: true, imported: 0, synced: 0 };
  lastAdminBackfillAt = now;

  let imported = 0;
  let synced = 0;

  for (let page = 1; page <= 2; page += 1) {
    const payload = await fetchMayarInvoicePage(page);
    if (!payload) break;

    const invoices = getInvoiceList(payload);
    for (const invoice of invoices) {
      const providerPaymentId = findStringByKeys(invoice, ["invoiceId", "invoice_id", "paymentId", "payment_id", "id"]);
      if (!providerPaymentId) continue;

      const amount = findNumberByKeys(invoice, ["amount", "totalAmount", "total_amount", "paidAmount", "paid_amount", "grossAmount", "gross_amount"]);
      if (amount === null) continue;

      const orderId = deriveOrderIdFromInvoice(invoice, providerPaymentId);
      const plan = derivePlanFromInvoice(invoice, orderId);
      const customerEmail = findStringByKeys(invoice, ["email", "customerEmail", "customer_email"]);
      const customerName = findStringByKeys(invoice, ["name", "customerName", "customer_name"]);
      const providerTransactionId = findStringByKeys(invoice, ["transactionId", "transaction_id"]);
      const paymentMethod = findStringByKeys(invoice, ["paymentMethod", "payment_method", "method", "channel"]);
      const paymentUrl = findStringByKeys(invoice, ["link", "paymentUrl", "paymentURL", "url"]);
      const status = normalizeProviderStatus(invoice);
      const paidAt = findStringByKeys(invoice, ["paidAt", "paid_at", "settledAt", "settled_at"]);
      const createdAt = findStringByKeys(invoice, ["createdAt", "created_at"]);

      const { data: existingByOrderId } = await supabaseAdmin
        .from("payment_transactions")
        .select("order_id,status,user_id,promo_code,affiliate_code,amount,plan,customer_email,customer_name,payment_method,provider_payment_id,provider_transaction_id,provider_payment_url,paid_at")
        .eq("order_id", orderId)
        .maybeSingle<PaymentTransactionForSync>();
      const { data: existingByProviderId } = existingByOrderId
        ? { data: null }
        : await supabaseAdmin
            .from("payment_transactions")
            .select("order_id,status,user_id,promo_code,affiliate_code,amount,plan,customer_email,customer_name,payment_method,provider_payment_id,provider_transaction_id,provider_payment_url,paid_at")
            .eq("provider_payment_id", providerPaymentId)
            .maybeSingle<PaymentTransactionForSync>();
      const existing = existingByOrderId ?? existingByProviderId;

      let userId = existing?.user_id ?? null;
      if (!userId && customerEmail) {
        const { data: profile } = await supabaseAdmin.from("profiles").select("id").eq("email", customerEmail).maybeSingle<{ id: string }>();
        userId = profile?.id ?? null;
      }

      const transaction: PaymentTransactionForSync = existing ?? {
        order_id: orderId,
        status,
        promo_code: null,
        affiliate_code: null,
        amount,
        user_id: userId,
        plan,
        customer_email: customerEmail,
        provider_payment_id: providerPaymentId,
        provider_transaction_id: providerTransactionId,
      };
      const nextStatus = existing?.status === "paid" ? "paid" : status;

      const { error } = await supabaseAdmin.from("payment_transactions").upsert(
        {
          order_id: orderId,
          user_id: userId,
          customer_name: customerName ?? existing?.customer_name ?? "User Mayar",
          customer_email: customerEmail ?? existing?.customer_email,
          plan,
          amount,
          payment_provider: "mayar",
          payment_method: paymentMethod ?? existing?.payment_method,
          provider_payment_id: providerPaymentId,
          provider_transaction_id: providerTransactionId ?? existing?.provider_transaction_id,
          provider_payment_url: paymentUrl ?? existing?.provider_payment_url,
          status: nextStatus,
          raw_payload: {
            source: "mayar-admin-backfill",
            providerResponse: invoice,
          },
          paid_at: nextStatus === "paid" ? (existing?.paid_at ?? (paidAt ? new Date(paidAt).toISOString() : new Date().toISOString())) : null,
          created_at: createdAt ? new Date(createdAt).toISOString() : undefined,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "order_id" },
      );

      if (error) continue;
      if (!existing) imported += 1;
      if (nextStatus === "paid" && transaction.status !== "paid") {
        await applyPaidSideEffects({ ...transaction, status: "pending", user_id: userId });
        synced += 1;
      }
    }

    if (!findBooleanHasMore(payload)) break;
  }

  return { ok: true, imported, synced };
}

async function recoverMissingTransaction(orderId: string, session?: AppSession | null) {
  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin || !session || session.userId.startsWith("dev-")) return null;

  const mayarPayload = await fetchMayarInvoiceByOrderId(orderId);
  if (!mayarPayload) return null;

  const amount = findNumberByKeys(mayarPayload, ["amount", "totalAmount", "total_amount", "paidAmount", "paid_amount", "grossAmount", "gross_amount"]);
  const providerPaymentId = findStringByKeys(mayarPayload, ["invoiceId", "invoice_id", "paymentId", "payment_id", "id"]);
  const providerTransactionId = findStringByKeys(mayarPayload, ["transactionId", "transaction_id"]);
  const paymentMethod = findStringByKeys(mayarPayload, ["paymentMethod", "payment_method", "method", "channel"]);
  const plan = orderId.includes("-pro-") ? "pro" : "belajar";
  const isPaid = hasPaidStatus(mayarPayload);

  if (!amount || !providerPaymentId) return null;

  const recoveredTransaction: PaymentTransactionForSync = {
    order_id: orderId,
    status: isPaid ? "paid" : "pending",
    promo_code: null,
    affiliate_code: null,
    amount,
    user_id: session.userId,
    plan,
    customer_email: session.email,
    provider_payment_id: providerPaymentId,
    provider_transaction_id: providerTransactionId,
  };

  const { error } = await supabaseAdmin.from("payment_transactions").upsert(
    {
      order_id: orderId,
      user_id: session.userId,
      customer_name: session.name,
      customer_email: session.email,
      plan,
      amount,
      payment_provider: "mayar",
      payment_method: paymentMethod,
      provider_payment_id: providerPaymentId,
      provider_transaction_id: providerTransactionId,
      status: recoveredTransaction.status,
      raw_payload: {
        source: "mayar-status-recovery",
        providerResponse: mayarPayload,
      },
      paid_at: isPaid ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "order_id" },
  );

  if (error) return null;
  if (isPaid) await applyPaidSideEffects({ ...recoveredTransaction, status: "pending" });
  return recoveredTransaction.status;
}

export async function syncMayarPaymentByOrderId(orderId: string, session?: AppSession | null) {
  const supabaseAdmin = createAdminClient();
  if (!supabaseAdmin || !orderId) return null;

  const { data: transaction } = await supabaseAdmin
    .from("payment_transactions")
    .select("order_id,status,promo_code,affiliate_code,amount,user_id,plan,customer_email,provider_payment_id,provider_transaction_id")
    .eq("order_id", orderId)
    .maybeSingle<PaymentTransactionForSync>();

  if (!transaction) return recoverMissingTransaction(orderId, session);
  if (transaction.status === "paid") return transaction.status;
  if (!transaction.provider_payment_id) return transaction.status;

  const mayarPayload = await fetchMayarInvoice(transaction.provider_payment_id);
  if (!mayarPayload || !hasPaidStatus(mayarPayload)) return transaction.status;

  const paidAmount = findNumberByKeys(mayarPayload, ["amount", "totalAmount", "total_amount", "paidAmount", "paid_amount", "grossAmount", "gross_amount"]);
  if (paidAmount !== null && Number(paidAmount) !== Number(transaction.amount)) return transaction.status;

  const customerEmail = findStringByKeys(mayarPayload, ["email", "customerEmail", "customer_email"]);
  if (customerEmail && transaction.customer_email && customerEmail.toLowerCase() !== transaction.customer_email.toLowerCase()) {
    return transaction.status;
  }

  const providerTransactionId = findStringByKeys(mayarPayload, ["transactionId", "transaction_id"]) ?? transaction.provider_transaction_id;
  const paymentMethod = findStringByKeys(mayarPayload, ["paymentMethod", "payment_method", "method", "channel"]);

  await supabaseAdmin
    .from("payment_transactions")
    .update({
      status: "paid",
      payment_provider: "mayar",
      payment_method: paymentMethod,
      provider_transaction_id: providerTransactionId,
      raw_payload: {
        source: "mayar-status-sync",
        providerResponse: mayarPayload,
      },
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  await applyPaidSideEffects(transaction);
  return "paid";
}
