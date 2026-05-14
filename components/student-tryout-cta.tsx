import Link from "next/link";
import { Clock } from "lucide-react";

export function StudentTryoutCta() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Siap simulasi berikutnya?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Paket tryout tetap memakai engine yang sudah ada, dengan tier gating dari sesi login.
          </p>
        </div>
        <Link
          href="/siswa/tryout"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A66FF] px-5 py-3 text-sm font-black text-white shadow-md shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#0052D6]"
        >
          Mulai tryout
          <Clock size={16} />
        </Link>
      </div>
    </section>
  );
}
