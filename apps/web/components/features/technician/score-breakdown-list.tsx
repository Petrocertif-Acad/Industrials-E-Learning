import { cn } from "@/lib/utils/cn";
import type { ScoreBreakdownItem } from "@/lib/score";

interface ScoreBreakdownListProps {
  breakdown: ScoreBreakdownItem[];
}

export function ScoreBreakdownList({ breakdown }: ScoreBreakdownListProps) {
  return (
    <ul className="space-y-3">
      {breakdown.map((item) => {
        const ratio = item.max > 0 ? Math.min(1, item.points / item.max) : 0;
        const isUnavailable = item.explanation.startsWith("Fonctionnalité non disponible");
        return (
          <li key={item.key}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm text-slate-800">{item.label}</p>
              <p className="shrink-0 text-xs text-slate-500">
                {item.points} / {item.max} pts
              </p>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full", isUnavailable ? "bg-slate-200" : "bg-slate-700")}
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">{item.explanation}</p>
          </li>
        );
      })}
    </ul>
  );
}
