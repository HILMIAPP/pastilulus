import { signOutAction } from "@/lib/auth-actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <form action={signOutAction} className="fixed bottom-4 right-4 z-[60]">
        <button
          type="submit"
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-slate-800"
        >
          Keluar admin
        </button>
      </form>
      {children}
    </div>
  );
}

