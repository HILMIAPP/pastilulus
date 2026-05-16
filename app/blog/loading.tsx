export default function BlogLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <div className="h-4 w-32 rounded-full bg-slate-100" />
      <div className="mt-4 h-10 w-full max-w-xl rounded-2xl bg-slate-100" />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="aspect-[16/10] bg-slate-100" />
            <div className="space-y-3 p-6">
              <div className="h-5 rounded-full bg-slate-100" />
              <div className="h-4 rounded-full bg-slate-100" />
              <div className="h-4 w-2/3 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
