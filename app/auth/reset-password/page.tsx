"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, Suspense } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setTimeout(() => {
        setInitError("Link reset tidak valid atau sudah kedaluwarsa. Minta link baru dari halaman lupa kata sandi.");
      }, 0);
      return;
    }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setInitError("Link sudah tidak berlaku. Silakan minta link reset baru.");
      } else {
        setReady(true);
      }
    });
  }, [searchParams]);

  function getStrength(pw: string) {
    if (pw.length === 0) return 0;
    if (pw.length < 8) return 1;
    const checks = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
    const passed = checks.filter((r) => r.test(pw)).length;
    return 1 + passed;
  }

  const strength = getStrength(password);
  const strengthLabel = ["", "Terlalu pendek", "Lemah", "Sedang", "Kuat"][strength];
  const strengthColor = ["", "bg-rose-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"][strength];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (password.length < 8) {
      setFormError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setFormError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setFormError(error.message);
        return;
      }
      await supabase.auth.signOut();
      setSuccess(true);
      setTimeout(() => router.push("/masuk?message=Kata+sandi+berhasil+diubah.+Silakan+masuk+kembali."), 2000);
    });
  }

  if (initError) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
          <KeyRound size={28} className="text-rose-600" />
        </div>
        <h1 className="text-xl font-black text-slate-900">Link Tidak Valid</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">{initError}</p>
        <Link
          href="/lupa-sandi"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0A66FF] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 hover:bg-[#0052D6]"
        >
          Minta link baru
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <ShieldCheck size={28} className="text-emerald-600" />
        </div>
        <h1 className="text-xl font-black text-slate-900">Kata sandi berhasil diubah!</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Mengalihkan ke halaman masuk...
        </p>
        <Loader2 size={20} className="mx-auto mt-4 animate-spin text-[#0A66FF]" />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <Loader2 size={32} className="animate-spin text-[#0A66FF]" />
        <p className="text-sm font-semibold text-slate-500">Memverifikasi link...</p>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/masuk"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} /> Kembali ke halaman masuk
      </Link>

      <h1 className="text-2xl font-black text-slate-900">Buat kata sandi baru</h1>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Pilih kata sandi yang kuat dan belum pernah kamu pakai sebelumnya.
      </p>

      {formError && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          ⚠️ {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-black text-slate-700">
            Kata sandi baru
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#0A66FF] focus:ring-2 focus:ring-[#0A66FF]/20 disabled:opacity-60"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {/* Strength bar */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i <= strength ? strengthColor : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className={`mt-1 text-xs font-bold ${["", "text-rose-500", "text-orange-400", "text-yellow-500", "text-emerald-600"][strength]}`}>
                {strengthLabel}
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirm" className="block text-xs font-black text-slate-700">
            Konfirmasi kata sandi
          </label>
          <div className="relative mt-1.5">
            <input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#0A66FF] focus:ring-2 focus:ring-[#0A66FF]/20 disabled:opacity-60"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {confirm.length > 0 && password !== confirm && (
            <p className="mt-1 text-xs font-bold text-rose-500">Kata sandi tidak cocok</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || password.length < 8 || password !== confirm}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A66FF] py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#0052D6] disabled:opacity-70"
        >
          {isPending ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
          {isPending ? "Menyimpan..." : "Simpan kata sandi baru"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <div className="mb-8">
        <BrandLogo size="md" showText />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 size={32} className="animate-spin text-[#0A66FF]" />
              <p className="text-sm font-semibold text-slate-500">Memuat...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
