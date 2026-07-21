import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface ScoreMeterProps {
  score: number | null;
  calculatedAt: Date | null;
}

type ScoreTone = "success" | "warning" | "danger";

function getScoreTone(score: number): ScoreTone {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "danger";
}

// Le remplissage porte la sévérité ; la piste (non remplie) est un ton plus
// clair de la même rampe, pour que l'état se lise sur toute la largeur.
const FILL_CLASSES: Record<ScoreTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

const TRACK_CLASSES: Record<ScoreTone, string> = {
  success: "bg-emerald-100",
  warning: "bg-amber-100",
  danger: "bg-red-100",
};

export function ScoreMeter({ score, calculatedAt }: ScoreMeterProps) {
  const hasScore = score !== null;
  const tone = hasScore ? getScoreTone(score) : null;
  const clampedScore = hasScore ? Math.min(100, Math.max(0, score)) : 0;

  return (
    <Card>
      <h2 className="text-sm font-medium text-slate-500">Score global</h2>
      <div className="mt-2 flex items-end gap-2">
        <p className="text-4xl font-semibold text-slate-900">{hasScore ? score : "—"}</p>
        <p className="pb-1 text-sm text-slate-500">/ 100</p>
      </div>

      {/* Piste neutre (sans remplissage) quand le score n'est pas encore
          calculé : un score à 0 rempli en gris se lirait à tort comme "mauvais
          score" plutôt que "pas encore mesuré". */}
      <div
        role="img"
        aria-label={hasScore ? `Score global : ${score} sur 100` : "Score global non calculé"}
        className={cn(
          "mt-3 h-2.5 w-full overflow-hidden rounded-full",
          hasScore ? TRACK_CLASSES[tone!] : "bg-slate-100"
        )}
      >
        {hasScore && (
          <div
            className={cn("h-full rounded-full", FILL_CLASSES[tone!])}
            style={{ width: `${clampedScore}%` }}
          />
        )}
      </div>

      <p className="mt-3 text-sm text-slate-600">
        {hasScore && calculatedAt
          ? `Dernier calcul : ${calculatedAt.toLocaleDateString("fr-FR")}`
          : "Le score sera calculé une fois votre profil et vos certifications complétés."}
      </p>
    </Card>
  );
}
