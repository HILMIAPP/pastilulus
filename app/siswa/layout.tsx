import { StudentShell } from "@/components/student-shell";
import { getCurrentSession } from "@/lib/session";

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  return <StudentShell session={session}>{children}</StudentShell>;
}

