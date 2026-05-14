import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    default: `${site.fullName} - Persiapan Ujian Mandiri PTN`,
    template: `%s - ${site.fullName}`,
  },
  description: site.tagline,
  keywords: [
    "ujian mandiri",
    "SIMAK UI",
    "SM ITB",
    "UTUL UGM",
    "SMUP UNPAD",
    "try out PTN",
    "lolos ujian mandiri",
  ],
  openGraph: {
    title: site.fullName,
    description: site.tagline,
    locale: "id_ID",
    type: "website",
    url: site.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full scroll-smooth antialiased">
      <body className="min-h-full bg-white text-slate-900">{children}</body>
    </html>
  );
}

