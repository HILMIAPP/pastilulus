import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { site } from "@/lib/site-config";

const nav = [
  { href: "/harga", label: "Harga" },
  { href: "/siswa/tryout", label: "Try Out UM" },
  { href: "/info-ptn", label: "Info PTN" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label={`${site.fullName} beranda`}>
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/masuk"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="rounded-xl bg-[#0A66FF] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0052D6]"
          >
            Mulai gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
