import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, CreditCard, ReceiptText } from "lucide-react";
import { getCurrentSession } from "@/lib/session";
import {
  formatIdr,
  formatTransactionDate,
  getTransactionsForStudent,
  type StudentPaymentTransaction,
} from "@/lib/student-transactions";

export const metadata = {
  title: "Riwayat Transaksi",
};

export default async function TransaksiPage() {
  const session = await getCurrentSession();
  const activeTier = session?.tier ? session.tier.toUpperCase() : "FREE";
  const transactions = await getTransactionsForStudent(session?.userId, session?.email);
  const paidCount = transactions.filter((transaction) => transaction.status === "paid").length;
  const pendingCount = transactions.filter((transaction) => transaction.status === "pending").length;
  const transactionSummary = [
    { label: "Paket aktif", value: activeTier, icon: CheckCircle2 },
    { label: "Transaksi berhasil", value: String(paidCount), icon: ReceiptText },
    { label: "Menunggu bayar", value: String(pendingCount), icon: Clock3 },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#0A66FF]">
          <ReceiptText size={18} />
          Riwayat Transaksi
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Pembayaran dan status paket.</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
          Akun ini sedang memakai paket {activeTier}. Transaksi paket berbayar akan tampil setelah pembayaran dibuat.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {transactionSummary.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Icon size={21} />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{item.value}</p>
            </div>
          );
        })}
      </section>

      {transactions.length > 0 ? (
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-black text-slate-950">Daftar transaksi</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Order terbaru tampil paling atas.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 font-black">Order</th>
                  <th className="p-4 font-black">Paket</th>
                  <th className="p-4 font-black">Nominal</th>
                  <th className="p-4 font-black">Kode</th>
                  <th className="p-4 font-black">Status</th>
                  <th className="p-4 font-black">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-black text-slate-800">{transaction.order_id}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{transaction.payment_method ?? "Menunggu metode"}</p>
                    </td>
                    <td className="p-4 font-bold capitalize text-slate-700">{transaction.plan}</td>
                    <td className="p-4 font-black text-slate-900">{formatIdr(transaction.amount)}</td>
                    <td className="p-4 text-xs font-bold text-slate-600">
                      <p>Promo: {transaction.promo_code ?? "-"}</p>
                      <p>Aff: {transaction.affiliate_code ?? "-"}</p>
                    </td>
                    <td className="p-4">
                      <PaymentStatusBadge status={transaction.status} />
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-500">
                      <p>Dibuat: {formatTransactionDate(transaction.created_at)}</p>
                      <p>Dibayar: {formatTransactionDate(transaction.paid_at)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <CreditCard size={28} />
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-950">Belum ada transaksi tersimpan.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-relaxed text-slate-500">
            Setelah checkout paket Belajar atau Pro selesai dibuat, order ID, status, dan nominal pembayaran akan muncul
            di halaman ini.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/harga"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
            >
              Lihat paket <ArrowRight size={17} />
            </Link>
            <Link
              href="/siswa/profil"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Atur profil <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function PaymentStatusBadge({ status }: { status: StudentPaymentTransaction["status"] }) {
  const styles = {
    paid: "border-emerald-100 bg-emerald-50 text-emerald-700",
    pending: "border-amber-100 bg-amber-50 text-amber-700",
    expired: "border-slate-200 bg-slate-100 text-slate-600",
    failed: "border-rose-100 bg-rose-50 text-rose-700",
  };

  const labels = {
    paid: "Berhasil",
    pending: "Menunggu bayar",
    expired: "Kedaluwarsa",
    failed: "Gagal",
  };

  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-black uppercase ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
