export default function TryoutLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-8 w-80 rounded-2xl bg-slate-100" />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-56 rounded-2xl border border-slate-200 bg-white shadow-sm" />
        ))}
      </div>
    </main>
  );
}
