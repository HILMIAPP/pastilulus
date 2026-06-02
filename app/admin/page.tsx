import AdminPortal from "@/components/admin-portal";
import type { PackageInfo } from "@/components/admin-portal";
import { fetchAdminPortalData } from "@/lib/admin-portal-data";
import { tryoutPaket, tryoutUmptkinPaket } from "@/lib/app-data";

export const metadata = {
  title: "Admin Portal",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const data = await fetchAdminPortalData();

  // Kirim metadata saja (tanpa soal) ke client component
  const staticPakets: PackageInfo[] = [...tryoutPaket, ...tryoutUmptkinPaket].map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    soalCount: p.soalCount,
    durasiMenit: p.durasiMenit,
    akses: p.akses,
    scoringType: p.scoringType,
    source: "static" as const,
  }));

  return <AdminPortal initialData={data} staticPakets={staticPakets} />;
}
