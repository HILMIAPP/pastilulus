import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";

export const metadata = {
  title: "Syarat Layanan",
};

const sections = [
  {
    title: "1. Definisi layanan",
    body: `${site.name} menyediakan layanan digital untuk persiapan ujian mandiri PTN, termasuk tryout CBT, materi belajar, Info PTN, jadwal belajar, rasionalisasi nilai, dan fitur pendukung lain yang dapat berubah dari waktu ke waktu.`,
  },
  {
    title: "2. Akun dan akses",
    body: `Pengguna bertanggung jawab menjaga keamanan akun, email, dan perangkat yang digunakan. Akses berbayar bersifat personal dan tidak boleh dibagikan, dijual ulang, disewakan, atau digunakan untuk aktivitas yang merugikan ${site.name} maupun pengguna lain.`,
  },
  {
    title: "3. Lisensi konten digital",
    body: `Seluruh soal, pembahasan, tampilan, analitik, rasionalisasi, logo, dan materi di ${site.name} dilindungi hak kekayaan intelektual. Pengguna mendapatkan lisensi terbatas untuk belajar pribadi, bukan hak kepemilikan atas konten.`,
  },
  {
    title: "4. Pembayaran dan aktivasi paket",
    body: `Pembayaran paket berbayar diproses melalui penyedia pembayaran pihak ketiga, termasuk Midtrans saat produksi. Akses paket aktif setelah pembayaran terkonfirmasi oleh sistem. ${site.name} dapat menolak, membatalkan, atau meninjau transaksi yang terindikasi tidak sah.`,
  },
  {
    title: "5. Perubahan fitur dan harga",
    body: `${site.name} dapat memperbarui fitur, batas pemakaian, harga, dan paket langganan. Perubahan material akan diinformasikan melalui halaman layanan, email, atau kanal komunikasi resmi sebelum diberlakukan bila diperlukan.`,
  },
  {
    title: "6. Rasionalisasi dan hasil belajar",
    body:
      "Hasil tryout, skor estimasi, peluang target PTN, dan rekomendasi belajar adalah alat bantu persiapan. Fitur tersebut bukan jaminan kelulusan, bukan pengganti pengumuman resmi kampus, dan tidak boleh diperlakukan sebagai keputusan final penerimaan mahasiswa.",
  },
  {
    title: "7. Larangan penggunaan",
    body:
      "Pengguna dilarang melakukan scraping, reverse engineering, penyalahgunaan sistem pembayaran, percobaan akses ilegal, unggah konten berbahaya, publikasi ulang soal tanpa izin, atau tindakan lain yang mengganggu keamanan dan operasional layanan.",
  },
  {
    title: "8. Penghentian akses",
    body: `${site.name} dapat membatasi atau menghentikan akses pengguna yang melanggar syarat layanan, menyalahgunakan fitur, melakukan chargeback tidak sah, atau membahayakan sistem. Penghentian akses tidak menghapus kewajiban pembayaran yang sudah terjadi.`,
  },
  {
    title: "9. Privasi dan keamanan",
    body: `Penggunaan data pribadi mengikuti Kebijakan Privasi. ${site.name} menerapkan langkah keamanan yang wajar, tetapi pengguna tetap wajib menjaga kredensial, perangkat, dan akses pribadi masing-masing.`,
  },
  {
    title: "10. Hukum yang berlaku",
    body: `Syarat ini tunduk pada hukum Republik Indonesia. Jika terjadi sengketa, pengguna dan ${site.name} akan mengutamakan penyelesaian secara musyawarah melalui kontak resmi.`,
  },
];

export default function SyaratLayananPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-14 sm:px-6">
        <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Legal</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Syarat Layanan</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
          Dokumen ini mengatur penggunaan {site.fullName}. Versi ini disiapkan untuk alur layanan digital dan
          pembayaran Midtrans, serta akan diperbarui sebelum peluncuran produksi penuh.
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-black text-slate-950">{section.title}</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-relaxed text-blue-950">
          Pertanyaan legal dan pembayaran dapat dikirim ke <strong>{site.emailKontak}</strong>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
