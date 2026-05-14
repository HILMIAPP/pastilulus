import { StudentDashboard } from "@/components/student-dashboard";
import { getCurrentSession } from "@/lib/session";

export default async function SiswaDashboardPage() {
  const session = await getCurrentSession();

  return <StudentDashboard session={session} />;
}

