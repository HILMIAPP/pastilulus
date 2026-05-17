import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    redirect("/masuk");
  }

  return children;
}
