export async function POST(request: Request) {
  const payload = (await request.json()) as Record<string, unknown>;

  // TODO production:
  // 1. Verify notification signature_key with MIDTRANS_SERVER_KEY.
  // 2. Fetch/confirm transaction status to Midtrans when needed.
  // 3. Update order, payment, and user subscription in database.
  // 4. Make this handler idempotent by order_id.
  return Response.json({
    received: true,
    orderId: payload.order_id ?? null,
    transactionStatus: payload.transaction_status ?? null,
    fraudStatus: payload.fraud_status ?? null,
    note: "Webhook handler belum mengaktifkan paket. Aktifkan akses hanya setelah verifikasi signature dan status transaksi.",
  });
}
