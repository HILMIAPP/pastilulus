"use client";

export default function AppError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-[#0A66FF]">Terjadi kendala</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Halaman belum bisa dimuat.</h1>
        <p className="mt-3 leading-relaxed text-slate-600">
          Koneksi atau data sedang bermasalah. Coba muat ulang halaman ini.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-[#0A66FF] px-5 py-3 text-sm font-black text-white hover:bg-[#0052D6]"
        >
          Coba lagi
        </button>
      </section>
    </main>
  );
}
