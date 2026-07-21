import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/permissions";
import { UserRole } from "@/lib/generated/prisma/enums";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Tableau de bord" },
  { href: "/admin/verifications", label: "Vérifications" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(UserRole.ADMIN);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <nav className="mb-8 flex gap-1 border-b border-slate-200">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-t-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
