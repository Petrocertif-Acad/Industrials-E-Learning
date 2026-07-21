import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { localizedName } from "@/lib/localized-name";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteExperienceButton } from "@/components/features/experience/delete-experience-button";
import { getDocumentVerificationLabels, DOCUMENT_VERIFICATION_TONE } from "@/lib/verification-labels";

function formatDate(date: Date, locale: string) {
  // Les dates de mission n'ont pas de composante horaire : elles sont stockées
  // à minuit UTC. Formater dans le fuseau du serveur ferait glisser
  // l'affichage d'un jour selon son décalage horaire (ex. UTC-5 en soirée).
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

interface TechnicianExperiencesPageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function TechnicianExperiencesPage({ searchParams }: TechnicianExperiencesPageProps) {
  const t = await getTranslations("TechnicianExperiencesPage");
  const tCommon = await getTranslations("Common");
  const locale = await getLocale();
  const DOCUMENT_VERIFICATION_LABELS = getDocumentVerificationLabels(locale);
  const { saved } = await searchParams;
  const session = await auth();

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      workExperiences: {
        include: { country: true },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!profile) {
    return <p className="text-slate-600">{tCommon("profileNotFound")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <Link href="/technician/experiences/new">
          <Button>{t("addExperience")}</Button>
        </Link>
      </div>

      {saved === "1" && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{t("savedNotice")}</p>
      )}

      {profile.workExperiences.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">{t("empty")}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {profile.workExperiences.map((experience) => (
            <Card key={experience.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium">{experience.projectName}</h2>
                  <p className="text-sm text-slate-600">
                    {experience.role} — {experience.employer}
                    {experience.client ? ` ${t("clientSuffix", { client: experience.client })}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {localizedName(experience.country, locale)}
                    {experience.sector ? ` · ${experience.sector}` : ""} ·{" "}
                    {formatDate(experience.startDate, locale)} —{" "}
                    {experience.endDate ? formatDate(experience.endDate, locale) : t("ongoing")}
                  </p>
                </div>
                <Badge tone={DOCUMENT_VERIFICATION_TONE[experience.verificationStatus]}>
                  {DOCUMENT_VERIFICATION_LABELS[experience.verificationStatus]}
                </Badge>
              </div>

              {experience.description && (
                <p className="mt-3 text-sm text-slate-700">{experience.description}</p>
              )}

              <div className="mt-4 flex items-center gap-4">
                <Link
                  href={`/technician/experiences/${experience.id}/edit`}
                  className="rounded text-sm text-slate-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                >
                  {t("edit")}
                </Link>
                <DeleteExperienceButton experienceId={experience.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
