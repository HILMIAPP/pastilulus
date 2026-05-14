import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { signInWithGoogleAction, signUpAction } from "@/lib/auth-actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DaftarPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Buat akun</h1>
          <p className="mt-1 text-sm text-slate-600">
            Setelah daftar, siswa diarahkan ke onboarding target PTN dan rumpun ujian.
          </p>

          {error && (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <form className="mt-6 space-y-4" action={signUpAction}>
            <div>
              <label className="text-xs font-bold text-slate-700">Nama</label>
              <input
                name="name"
                type="text"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-500 focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-500 focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Kata sandi</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-blue-500 focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Daftar gratis
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400">ATAU</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form action={signInWithGoogleAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm">G</span>
              Daftar dengan Google
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="font-bold text-blue-600 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
