import { redirectLocalized } from "@/lib/redirect";
import { requireUser } from "@/lib/permissions";

const DASHBOARD_BY_ROLE: Record<string, string> = {
  TECHNICIAN: "/technician/dashboard",
  ORGANIZATION: "/organization/dashboard",
  ADMIN: "/admin/dashboard",
};

export default async function DashboardRouter() {
  const user = await requireUser();
  return redirectLocalized(DASHBOARD_BY_ROLE[user.role] ?? "/");
}
