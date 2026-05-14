export const paymentStatusCopy = {
  success: {
    title: "Pembayaran berhasil",
    desc: "Terima kasih. Paket akan aktif setelah sistem mengonfirmasi status transaksi.",
    tone: "emerald",
  },
  pending: {
    title: "Pembayaran menunggu",
    desc: "Selesaikan instruksi pembayaran dari Midtrans sebelum batas waktu yang ditentukan.",
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
