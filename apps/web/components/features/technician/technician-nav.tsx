"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/technician/dashboard", label: "Tableau de bord" },
  { href: "/technician/profile", label: "Mon profil" },
  { href: "/technician/skills", label: "Compétences" },
  { href: "/technician/experiences", label: "Expériences" },
  { href: "/technician/certifications", label: "Certifications" },
];

export function TechnicianNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation technicien"
      className="flex flex-nowrap gap-1 overflow-x-auto"
    >
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
