import { redirect } from "next/navigation";
import { StudentShell } from "@/components/student-shell";
import { getCurrentSession } from "@/lib/session";

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/masuk");
  }

  return <StudentShell session={session}>{children}</StudentShell>;
}

