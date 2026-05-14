import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { site } from "@/lib/site-config";

const footerGroups = [
  {
    title: "Produk",
    links: [
      { href: "/#fitur", label: "Fitur utama" },
      { href: "/katalog", label: "Katalog produk" },
      { href: "/siswa/tryout", label: "Try Out UM" },
      { href: "/harga", label: "Paket langganan" },
      { href: "/siswa", label: "Dashboard siswa" },
    ],
  },
  {
    title: "Belajar",
    links: [
      { href: "/info-ptn", label: "Info PTN" },
      { href: "/blog", label: "Blog & tips" },
      { href: "/siswa/onboarding", label: "Target kampus" },
      { href: "/admin", label: "Admin" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { href: "/kontak", label: "Kontak" },
      { href: "/kebijakan-privasi", label: "Kebijakan privasi" },
      { href: "/kebijakan-pembayaran", label: "Kebijakan pembayaran" },
      { href: "/syarat-layanan", label: "Syarat layanan" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <BrandLogo size="sm" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">{site.tagline}</p>
            <p className="mt-4 text-sm font-semibold text-slate-700">{site.promise}</p>
          </div>

          <div className="grid gap-8 text-sm sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                <span className="mb-1 font-black text-slate-950">{group.title}</span>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-slate-600 hover:text-[#0A66FF]">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.fullName}. Semua hak dilindungi.</p>
          <p>Kontak: {site.emailKontak}</p>
        </div>
      </div>
    </footer>
  );
}
