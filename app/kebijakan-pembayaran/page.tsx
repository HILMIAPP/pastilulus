import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";

export const metadata = {
  title: "Kebijakan Pembayaran",
};

const policies = [
  {
    title: "Metode pembayaran",
    body:
      "Pada produksi, pembayaran paket berbayar diproses melalui Midtrans Snap atau penyedia pembayaran resmi lain yang ditampilkan saat checkout. Metode dapat mencakup QRIS, virtual account, kartu, e-wallet, atau kanal lain yang tersedia.",
  },
  {
    title: "Aktivasi paket",
    body: `Paket aktif setelah status pembayaran dinyatakan berhasil oleh sistem pembayaran dan webhook ${site.name}. Jika pembayaran berhasil tetapi akses belum aktif, pengguna dapat menghubungi kontak resmi dengan bukti transaksi.`,
  },
  {
    title: "Refund dan pembatalan",
    body: `Karena ${site.name} menjual akses digital, pembayaran yang sudah berhasil dan paket sudah aktif umumnya tidak dapat dikembalikan. Refund dapat dipertimbangkan jika terjadi pembayaran ganda, kegagalan aktivasi yang tidak dapat diperbaiki, atau kesalahan transaksi yang terbukti.`,
  },
  {
    title: "Gagal bayar dan kedaluwarsa",
    body:
      "Instruksi pembayaran memiliki batas waktu sesuai kanal pembayaran. Jika kedaluwarsa atau gagal, pengguna perlu membuat transaksi baru dari halaman harga/checkout.",
  },
  {
    title: "Pajak dan biaya kanal",
    body:
      "Harga dapat mencakup atau belum mencakup biaya kanal pembayaran dan pajak sesuai ketentuan yang berlaku. Informasi final akan ditampilkan pada halaman checkout sebelum pengguna menyelesaikan pembayaran.",
  },
  {
    title: "Chargeback dan transaksi mencurigakan",
    body: `${site.name} dapat menahan akses, melakukan verifikasi tambahan, atau membatalkan paket jika transaksi terindikasi fraud, chargeback tidak sah, penyalahgunaan promo, atau pelanggaran syarat layanan.`,
  },
];

export default function KebijakanPembayaranPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-14 sm:px-6">
        <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Legal</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Kebijakan Pembayaran dan Refund</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
          Kebijakan ini menjelaskan alur pembayaran, aktivasi paket digital, dan kondisi refund untuk {site.fullName}.
        </p>

        <div className="mt-8 grid gap-4">
          {policies.map((policy) => (
            <section key={policy.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-black text-slate-950">{policy.title}</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{policy.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-relaxed text-blue-950">
          Bantuan pembayaran: <strong>{site.emailKontak}</strong>. Sertakan email akun, waktu transaksi, paket, dan
          bukti pembayaran bila tersedia.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
