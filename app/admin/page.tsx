import AdminPortal from "@/components/admin-portal";
import { fetchAdminPortalData } from "@/lib/admin-portal-data";

export const metadata = {
  title: "Admin Portal",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const data = await fetchAdminPortalData();

  return <AdminPortal initialData={data} />;
}
