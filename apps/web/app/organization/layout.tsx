import { requireRole } from "@/lib/permissions";
import { UserRole } from "@/lib/generated/prisma/enums";

export default async function OrganizationLayout({ children }: { children: React.ReactNode }) {
  await requireRole(UserRole.ORGANIZATION);

  return <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</div>;
}
