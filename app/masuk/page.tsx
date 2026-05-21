"use client";

import Link from "next/link";
import { useState, useTransition, Suspense } from "react";
import { Eye, EyeOff, Loader2, LogIn, Star, Target, TrendingUp, ShieldCheck } from "lucide-react";
import { signInAction, signInWithGoogleAction } from "@/lib/auth-actions";
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

const stats = [
  { icon: <Target size={16} />, value: "1.250+", label: "Soal latihan" },
  { icon: <TrendingUp size={16} />, value: "12", label: "PTN didukung" },
  { icon: <ShieldCheck size={16} />, value: "24/7", label: "AI Tutor aktif" },
];

const testimonial = {
  text: "Skor SIMAK UI saya naik 90 poin dalam 3 minggu pakai Pastilulus. Pembahasan AI-nya sangat membantu!",
  name: "Farhan A.",
  school: "SMAN 5 Jakarta",
};

function MasukForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const [showPass, setShowPass] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      await signInAction(new FormData(form));
    });
  }

  function handleGoogle() {
    startGoogleTransition(async () => {
      await signInWithGoogleAction();
    });
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — brand ── */}
      <div className="relative hidden flex-col overflow-hidden bg-[#0D1B2A] lg:flex lg:w-[44%]">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#0A66FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-10 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#0A66FF]/10 blur-2xl" />

        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        <div className="relative flex flex-1 flex-col justify-between p-10">
          {/* top — logo */}
          <BrandLogo size="md" showText />

          {/* middle — headline + stats */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-400">
                Platform persiapan ujian mandiri PTN
              </p>
              <h2 className="mt-3 text-3xl font-black leading-snug text-white">
                Belajar terarah,<br />lolos lebih pasti.
              </h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-400">
                {site.tagline}
              </p>
            </div>

            {/* stats */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-blue-400">{s.icon}</div>
                  <p className="mt-2 text-xl font-black text-white">{s.value}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* testimonial */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" />
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A66FF] text-xs font-black text-white">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="text-xs font-black text-white">{testimonial.name}</p>
                  <p className="text-[11px] text-slate-400">{testimonial.school}</p>
                </div>
              </div>
            </div>
          </div>

          {/* bottom — copyright */}
          <p className="text-xs font-semibold text-slate-500">
            © {new Date().getFullYear()} {site.fullName}
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        {/* Logo mobile only */}
        <div className="mb-8 lg:hidden">
          <BrandLogo size="md" showText />
        </div>

        <div className="w-full max-w-md">
          {/* header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900">Masuk ke akunmu</h1>
            <p className="mt-1.5 text-sm font-semibold text-slate-500">
              Belum punya akun?{" "}
              <Link href="/daftar" className="font-black text-[#0A66FF] hover:underline">
                Daftar gratis
              </Link>
            </p>
          </div>

          {/* alerts */}
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <span className="mt-0.5 shrink-0">✅</span>
              <span>{message}</span>
            </div>
          )}

          {/* Google button — above form */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isGooglePending || isPending}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow disabled:opacity-70"
          >
            {isGooglePending ? <Loader2 size={17} className="animate-spin" /> : <GoogleIcon />}
            {isGooglePending ? "Menghubungkan..." : "Lanjutkan dengan Google"}
          </button>

          {/* divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400">atau masuk dengan email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-black text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="kamu@email.com"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#0A66FF] focus:ring-2 focus:ring-[#0A66FF]/20 disabled:opacity-60"
                disabled={isPending}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-black text-slate-700">
                  Kata sandi
                </label>
                <Link href="/lupa-sandi" className="text-xs font-bold text-[#0A66FF] hover:underline">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  placeholder="Minimal 8 karakter"
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
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A66FF] py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#0052D6] disabled:opacity-70"
            >
              {isPending ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
              {isPending ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Dengan masuk, kamu menyetujui{" "}
            <Link href="/syarat-layanan" className="underline hover:text-slate-600">Syarat Layanan</Link>
            {" "}dan{" "}
            <Link href="/kebijakan-privasi" className="underline hover:text-slate-600">Kebijakan Privasi</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense>
      <MasukForm />
    </Suspense>
  );
}
