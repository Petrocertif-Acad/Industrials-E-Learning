"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export function TechnicianNav() {
  const t = useTranslations("TechnicianNav");
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: "/technician/dashboard", label: t("dashboard") },
    { href: "/technician/profile", label: t("profile") },
    { href: "/technician/skills", label: t("skills") },
    { href: "/technician/experiences", label: t("experiences") },
    { href: "/technician/certifications", label: t("certifications") },
  ];

  return (
    <nav aria-label={t("ariaLabel")} className="flex flex-nowrap gap-1 overflow-x-auto">
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
