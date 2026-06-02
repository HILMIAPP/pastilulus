import { getCurrentSession } from "@/lib/session";
import { fetchAdminPortalData } from "@/lib/admin-portal-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();

  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await fetchAdminPortalData();
  return Response.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
