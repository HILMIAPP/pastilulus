"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { signOutAction } from "@/lib/auth-actions";
import type { AppSession } from "@/lib/session-codec";
import { isStudentNavActive, studentAccountNavItems, studentNavItems } from "@/components/student-nav-data";

export function StudentSidebar({ session }: { session: AppSession | null }) {
  const pathname = usePathname();
  const initial = session?.name?.charAt(0).toUpperCase() ?? "S";

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:sticky md:top-0 md:flex">
      <div className="p-5">
        <Link href="/" aria-label="Kembali ke beranda">
          <BrandLogo size="md" />
        </Link>

        <div className="mt-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="w-36 truncate text-sm font-bold leading-tight text-slate-900">{session?.name ?? "Siswa"}</p>
            <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
              Paket {session?.tier ?? "free"}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        <div className="space-y-1">
          {studentNavItems.map((item) => (
            <SidebarLink key={item.label} item={item} pathname={pathname} />
          ))}
        </div>

        <div className="space-y-1 border-t border-slate-100 pt-4">
          <p className="px-4 text-[10px] font-black uppercase tracking-wide text-slate-400">Akun</p>
          {studentAccountNavItems.map((item) => (
            <SidebarLink key={item.label} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>

      <div className="mx-4 mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">Level 1</span>
          <span className="text-xs font-bold text-[#0A66FF]">0 XP</span>
        </div>
        <div className="h-1.5 rounded-full bg-blue-100">
          <div className="h-1.5 w-0 rounded-full bg-[#0A66FF]" />
        </div>
      </div>

      <div className="border-t border-slate-100 p-4">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}

function SidebarLink({
  item,
  pathname,
}: {
  item: (typeof studentNavItems)[number] | (typeof studentAccountNavItems)[number];
  pathname: string;
}) {
  const active = isStudentNavActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
        active ? "bg-[#E6F0FF] text-[#0D1B2A]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon size={18} className={active ? "text-[#0A66FF]" : "text-slate-400"} />
      {item.label}
    </Link>
  );
}
