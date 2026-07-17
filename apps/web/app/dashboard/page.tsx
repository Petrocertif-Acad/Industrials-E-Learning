import { redirect } from "next/navigation";
import { requireUser } from "@/lib/permissions";

const DASHBOARD_BY_ROLE: Record<string, string> = {
  TECHNICIAN: "/technician/dashboard",
  ORGANIZATION: "/organization/dashboard",
  ADMIN: "/admin/dashboard",
};

export default async function DashboardRouter() {
  const user = await requireUser();
  redirect(DASHBOARD_BY_ROLE[user.role] ?? "/");
}
