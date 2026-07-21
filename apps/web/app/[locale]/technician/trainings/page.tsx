import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteTrainingButton } from "@/components/features/training/delete-training-button";
import { getDocumentVerificationLabels, DOCUMENT_VERIFICATION_TONE } from "@/lib/verification-labels";
import { getTradeCategoryLabels } from "@/lib/trade-categories";

function formatDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

interface TechnicianTrainingsPageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function TechnicianTrainingsPage({ searchParams }: TechnicianTrainingsPageProps) {
  const t = await getTranslations("TechnicianTrainingsPage");
  const tCommon = await getTranslations("Common");
  const locale = await getLocale();
  const DOCUMENT_VERIFICATION_LABELS = getDocumentVerificationLabels(locale);
  const TRADE_CATEGORY_LABELS = getTradeCategoryLabels(locale);
  const { saved } = await searchParams;
  const session = await auth();

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      trainings: {
        include: { document: true },
        orderBy: { completionDate: "desc" },
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
        <Link href="/technician/trainings/new">
          <Button>{t("addTraining")}</Button>
        </Link>
      </div>

      {saved === "1" && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{t("savedNotice")}</p>
      )}

      {profile.trainings.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">{t("empty")}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {profile.trainings.map((training) => (
            <Card key={training.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium">{training.title}</h2>
                  <p className="text-sm text-slate-600">{training.provider}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("completedOn", { date: formatDate(training.completionDate, locale) })}
                    {training.category ? ` · ${TRADE_CATEGORY_LABELS[training.category]}` : ""}
                    {training.hours ? ` · ${t("hoursSuffix", { hours: training.hours })}` : ""}
                  </p>
                </div>
                <Badge tone={DOCUMENT_VERIFICATION_TONE[training.verificationStatus]}>
                  {DOCUMENT_VERIFICATION_LABELS[training.verificationStatus]}
                </Badge>
              </div>

              {training.description && <p className="mt-3 text-sm text-slate-700">{training.description}</p>}

              <div className="mt-4 flex items-center gap-4">
                {training.document ? (
                  <a
                    href={`/api/documents/${training.document.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded text-sm text-slate-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                  >
                    {t("viewDocument")}
                  </a>
                ) : (
                  <span className="text-sm text-slate-400">{t("noDocument")}</span>
                )}
                <Link
                  href={`/technician/trainings/${training.id}/edit`}
                  className="rounded text-sm text-slate-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                >
                  {t("edit")}
                </Link>
                <DeleteTrainingButton trainingId={training.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
