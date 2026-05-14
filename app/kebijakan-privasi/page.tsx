import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";

export const metadata = {
  title: "Kebijakan Privasi",
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6">
        <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Legal</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Kebijakan Privasi</h1>
        <div className="mt-6 space-y-4 leading-relaxed text-slate-600">
          <p>
            {site.name} mengumpulkan data akun, target PTN, progres belajar, aktivitas try out, hasil rasionalisasi, dan
            preferensi reminder untuk menyediakan pengalaman belajar yang lebih personal.
          </p>
          <p>
            Untuk pembayaran, {site.name} dapat membagikan data transaksi minimum kepada penyedia pembayaran seperti
            Midtrans, misalnya nama paket, nominal, order ID, email, dan status pembayaran.
          </p>
          <p>
            Data pengguna tidak dijual kepada pihak ketiga. Integrasi pembayaran, analitik, reminder, dan AI tutor akan
            menggunakan akses seperlunya sesuai fungsi layanan.
          </p>
          <p>
            Pengguna dapat menghubungi {site.name} untuk pertanyaan privasi, koreksi data, atau permintaan penghapusan
            akun sepanjang tidak bertentangan dengan kewajiban hukum dan administrasi transaksi.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
