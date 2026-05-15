import Link from "next/link";
import { ArrowRight, BadgeCheck, Mail, Settings, ShieldCheck, Target, UserRound } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";
import { getCurrentSession } from "@/lib/session";

export const metadata = {
  title: "Atur Profil",
};

export default async function ProfilPage() {
  const session = await getCurrentSession();
  const initial = session?.name?.charAt(0).toUpperCase() ?? "S";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#0A66FF]">
          <Settings size={18} />
          Atur Profil
        </p>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-50 text-2xl font-black text-blue-700">
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-black text-slate-950">{session?.name ?? "Siswa"}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Mail size={16} />
              {session?.email ?? "Belum ada email"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">
                Paket {session?.tier ?? "free"}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">
                {session?.role === "student" ? "Siswa" : "Admin"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <ProfileCard
          icon={UserRound}
          title="Data akun"
          body="Nama, email login, dan paket aktif akun kamu."
          href="#data-akun"
          action="Edit data"
        />
        <ProfileCard
          icon={Target}
          title="Target belajar"
          body="Kampus prioritas, checklist pendaftaran, dan arah belajar."
          href="/siswa/target"
          action="Buka target"
        />
        <ProfileCard
          icon={BadgeCheck}
          title="Paket & billing"
          body="Status paket, riwayat transaksi, dan upgrade langganan."
          href="/siswa/transaksi"
          action="Lihat transaksi"
        />
      </section>

      <section id="data-akun" className="mt-6 scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
          <UserRound size={20} className="text-[#0A66FF]" />
          Data akun
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Nama</span>
            <input
              type="text"
              value={session?.name ?? "Siswa"}
              readOnly
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Email login</span>
            <input
              type="email"
              value={session?.email ?? ""}
              readOnly
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Paket</span>
            <input
              type="text"
              value={`Paket ${session?.tier ?? "free"}`}
              readOnly
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold capitalize text-slate-800 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Role</span>
            <input
              type="text"
              value={session?.role === "student" ? "Siswa" : "Admin"}
              readOnly
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none"
            />
          </label>
        </div>
        <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-500">
          Perubahan nama dan email akan dihubungkan ke database profil setelah tabel profil produksi aktif.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
          <ShieldCheck size={20} className="text-[#0A66FF]" />
          Keamanan akun
        </h2>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/siswa/transaksi"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            Riwayat transaksi <ArrowRight size={17} />
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 sm:w-auto"
            >
              Keluar dari akun
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function ProfileCard({
  icon: Icon,
  title,
  body,
  href,
  action,
}: {
  icon: typeof UserRound;
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <Link href={href} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon size={21} />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-950">{title}</h2>
      <p className="mt-2 min-h-12 text-sm font-semibold leading-relaxed text-slate-500">{body}</p>
      <p className="mt-4 flex items-center gap-2 text-sm font-black text-[#0A66FF]">
        {action} <ArrowRight size={16} />
      </p>
    </Link>
  );
}
