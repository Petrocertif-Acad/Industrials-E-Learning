import { getTranslations } from "next-intl/server";

// Squelette générique affiché pendant le chargement de n'importe quelle page
// de l'espace technicien (voir convention Next.js app/**/loading.tsx). Reste
// volontairement neutre puisqu'il couvre des pages de formes différentes
// (tableau de bord, listes, formulaires).
export default async function TechnicianLoading() {
  const t = await getTranslations("TechnicianLoading");

  return (
    <div className="space-y-6" role="status" aria-label={t("ariaLabel")}>
      <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
