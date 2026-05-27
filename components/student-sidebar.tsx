"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { signOutAction } from "@/lib/auth-actions";
import type { AppSession } from "@/lib/session-codec";
import { isStudentNavActive, studentAccountNavItems, studentNavItems } from "@/components/student-nav-data";

export function StudentSidebar({ session }: { session: AppSession | null }) {
  const pathname = usePathname();
  const initial = session?.name?.charAt(0).toUpperCase() ?? "S";
  const tier = session?.tier ?? "free";
  const isPro = tier !== "free";

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-100 bg-white md:sticky md:top-0 md:flex">
      {/* Brand */}
      <div className="px-5 pb-4 pt-5">
        <Link href="/" aria-label="Kembali ke beranda">
          <BrandLogo size="md" />
        </Link>
      </div>

      {/* User profile */}
      <div className="mx-3 mb-2 rounded-xl bg-slate-50 px-3 py-3">
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #0A66FF 0%, #0D4FCC 100%)" }}
          >
            {initial}
            {isPro && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white">
                <Sparkles size={9} className="text-amber-900" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight text-slate-900">
              {session?.name ?? "Siswa"}
            </p>
            <span
              className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                isPro
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {isPro ? "✦ Pro" : "Gratis"}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        <div className="space-y-0.5 py-1">
          {studentNavItems.map((item) => (
            <SidebarLink key={item.label} item={item} pathname={pathname} />
          ))}
        </div>

        <div className="mt-4 space-y-0.5 border-t border-slate-100 pt-4">
          <p className="mb-1 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Akun
          </p>
          {studentAccountNavItems.map((item) => (
            <SidebarLink key={item.label} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>

      {/* XP bar */}
      <div className="mx-3 mb-3 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100">
              <Sparkles size={11} className="text-blue-600" />
            </div>
            <span className="text-xs font-bold text-slate-700">Level 1</span>
          </div>
          <span className="text-xs font-black text-blue-600">0 XP</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-blue-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
            style={{ width: "0%" }}
          />
        </div>
        <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
          Kerjakan tryout untuk naik level
        </p>
      </div>

      {/* Upgrade CTA (free only) */}
      {!isPro && (
        <div className="mx-3 mb-3">
          <Link
            href="/harga"
            className="group flex w-full items-center justify-between rounded-xl bg-slate-950 px-3.5 py-2.5 text-left transition hover:bg-slate-800"
          >
            <div>
              <p className="text-xs font-black text-white">Upgrade ke Pro</p>
              <p className="text-[10px] text-slate-400">Akses semua paket & materi</p>
            </div>
            <ChevronRight size={14} className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-white" />
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="border-t border-slate-100 px-3 py-3">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <LogOut size={15} />
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
      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-600" />
      )}
      <Icon
        size={17}
        className={`transition ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
      />
      <span>{item.label}</span>
    </Link>
  );
}
