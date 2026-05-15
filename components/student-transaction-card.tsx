import Link from "next/link";
import { ArrowRight, Clock3, CreditCard, ReceiptText } from "lucide-react";
import { formatIdr, formatTransactionDate, type StudentPaymentTransaction } from "@/lib/student-transactions";

export function StudentTransactionCard({
  transactions,
}: {
  transactions: StudentPaymentTransaction[];
}) {
  const latest = transactions[0];
  const pending = transactions.filter((transaction) => transaction.status === "pending");
  const paid = transactions.filter((transaction) => transaction.status === "paid");

  if (!latest) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-black text-[#0A66FF]">
              <ReceiptText size={17} />
              Transaksi
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Belum ada transaksi.</h2>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
              Pilih paket belajar untuk membuat transaksi pertama.
            </p>
          </div>
          <Link
            href="/harga"
            className="hidden shrink-0 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 sm:inline-flex"
          >
            Lihat paket
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-black text-[#0A66FF]">
            <ReceiptText size={17} />
            Ringkasan transaksi
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            {pending.length > 0 ? "Ada pembayaran menunggu" : "Transaksi terbaru"}
          </h2>
          <p className="mt-1 break-words text-sm font-semibold leading-relaxed text-slate-500">
            Order terakhir: <span className="font-black text-slate-700">{latest.order_id}</span>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <MiniInfo icon={Clock3} label="Pending" value={String(pending.length)} tone="amber" />
          <MiniInfo icon={ReceiptText} label="Berhasil" value={String(paid.length)} tone="emerald" />
          <MiniInfo icon={CreditCard} label="Nominal" value={formatIdr(latest.amount)} tone="blue" />
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black capitalize text-slate-900">Paket {latest.plan}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Dibuat {formatTransactionDate(latest.created_at)} - status {statusLabel(latest.status)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/siswa/transaksi"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-700"
            >
              Buka riwayat <ArrowRight size={16} />
            </Link>
            {latest.status === "pending" && (
              <Link
                href={`/pembayaran/status?status=pending&order_id=${latest.order_id}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                Lihat status
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniInfo({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
  tone: "amber" | "emerald" | "blue";
}) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon size={18} />
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-black text-slate-950">{value}</p>
    </div>
  );
}

function statusLabel(status: StudentPaymentTransaction["status"]) {
  if (status === "paid") return "berhasil";
  if (status === "pending") return "menunggu bayar";
  if (status === "expired") return "kedaluwarsa";
  return "gagal";
}
