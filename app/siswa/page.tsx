import { StudentDashboard } from "@/components/student-dashboard";
import { getCurrentSession } from "@/lib/session";
import { getTransactionsForStudent } from "@/lib/student-transactions";

export default async function SiswaDashboardPage() {
  const session = await getCurrentSession();
  const transactions = await getTransactionsForStudent(session?.userId, session?.email);

  return <StudentDashboard session={session} transactions={transactions} />;
}
