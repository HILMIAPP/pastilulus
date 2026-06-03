import { notFound, redirect } from "next/navigation";
import { TryoutExam } from "@/components/tryout-exam";
import { tryoutPaket, tryoutUmptkinPaket, tryoutPastiLulusPaket } from "@/lib/app-data";
import { canAccessTier, getCurrentSession } from "@/lib/session";
import { checkPastiLulusAccessAction } from "@/lib/pasti-lulus-actions";

type Props = { params: Promise<{ paketId: string }> };

// Semua paket yang bisa diakses via URL ini (PTN + PTKIN + PASTI LULUS)
const allPaket = [...tryoutPaket, ...tryoutUmptkinPaket, ...tryoutPastiLulusPaket];

export async function generateStaticParams() {
  return allPaket.map((p) => ({ paketId: p.slug }));
}

export default async function TryoutPaketPage({ params }: Props) {
  const { paketId } = await params;
  const paket = allPaket.find((p) => p.slug === paketId);
  if (!paket) notFound();

  const session = await getCurrentSession();
  if (paket.requiresPastiLulusToken) {
    if (!session) redirect(`/masuk?next=/siswa/tryout/${paket.slug}`);
    const hasPastiLulusAccess = await checkPastiLulusAccessAction();
    if (!hasPastiLulusAccess) {
      redirect("/siswa/tryout?pasti-lulus=locked");
    }
    return <TryoutExam paket={paket} />;
  }

  if (!canAccessTier(session?.tier ?? "free", paket.akses)) {
    redirect("/harga");
  }

  return <TryoutExam paket={paket} />;
}
