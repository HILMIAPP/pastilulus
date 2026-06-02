"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useSearchParams } from "next/navigation";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

const PERKS = [
  "1.800+ soal mirip ujian asli",
  "Tryout 12 PTN + 39 UIN PTKIN",
  "Rasionalisasi nilai otomatis",
  "Gratis — tanpa kartu kredit",
];

function passwordStrength(p: string) {
  if (!p) return null;
  if (p.length < 8) return { label: "Terlalu pendek", color: "bg-rose-400", width: "w-1/4" };
  if (p.length < 10) return { label: "Lemah", color: "bg-orange-400", width: "w-2/4" };
  if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "Sedang", color: "bg-amber-400", width: "w-3/4" };
  return { label: "Kuat", color: "bg-emerald-500", width: "w-full" };
}

function DaftarForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  const strength = passwordStrength(password);
  const busy = isPending || isGooglePending;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <BrandLogo size="md" showText />
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-black text-slate-900">Buat akun gratis</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="font-bold text-[#0A66FF] hover:underline">
            Masuk di sini
          </Link>
        </p>

        {/* Perks */}
        <ul className="mt-5 space-y-1.5">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
              {perk}
            </li>
          ))}
        </ul>

        {error && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Google — primary CTA */}
        <Link
          href="/api/auth/google"
          onClick={() => setIsGooglePending(true)}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60"
        >
          {isGooglePending ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
          {isGooglePending ? "Menghubungkan…" : "Daftar dengan Google"}
        </Link>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-[11px] font-semibold text-slate-400">atau isi form</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        {/* Form */}
        <form action="/api/auth/signup" method="post" onSubmit={() => setIsPending(true)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-slate-700">
              Nama lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              autoComplete="name"
              placeholder="Nama kamu"
              readOnly={busy}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0A66FF] focus:bg-white focus:ring-4 focus:ring-[#0A66FF]/10 disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="kamu@email.com"
              readOnly={busy}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0A66FF] focus:bg-white focus:ring-4 focus:ring-[#0A66FF]/10 disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-700">
              Kata sandi
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                readOnly={busy}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-[#0A66FF] focus:bg-white focus:ring-4 focus:ring-[#0A66FF]/10 disabled:opacity-60"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {strength && (
              <div className="mt-2">
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <p className={`mt-1 text-[10px] font-bold ${
                  strength.label === "Kuat" ? "text-emerald-600" :
                  strength.label === "Sedang" ? "text-amber-600" : "text-rose-500"
                }`}>
                  Kekuatan: {strength.label}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={busy || (password.length > 0 && password.length < 8)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            {isPending ? "Membuat akun…" : "Buat akun gratis"}
          </button>
        </form>
      </div>

      {/* Legal */}
      <p className="mt-6 max-w-xs text-center text-[11px] text-slate-400">
        Dengan mendaftar, kamu menyetujui{" "}
        <Link href="/syarat-layanan" className="underline hover:text-slate-600">Syarat Layanan</Link>
        {" "}dan{" "}
        <Link href="/kebijakan-privasi" className="underline hover:text-slate-600">Kebijakan Privasi</Link>.
      </p>
    </div>
  );
}

export default function DaftarPage() {
  return (
    <Suspense>
      <DaftarForm />
    </Suspense>
  );
}
