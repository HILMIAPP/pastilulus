import { getBillingPlan, calcCurrentPrice } from "@/lib/billing";
import { getCurrentSession } from "@/lib/session";
import { site } from "@/lib/site-config";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanBuyerCounts } from "@/lib/supabase/plan-stats";

type MayarCheckoutRequest = {
  planId?: string;
  promoCode?: string;
  affiliateCode?: string;
};

type PromoCodeRow = {
  code: string;
  discount_type: "nominal" | "percent";
  discount_value: number;
  usage_limit: number;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  status: string;
};

type MayarCreateInvoiceResponse = {
  data?: {
    id?: string;
    transactionId?: string;
    link?: string;
    paymentUrl?: string;
    paymentURL?: string;
    expiredAt?: string;
  };
  id?: string;
  transactionId?: string;
  link?: string;
  paymentUrl?: string;
  paymentURL?: string;
  message?: string;
  error?: string;
  errors?: unknown;
};

function getMayarBaseUrl() {
  return (process.env.MAYAR_BASE_URL ?? "https://api.mayar.id/hl/v1").replace(/\/+$/, "");
}

function normalizeTrackingCode(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32);
  return normalized || undefined;
}

function isPromoCurrentlyValid(promo: PromoCodeRow) {
  const now = Date.now();
  const startsAt = promo.starts_at ? new Date(promo.starts_at).getTime() : null;
  const expiresAt = promo.expires_at ? new Date(promo.expires_at).getTime() : null;
  const underLimit = promo.usage_limit === 0 || promo.used_count < promo.usage_limit;

  return promo.status === "published" && underLimit && (!startsAt || startsAt <= now) && (!expiresAt || expiresAt >= now);
}

function calculateDiscount(amount: number, promo?: PromoCodeRow | null) {
  if (!promo || !isPromoCurrentlyValid(promo)) return 0;
  const discount = promo.discount_type === "percent" ? Math.floor((amount * promo.discount_value) / 100) : promo.discount_value;
  return Math.min(amount, Math.max(0, discount));
}

function getMayarData(response: MayarCreateInvoiceResponse) {
  const data = response.data ?? response;
  return {
    id: data.id,
    transactionId: data.transactionId,
    link: data.link ?? data.paymentUrl ?? data.paymentURL,
    expiredAt: "expiredAt" in data ? data.expiredAt : undefined,
  };
}

