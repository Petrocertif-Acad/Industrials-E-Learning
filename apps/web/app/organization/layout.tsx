import Link from "next/link";
import { requireRole } from "@/lib/permissions";
import { UserRole } from "@/lib/generated/prisma/enums";
import { Logo } from "@/components/ui/logo";
import { OrganizationNav } from "@/components/features/organization/organization-nav";

export default async function OrganizationLayout({ children }: { children: React.ReactNode }) {
  await requireRole(UserRole.ORGANIZATION);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/" aria-label="ATTI — Accueil" className="shrink-0">
            <Logo />
          </Link>
          <div className="min-w-0 flex-1">
            <OrganizationNav />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
