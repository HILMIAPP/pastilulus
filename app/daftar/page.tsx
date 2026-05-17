"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Suspense } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck, Sparkles, Target, TrendingUp, UserPlus } from "lucide-react";
import { signUpAction, signInWithGoogleAction } from "@/lib/auth-actions";
import { BrandLogo } from "@/components/brand-logo";
import { site } from "@/lib/site-config";
import { useSearchParams } from "next/navigation";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

const benefits = [
  { icon: <Target size={18} />, text: "Tryout 1.240+ soal UM 12 PTN terkemuka" },
  { icon: <TrendingUp size={18} />, text: "Rasionalisasi nilai & analitik kelemahan" },
  { icon: <ShieldCheck size={18} />, text: "Jadwal personal + deadline tracker PTN" },
  { icon: <Sparkles size={18} />, text: "AI tutor siap bantu kapan saja" },
];

function passwordStrength(p: string) {
  if (!p) return null;
  if (p.length < 8) return { label: "Terlalu pendek", color: "bg-red-400", width: "w-1/4" };
  if (p.length < 10) return { label: "Lemah", color: "bg-orange-400", width: "w-2/4" };
  if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "Sedang", color: "bg-yellow-400", width: "w-3/4" };
  return { label: "Kuat", color: "bg-emerald-500", width: "w-full" };
}

function DaftarForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const strength = passwordStrength(password);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      await signUpAction(new FormData(form));
    });
  }

  function handleGoogle() {
    startGoogleTransition(async () => {
      await signInWithGoogleAction();
    });
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — brand (desktop only) ── */}
      <div className="hidden flex-col justify-between bg-[#0A66FF] p-10 text-white lg:flex lg:w-[45%]">
        <BrandLogo size="md" showText />

        <div className="space-y-6">
          <h2 className="text-3xl font-black leading-snug">
            Mulai perjalanan<br />menuju PTN impianmu.
          </h2>
          <p className="text-base font-semibold text-blue-100">
            Gratis. Tanpa kartu kredit. Siap dalam 1 menit.
          </p>

          <ul className="space-y-4">
            {benefits.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  {b.icon}
                </span>
                {b.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs font-semibold text-blue-200">© {new Date().getFullYear()} {site.fullName}</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        {/* Logo mobile */}
        <div className="mb-8 lg:hidden">
          <BrandLogo size="md" showText />
        </div>

        <div className="w-full max-w-md">
          <h1 className="text-2xl font-black text-slate-900">Buat akun gratis</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="font-black text-[#0A66FF] hover:underline">
              Masuk di sini
            </Link>
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Google — taruh di atas agar lebih terlihat */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isGooglePending || isPending}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-70"
          >
            {isGooglePending ? <Loader2 size={17} className="animate-spin" /> : <GoogleIcon />}
            {isGooglePending ? "Menghubungkan..." : "Daftar dengan Google"}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400">ATAU ISI FORM</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-black text-slate-700">
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
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#0A66FF] focus:ring-2 focus:ring-[#0A66FF]/20 disabled:opacity-60"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-black text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="kamu@email.com"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#0A66FF] focus:ring-2 focus:ring-[#0A66FF]/20 disabled:opacity-60"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black text-slate-700">
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#0A66FF] focus:ring-2 focus:ring-[#0A66FF]/20 disabled:opacity-60"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className={`mt-1 text-[10px] font-bold ${
                    strength.label === "Kuat" ? "text-emerald-600" :
                    strength.label === "Sedang" ? "text-yellow-600" : "text-red-500"
                  }`}>
                    Kekuatan: {strength.label}
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] font-semibold leading-relaxed text-slate-400">
              Dengan mendaftar, kamu menyetujui{" "}
              <Link href="/syarat-layanan" className="text-[#0A66FF] hover:underline">Syarat Layanan</Link>{" "}
              dan{" "}
              <Link href="/kebijakan-privasi" className="text-[#0A66FF] hover:underline">Kebijakan Privasi</Link>.
            </p>

            <button
              type="submit"
              disabled={isPending || (password.length > 0 && password.length < 8)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A66FF] py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#0052D6] disabled:opacity-70"
            >
              {isPending ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
              {isPending ? "Membuat akun..." : "Buat akun gratis"}
            </button>
          </form>
        </div>
      </div>
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
