"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/organization/dashboard", label: "Tableau de bord" },
  { href: "/organization/search", label: "Rechercher des techniciens" },
  { href: "/organization/talent-pool", label: "Vivier" },
  { href: "/organization/profile", label: "Profil entreprise" },
];

export function OrganizationNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation entreprise" className="flex flex-nowrap gap-1 overflow-x-auto">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-amber-600 text-slate-900"
                : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
