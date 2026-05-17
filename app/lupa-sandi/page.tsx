"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Loader2, Mail, Send } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

export default function LupaSandiPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (err) setError(err.message);
      else setSent(true);
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <div className="mb-8">
        <BrandLogo size="md" showText />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <Mail size={28} className="text-emerald-600" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Cek email kamu</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Link reset kata sandi sudah dikirim ke <span className="font-black text-slate-800">{email}</span>.
              Cek folder Spam jika tidak muncul dalam 1-2 menit.
            </p>
            <Link
              href="/masuk"
              className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#0A66FF] hover:underline"
            >
              <ArrowLeft size={15} /> Kembali ke halaman masuk
            </Link>
          </div>
        ) : (
          <>
            <Link
              href="/masuk"
              className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={14} /> Kembali
            </Link>

            <h1 className="text-2xl font-black text-slate-900">Lupa kata sandi?</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Masukkan email akun kamu. Kami akan kirim link untuk membuat kata sandi baru.
            </p>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-black text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#0A66FF] focus:ring-2 focus:ring-[#0A66FF]/20 disabled:opacity-60"
                  disabled={isPending}
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !email}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A66FF] py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#0052D6] disabled:opacity-70"
              >
                {isPending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                {isPending ? "Mengirim..." : "Kirim link reset"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
