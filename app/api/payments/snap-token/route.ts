import { getBillingPlan } from "@/lib/billing";
import { getCurrentSession } from "@/lib/session";
import { site } from "@/lib/site-config";

type SnapTokenRequest = {
  planId?: string;
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

export async function POST(request: Request) {
  const body = (await request.json()) as SnapTokenRequest;
  const plan = getBillingPlan(body.planId ?? null);
  const orderId = `PL-${plan.id}-${Date.now()}`;
  const session = await getCurrentSession();

  if (!process.env.MIDTRANS_SERVER_KEY || !process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
    return Response.json({
      mode: "development",
      orderId,
      planId: plan.id,
      amount: plan.price,
      redirectUrl: `/pembayaran/status?status=pending&order_id=${orderId}`,
      message: "Midtrans env belum diisi. Sistem mengembalikan status pending pengembangan.",
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
        gross_amount: plan.price,
      },
      item_details: [
        {
          id: plan.id,
          price: plan.price,
          quantity: 1,
          name: `Paket ${plan.name} ${site.name}`.slice(0, 50),
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
    }),
  });

  const midtrans = (await response.json()) as MidtransSnapResponse;

  if (!response.ok || !midtrans.redirect_url) {
    return Response.json(
      {
        mode: "midtrans-error",
        orderId,
        planId: plan.id,
        amount: plan.price,
        redirectUrl: `/pembayaran/status?status=failed&order_id=${orderId}`,
        message: midtrans.error_messages?.join(" ") ?? "Midtrans gagal membuat transaksi.",
      },
      { status: 502 },
    );
  }

  return Response.json({
    mode: "midtrans-snap",
    orderId,
    planId: plan.id,
    amount: plan.price,
    token: midtrans.token,
    redirectUrl: midtrans.redirect_url,
    message: "Transaksi Midtrans Snap berhasil dibuat.",
  });
}
