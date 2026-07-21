import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface DashboardStatCardProps {
  href: string;
  label: string;
  value: ReactNode;
  description: string;
  badge?: ReactNode;
}

export function DashboardStatCard({ href, label, value, description, badge }: DashboardStatCardProps) {
  return (
    <Link
      href={href}
      className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
    >
      <Card className="h-full transition-colors hover:border-slate-400">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-slate-500">{label}</h2>
          {badge}
        </div>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </Card>
    </Link>
  );
}
