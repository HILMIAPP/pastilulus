export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="h-8 w-64 rounded-2xl bg-slate-200" />
      <div className="mt-8 grid gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 rounded-2xl border border-slate-200 bg-white shadow-sm" />
        ))}
      </div>
      <div className="mt-6 h-72 rounded-2xl border border-slate-200 bg-white shadow-sm" />
    </main>
  );
}
