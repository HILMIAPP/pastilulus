import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ShinyText } from "@/components/shiny-text";
import { site } from "@/lib/site-config";

const footerGroups = [
  {
    title: "Produk",
    links: [
      { href: "/#fitur", label: "Fitur utama" },
      { href: "/katalog", label: "Katalog" },
      { href: "/siswa/tryout", label: "Try Out UM" },
      { href: "/harga", label: "Paket belajar" },
      { href: "/siswa", label: "Dashboard siswa" },
    ],
  },
  {
    title: "Belajar",
    links: [
      { href: "/info-ptn", label: "Info PTN" },
      { href: "/blog", label: "Blog & tips" },
      { href: "/siswa/onboarding", label: "Target kampus" },
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
    <footer className="border-t border-slate-200 bg-slate-50/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(260px,1fr)_minmax(520px,1.65fr)] lg:items-start">
          <div className="max-w-md">
            <BrandLogo size="sm" />
            <p className="mt-5 text-sm leading-7 text-slate-600">{site.tagline}</p>
            <p className="mt-4 text-sm font-bold">
              <ShinyText
                text={site.promise}
                color="#1E293B"
                shineColor="#0A66FF"
                speed={2.6}
                delay={1.2}
                spread={110}
                pauseOnHover
              />
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-8 text-sm sm:grid-cols-3 lg:justify-items-end">
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={group.title} className="flex min-w-32 flex-col gap-3">
                <span className="text-sm font-black text-slate-950">{group.title}</span>
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="w-fit text-slate-600 transition hover:text-[#0A66FF]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs leading-6 text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} {site.fullName}. Semua hak dilindungi.</p>
          <p>Kontak: {site.emailKontak}</p>
        </div>
      </div>
    </footer>
  );
}
