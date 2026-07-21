import Link from "next/link";
import { requireRole } from "@/lib/permissions";
import { UserRole } from "@/lib/generated/prisma/enums";
import { Logo } from "@/components/ui/logo";
import { TechnicianNav } from "@/components/features/technician/technician-nav";

export default async function TechnicianLayout({ children }: { children: React.ReactNode }) {
  await requireRole(UserRole.TECHNICIAN);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="ATTI — Accueil">
            <Logo />
          </Link>
          <TechnicianNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
