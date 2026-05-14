import { createHash, timingSafeEqual } from "crypto";

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

  // TODO production:
  // 1. Fetch/confirm transaction status to Midtrans when needed.
  // 2. Update order, payment, and user subscription in database.
  // 3. Make this handler idempotent by order_id.
  return Response.json({
    received: true,
    orderId: payload.order_id ?? null,
    transactionStatus: payload.transaction_status ?? null,
    fraudStatus: payload.fraud_status ?? null,
    note: "Webhook handler belum mengaktifkan paket. Aktifkan akses hanya setelah verifikasi signature dan status transaksi.",
  });
}
