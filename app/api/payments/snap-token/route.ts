import { getBillingPlan } from "@/lib/billing";

type SnapTokenRequest = {
  planId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SnapTokenRequest;
  const plan = getBillingPlan(body.planId ?? null);
  const orderId = `PL-${plan.id}-${Date.now()}`;

  if (!process.env.MIDTRANS_SERVER_KEY || !process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
    return Response.json({
      mode: "development",
      orderId,
      planId: plan.id,
      amount: plan.price,
      redirectUrl: `/pembayaran/status?status=success&order_id=${orderId}`,
      message: "Midtrans env belum diisi. Sistem mengembalikan status simulasi pengembangan.",
    });
  }

  // TODO: Create real Snap transaction token with Midtrans server key.
  // Keep this route server-only because MIDTRANS_SERVER_KEY must never be exposed to the browser.
  return Response.json({
    mode: "snap-token-pending",
    orderId,
    planId: plan.id,
    amount: plan.price,
    redirectUrl: `/pembayaran/status?status=pending&order_id=${orderId}`,
    message: "Kredensial tersedia. Hubungkan request ini ke API Snap Midtrans untuk mendapatkan token transaksi.",
  });
}
