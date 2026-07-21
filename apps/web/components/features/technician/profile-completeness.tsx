import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ChecklistItem } from "@/lib/technician";

interface ProfileCompletenessProps {
  items: ChecklistItem[];
  className?: string;
}

export function ProfileCompleteness({ items, className }: ProfileCompletenessProps) {
  const completedCount = items.filter((item) => item.done).length;

  return (
    <Card className={className ?? "border-slate-200 bg-slate-50"}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Complétude du profil</h2>
        <Badge tone={completedCount === items.length ? "success" : "neutral"}>
          {completedCount}/{items.length}
        </Badge>
      </div>
      <ul className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className={
                item.done
                  ? "flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white"
                  : "flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] text-transparent"
              }
            >
              ✓
            </span>
            <span className={item.done ? "text-slate-700" : "text-slate-500"}>{item.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
