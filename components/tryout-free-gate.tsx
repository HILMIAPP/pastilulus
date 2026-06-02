"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Phone,
  PlayCircle,
  School,
  Upload,
  X,
} from "lucide-react";

const REG_KEY = "lolosujian_tryout_reg_v1";

function getStoredRegistration(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Replaces the "Mulai simulasi" link for free tryout packages. */
export function TryoutFreeGateButton({
  href,
  userName,
}: {
  href: string;
  userName?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Delay hydration check to avoid SSR mismatch
  useEffect(() => setReady(true), []);

  const handleClick = () => {
    if (!ready) return;
    if (getStoredRegistration()) {
      router.push(href);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 min-[420px]:flex-none transition"
      >
        <PlayCircle size={17} /> Mulai simulasi
      </button>

      {open && (
        <TryoutRegistrationModal
          href={href}
          userName={userName ?? ""}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/* ── Modal ─────────────────────────────────────────────────────────────── */

type FormState = {
  nama: string;
  whatsapp: string;
  sekolah: string;
  kelas: string;
  jurusan: string;
};

function TryoutRegistrationModal({
  href,
  userName,
  onClose,
}: {
  href: string;
  userName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    nama: userName,
    whatsapp: "",
    sekolah: "",
    kelas: "Kelas 12",
    jurusan: "IPA",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [apiError, setApiError] = useState("");

  const update = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid =
    form.nama.trim().length > 0 &&
    form.whatsapp.replace(/\D/g, "").length >= 9 &&
    form.sekolah.trim().length > 0 &&
    file !== null;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid || isPending) return;

    setIsPending(true);
    setApiError("");

    try {
      const fd = new FormData();
      (Object.entries(form) as [string, string][]).forEach(([k, v]) =>
        fd.append(k, v),
      );
      if (file) fd.append("kartu", file);

      // Fire-and-forget — user proceeds even if API call fails
      fetch("/api/tryout/register", { method: "POST", body: fd }).catch(
        () => {},
      );

      localStorage.setItem(
        REG_KEY,
        JSON.stringify({ ...form, registeredAt: new Date().toISOString() }),
      );

      router.push(href);
    } catch {
      setApiError("Terjadi kesalahan, silakan coba lagi.");
      setIsPending(false);
    }
  };

  const handleBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-slate-100 px-6 pt-5 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Pendaftaran Tryout Gratis
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Lengkapi data diri untuk mengakses simulasi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {apiError}
            </div>
          )}

          {/* Nama */}
          <Field label="Nama Lengkap" required>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => update("nama", e.target.value)}
              placeholder="Nama kamu"
              required
              className={inputCls}
            />
          </Field>

          {/* WhatsApp */}
          <Field
            label={
              <span className="flex items-center gap-1">
                <Phone size={11} />
                Nomor WhatsApp
              </span>
            }
            required
          >
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) =>
                update("whatsapp", e.target.value.replace(/[^\d+\-\s]/g, ""))
              }
              placeholder="08xxxxxxxxxx"
              required
              className={inputCls}
            />
          </Field>

          {/* Asal Sekolah */}
          <Field
            label={
              <span className="flex items-center gap-1">
                <School size={11} />
                Asal Sekolah
              </span>
            }
            required
          >
            <input
              type="text"
              value={form.sekolah}
              onChange={(e) => update("sekolah", e.target.value)}
              placeholder="Nama SMA / MA / SMK"
              required
              className={inputCls}
            />
          </Field>

          {/* Kelas + Jurusan */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kelas">
              <select
                value={form.kelas}
                onChange={(e) => update("kelas", e.target.value)}
                className={selectCls}
              >
                {["Kelas 10", "Kelas 11", "Kelas 12", "Gap Year", "Mahasiswa"].map(
                  (o) => <option key={o}>{o}</option>,
                )}
              </select>
            </Field>
            <Field label="Jurusan">
              <select
                value={form.jurusan}
                onChange={(e) => update("jurusan", e.target.value)}
                className={selectCls}
              >
                {["IPA", "IPS", "Bahasa", "SMK", "Lainnya"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Syarat: Follow + Komentar */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3.5 space-y-2">
            <p className="text-xs font-black uppercase tracking-wide text-blue-700 mb-1">
              Syarat akses tryout gratis
            </p>
            <div className="flex items-start gap-2 text-sm text-blue-900">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">1</span>
              <span>
                <span className="font-bold">Follow</span> akun sosial media{" "}
                <span className="font-black">@pastilulus</span> (Instagram / TikTok)
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-blue-900">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">2</span>
              <span>
                <span className="font-bold">Komen</span> di postingan tryout gratis{" "}
                <span className="font-black">@pastilulus</span> dengan{" "}
                <span className="italic">"Mau tryout gratis!"</span> lalu tag 2 teman
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-blue-900">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">3</span>
              <span>
                <span className="font-bold">Screenshot</span> bukti follow &amp; komentar, lalu upload di bawah
              </span>
            </div>
          </div>

          {/* Upload Screenshot Bukti */}
          <div>
            <p className="mb-2 flex items-center gap-1 text-xs font-black uppercase tracking-wide text-slate-500">
              <ImagePlus size={11} />
              Screenshot Bukti Follow &amp; Komentar
              <span className="text-rose-500">*</span>
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-sm font-semibold transition ${
                file
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              {file ? (
                <>
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                  <span className="max-w-[220px] truncate">{file.name}</span>
                </>
              ) : (
                <>
                  <Upload size={15} />
                  Pilih foto screenshot
                </>
              )}
            </button>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Format: JPG atau PNG. Pastikan nama akun &amp; komentar terlihat jelas.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Menyimpan…
              </>
            ) : (
              <>
                Mulai Tryout <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-400">
            Data kamu hanya digunakan untuk keperluan verifikasi peserta.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ── Reusable field wrapper ─────────────────────────────────────────────── */

function Field({
  label,
  required,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1 text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </p>
      {children}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

const selectCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";
