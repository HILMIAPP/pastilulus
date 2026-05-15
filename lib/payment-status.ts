export const paymentStatusCopy = {
  success: {
    title: "Pembayaran berhasil",
    desc: "Terima kasih. Pembayaran sudah terkonfirmasi dan paket akan diaktifkan oleh sistem.",
    tone: "emerald",
  },
  pending: {
    title: "Pembayaran menunggu",
    desc: "Transaksi sudah dibuat, tetapi pembayaran belum terkonfirmasi. Selesaikan instruksi pembayaran sebelum batas waktu.",
    tone: "amber",
  },
  failed: {
    title: "Pembayaran gagal",
    desc: "Transaksi belum berhasil. Kamu bisa mencoba ulang dari halaman harga.",
    tone: "rose",
  },
} as const;

export type PaymentStatus = keyof typeof paymentStatusCopy;

export function normalizePaymentStatus(value: string | null): PaymentStatus {
  if (value === "success" || value === "pending" || value === "failed") return value;
  return "pending";
}
