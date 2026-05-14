import { notFound, redirect } from "next/navigation";
import { TryoutExam } from "@/components/tryout-exam";
import { tryoutPaket } from "@/lib/app-data";
import { canAccessTier, getCurrentSession } from "@/lib/session";

type Props = { params: Promise<{ paketId: string }> };

export async function generateStaticParams() {
  return tryoutPaket.map((p) => ({ paketId: p.slug }));
}

export default async function TryoutPaketPage({ params }: Props) {
  const { paketId } = await params;
  const paket = tryoutPaket.find((p) => p.slug === paketId);
  if (!paket) notFound();

  const session = await getCurrentSession();
  if (!canAccessTier(session?.tier ?? "free", paket.akses)) {
    redirect("/harga");
  }

  return <TryoutExam paket={paket} />;
}