function getMayarErrorMessage(response: MayarCreateInvoiceResponse) {
  if (response.message) return response.message;
  if (response.error) return response.error;
  if (response.errors) return JSON.stringify(response.errors);
  return "Sistem pembayaran gagal membuat transaksi Mayar.";
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.userId.startsWith("dev-")) {
    return Response.json({ message: "Login diperlukan untuk melakukan pembayaran." }, { status: 401 });
  }
  const currentSession = session;

  const body = (await request.json()) as MayarCheckoutRequest;
  const plan = getBillingPlan(body.planId ?? null);
  const buyerCounts = await getPlanBuyerCounts();
  const planCurrentPrice = calcCurrentPrice(plan, buyerCounts[plan.id]);
  const orderId = `PL-${plan.id}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const requestedPromoCode = normalizeTrackingCode(body.promoCode);
  const requestedAffiliateCode = normalizeTrackingCode(body.affiliateCode);
  const supabaseAdmin = createAdminClient();
  if (supabaseAdmin) {
    const { error: schemaError } = await supabaseAdmin
      .from("payment_transactions")
      .select("provider_payment_id")
      .limit(1);

    if (schemaError?.code === "42703") {
      return Response.json(
        {
          mode: "schema-error",
          message: "Migrasi database Mayar belum dijalankan. Jalankan docs/MAYAR_PAYMENT_MIGRATION.sql sebelum membuat transaksi baru.",
        },
        { status: 500 },
      );
    }
  }
  const [{ data: promo }, { data: affiliate }] = supabaseAdmin
    ? await Promise.all([
        requestedPromoCode
          ? supabaseAdmin
              .from("promo_codes")
              .select("code,discount_type,discount_value,usage_limit,used_count,starts_at,expires_at,status")
              .eq("code", requestedPromoCode)
              .maybeSingle<PromoCodeRow>()
          : Promise.resolve({ data: null }),
        requestedAffiliateCode
          ? supabaseAdmin
              .from("affiliate_partners")
              .select("code,status")
              .eq("code", requestedAffiliateCode)
              .eq("status", "published")
              .maybeSingle<{ code: string; status: string }>()
          : Promise.resolve({ data: null }),
      ])
    : [{ data: null }, { data: null }];
  const discountAmount = calculateDiscount(planCurrentPrice, promo);
  const finalAmount = Math.max(0, planCurrentPrice - discountAmount);
  const promoCode = discountAmount > 0 ? promo?.code : undefined;
  const affiliateCode = affiliate?.code;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? site.url;
  const statusUrl = `${appUrl}/pembayaran/status?status=pending&order_id=${encodeURIComponent(orderId)}`;

  async function ensureProfile() {
    if (!supabaseAdmin) return null;

    const { data: existingProfile, error: lookupError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", currentSession.userId)
      .maybeSingle<{ id: string }>();
    if (lookupError) return lookupError;
    if (existingProfile) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ full_name: currentSession.name, email: currentSession.email, updated_at: new Date().toISOString() })
        .eq("id", currentSession.userId);
      return error;
    }

    const { error } = await supabaseAdmin.from("profiles").insert({
      id: currentSession.userId,
      full_name: currentSession.name,
      email: currentSession.email,
      role: "student",
      tier: currentSession.tier ?? "free",
      updated_at: new Date().toISOString(),
    });
    return error;
  }

  async function recordTransaction(
    status: "pending" | "failed",
    provider?: { paymentId?: string; transactionId?: string; paymentUrl?: string; responsePayload?: MayarCreateInvoiceResponse },
  ) {
    if (!supabaseAdmin) return null;
    const { error } = await supabaseAdmin.from("payment_transactions").upsert(
      {
        order_id: orderId,
        user_id: currentSession.userId,
        customer_name: currentSession.name,
        customer_email: currentSession.email,
        plan: plan.id,
        amount: finalAmount,
        payment_provider: "mayar",
        provider_payment_id: provider?.paymentId,
        provider_transaction_id: provider?.transactionId,
        provider_payment_url: provider?.paymentUrl,
        status,
        promo_code: promoCode,
        affiliate_code: affiliateCode,
        raw_payload: {
          source: "mayar-checkout",
          originalAmount: planCurrentPrice,
          discountAmount,
          requestedPromoCode,
          requestedAffiliateCode,
          providerResponse: provider?.responsePayload,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "order_id" },
    );
    return error;
  }

  if (supabaseAdmin) {
    const profileError = await ensureProfile();
    if (profileError) {
      return Response.json({ message: `Gagal menyiapkan profile pembayaran: ${profileError.message}` }, { status: 500 });
    }
  }

  if (!process.env.MAYAR_API_KEY) {
    const recordError = await recordTransaction("pending");
    if (recordError) return Response.json({ message: `Gagal mencatat transaksi: ${recordError.message}` }, { status: 500 });
    return Response.json({
      mode: "development",
      orderId,
      planId: plan.id,
      amount: finalAmount,
      promoCode,
      affiliateCode,
      discountAmount,
      redirectUrl: statusUrl,
      message: "Pembayaran simulasi pengembangan dibuat.",
    });
  }

  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const description = `Paket ${plan.name} ${site.name}${discountAmount > 0 ? " Promo" : ""}`;
  const initialRecordError = await recordTransaction("pending");
  if (initialRecordError) {
    return Response.json({ message: `Gagal mencatat transaksi sebelum checkout Mayar: ${initialRecordError.message}` }, { status: 500 });
  }

  const response = await fetch(`${getMayarBaseUrl()}/invoice/create`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.MAYAR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: currentSession.name,
      email: currentSession.email,
      mobile: process.env.MAYAR_DEFAULT_MOBILE ?? "080000000000",
      redirectUrl: statusUrl,
      description,
      expiredAt,
      items: [
        {
          quantity: 1,
          rate: finalAmount,
          description,
        },
      ],
      extraData: {
        orderId,
        userId: currentSession.userId,
        planId: plan.id,
        promoCode,
        affiliateCode,
        discountAmount: String(discountAmount),
      },
    }),
  });

  const mayar = (await response.json()) as MayarCreateInvoiceResponse;
  const mayarData = getMayarData(mayar);

  if (!response.ok || !mayarData.link) {
    await recordTransaction("failed", { responsePayload: mayar });
    return Response.json(
      {
        mode: "mayar-error",
        orderId,
        planId: plan.id,
        amount: finalAmount,
        promoCode,
        affiliateCode,
        discountAmount,
        redirectUrl: `/pembayaran/status?status=failed&order_id=${encodeURIComponent(orderId)}`,
        message: getMayarErrorMessage(mayar),
      },
      { status: response.status === 429 ? 429 : 502, headers: response.status === 429 ? { "Retry-After": response.headers.get("Retry-After") ?? "60" } : undefined },
    );
  }

  const providerRecordError = await recordTransaction("pending", {
    paymentId: mayarData.id,
    transactionId: mayarData.transactionId,
    paymentUrl: mayarData.link,
    responsePayload: mayar,
  });
  if (providerRecordError) {
    return Response.json({ message: `Invoice Mayar dibuat, tetapi gagal menyimpan provider ID: ${providerRecordError.message}` }, { status: 500 });
  }

  return Response.json({
    mode: "mayar-checkout",
    orderId,
    planId: plan.id,
    amount: finalAmount,
    promoCode,
    affiliateCode,
    discountAmount,
    providerPaymentId: mayarData.id,
    providerTransactionId: mayarData.transactionId,
    redirectUrl: mayarData.link,
    message: "Transaksi pembayaran berhasil dibuat.",
  });
}
