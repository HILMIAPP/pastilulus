import { getBillingPlan } from "@/lib/billing";
import { getCurrentSession } from "@/lib/session";
import { site } from "@/lib/site-config";
import { createAdminClient } from "@/lib/supabase/admin";

type SnapTokenRequest = {
  planId?: string;
  promoCode?: string;
  affiliateCode?: string;
};

type MidtransSnapResponse = {
  token?: string;
  redirect_url?: string;
  error_messages?: string[];
};

function getSnapEndpoint() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

function normalizeTrackingCode(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32);
  return normalized || undefined;
}

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

export async function POST(request: Request) {
  const body = (await request.json()) as SnapTokenRequest;
  const plan = getBillingPlan(body.planId ?? null);
  const orderId = `PL-${plan.id}-${Date.now()}`;
  const session = await getCurrentSession();
  const requestedPromoCode = normalizeTrackingCode(body.promoCode);
  const requestedAffiliateCode = normalizeTrackingCode(body.affiliateCode);
  const supabaseAdmin = createAdminClient();
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
  const discountAmount = calculateDiscount(plan.price, promo);
  const finalAmount = Math.max(0, plan.price - discountAmount);
  const promoCode = discountAmount > 0 ? promo?.code : undefined;
  const affiliateCode = affiliate?.code;
  const trackingMetadata = JSON.stringify({ promoCode, affiliateCode, discountAmount });

  async function recordTransaction(status: "pending" | "failed") {
    if (!supabaseAdmin) return;
    await supabaseAdmin.from("payment_transactions").upsert(
      {
        order_id: orderId,
        user_id: session?.userId?.startsWith("dev-") ? null : session?.userId,
        customer_name: session?.name,
        customer_email: session?.email,
        plan: plan.id,
        amount: finalAmount,
        status,
        promo_code: promoCode,
        affiliate_code: affiliateCode,
        raw_payload: {
          source: "snap-token",
          originalAmount: plan.price,
          discountAmount,
          requestedPromoCode,
          requestedAffiliateCode,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "order_id" },
    );
  }

  if (!process.env.MIDTRANS_SERVER_KEY || !process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
    await recordTransaction("pending");
    return Response.json({
      mode: "development",
      orderId,
      planId: plan.id,
      amount: finalAmount,
      promoCode,
      affiliateCode,
      discountAmount,
      redirectUrl: `/pembayaran/status?status=pending&order_id=${orderId}`,
      message: "Pembayaran simulasi pengembangan dibuat.",
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? site.url;
  const response = await fetch(getSnapEndpoint(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: finalAmount,
      },
      item_details: [
        {
          id: plan.id,
          price: finalAmount,
          quantity: 1,
          name: `Paket ${plan.name} ${site.name}${discountAmount > 0 ? " Promo" : ""}`.slice(0, 50),
        },
      ],
      customer_details: session
        ? {
            first_name: session.name,
            email: session.email,
          }
        : undefined,
      callbacks: {
        finish: `${appUrl}/pembayaran/status?status=pending&order_id=${orderId}`,
      },
      custom_field1: plan.id,
      custom_field2: session?.userId,
      custom_field3: trackingMetadata.slice(0, 255),
    }),
  });

  const midtrans = (await response.json()) as MidtransSnapResponse;

  if (!response.ok || !midtrans.redirect_url) {
    await recordTransaction("failed");
    return Response.json(
      {
        mode: "midtrans-error",
        orderId,
        planId: plan.id,
        amount: finalAmount,
        promoCode,
        affiliateCode,
        discountAmount,
        redirectUrl: `/pembayaran/status?status=failed&order_id=${orderId}`,
        message: midtrans.error_messages?.join(" ") ?? "Sistem pembayaran gagal membuat transaksi.",
      },
      { status: 502 },
    );
  }

  await recordTransaction("pending");
  return Response.json({
    mode: "midtrans-snap",
    orderId,
    planId: plan.id,
    amount: finalAmount,
    promoCode,
    affiliateCode,
    discountAmount,
    token: midtrans.token,
    redirectUrl: midtrans.redirect_url,
    message: "Transaksi pembayaran berhasil dibuat.",
  });
}
