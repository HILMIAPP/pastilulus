import { notFound, redirect } from "next/navigation";
import { TryoutExam } from "@/components/tryout-exam";
import { tryoutPaket, tryoutUmptkinPaket } from "@/lib/app-data";
import { canAccessTier, getCurrentSession } from "@/lib/session";

type Props = { params: Promise<{ paketId: string }> };

// Semua paket yang bisa diakses via URL ini (PTN + PTKIN)
const allPaket = [...tryoutPaket, ...tryoutUmptkinPaket];

export async function generateStaticParams() {
  return allPaket.map((p) => ({ paketId: p.slug }));
}

export default async function TryoutPaketPage({ params }: Props) {
  const { paketId } = await params;
  const paket = allPaket.find((p) => p.slug === paketId);
  if (!paket) notFound();

  const session = await getCurrentSession();
  if (!canAccessTier(session?.tier ?? "free", paket.akses)) {
    redirect("/harga");
  }

  return <TryoutExam paket={paket} />;
}
