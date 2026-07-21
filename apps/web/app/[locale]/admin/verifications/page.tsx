import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { localizedName } from "@/lib/localized-name";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  verifyTechnicianCertificationAction,
  rejectTechnicianCertificationAction,
  verifyWorkExperienceAction,
  rejectWorkExperienceAction,
  verifyTechnicianTrainingAction,
  rejectTechnicianTrainingAction,
} from "@/lib/actions/verification";

async function ReviewForm({
  verifyAction,
  rejectAction,
  id,
}: {
  verifyAction: (formData: FormData) => Promise<void>;
  rejectAction: (formData: FormData) => Promise<void>;
  id: string;
}) {
  const t = await getTranslations("ReviewForm");

  return (
    <form action={verifyAction} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="id" value={id} />
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor={`note-${id}`}>
          {t("noteLabel")}
        </label>
        <input
          id={`note-${id}`}
          name="note"
          type="text"
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          {t("approve")}
        </button>
        <button
          type="submit"
          formAction={rejectAction}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          {t("reject")}
        </button>
      </div>
    </form>
  );
}

function formatDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function AdminVerificationsPage() {
  const t = await getTranslations("AdminVerificationsPage");
  const locale = await getLocale();

  const STATUS_LABELS: Record<string, string> = {
    DECLARED: t("statusDeclared"),
    UNDER_REVIEW: t("statusUnderReview"),
  };

  const [pendingCertifications, pendingExperiences, pendingTrainings] = await Promise.all([
    prisma.technicianCertification.findMany({
      where: { verificationStatus: { in: ["DECLARED", "UNDER_REVIEW"] } },
      include: { technician: true, certification: true, document: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.workExperience.findMany({
      where: { verificationStatus: { in: ["DECLARED", "UNDER_REVIEW"] } },
      include: { technician: true, document: true, country: true },
      orderBy: { startDate: "desc" },
    }),
    prisma.technicianTraining.findMany({
      where: { verificationStatus: { in: ["DECLARED", "UNDER_REVIEW"] } },
      include: { technician: true, document: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">{t("certificationsHeading", { count: pendingCertifications.length })}</h2>
        {pendingCertifications.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">{t("noCertifications")}</p>
          </Card>
        ) : (
          pendingCertifications.map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">
                    {entry.certification.standardRef
                      ? `${entry.certification.standardRef} — ${entry.certification.name}`
                      : entry.certification.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {entry.technician.firstName} {entry.technician.lastName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {entry.document ? (
                      <a
                        href={`/api/documents/${entry.document.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-700 hover:underline"
                      >
                        {t("viewDocument")}
                      </a>
                    ) : (
                      t("noDocument")
                    )}
                  </p>
                </div>
                <Badge tone="warning">{STATUS_LABELS[entry.verificationStatus]}</Badge>
              </div>
              <ReviewForm
                verifyAction={verifyTechnicianCertificationAction}
                rejectAction={rejectTechnicianCertificationAction}
                id={entry.id}
              />
            </Card>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">{t("experiencesHeading", { count: pendingExperiences.length })}</h2>
        {pendingExperiences.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">{t("noExperiences")}</p>
          </Card>
        ) : (
          pendingExperiences.map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{entry.projectName}</h3>
                  <p className="text-sm text-slate-600">
                    {entry.technician.firstName} {entry.technician.lastName} — {entry.role} {t("employedAt")}{" "}
                    {entry.employer} ({localizedName(entry.country, locale)})
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {entry.document ? (
                      <a
                        href={`/api/documents/${entry.document.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-700 hover:underline"
                      >
                        {t("viewDocument")}
                      </a>
                    ) : (
                      t("noDocument")
                    )}
                  </p>
                </div>
                <Badge tone="warning">{STATUS_LABELS[entry.verificationStatus]}</Badge>
              </div>
              <ReviewForm
                verifyAction={verifyWorkExperienceAction}
                rejectAction={rejectWorkExperienceAction}
                id={entry.id}
              />
            </Card>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">{t("trainingsHeading", { count: pendingTrainings.length })}</h2>
        {pendingTrainings.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">{t("noTrainings")}</p>
          </Card>
        ) : (
          pendingTrainings.map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{entry.title}</h3>
                  <p className="text-sm text-slate-600">
                    {entry.technician.firstName} {entry.technician.lastName} — {entry.provider} (
                    {formatDate(entry.completionDate, locale)})
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {entry.document ? (
                      <a
                        href={`/api/documents/${entry.document.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-700 hover:underline"
                      >
                        {t("viewDocument")}
                      </a>
                    ) : (
                      t("noDocument")
                    )}
                  </p>
                </div>
                <Badge tone="warning">{STATUS_LABELS[entry.verificationStatus]}</Badge>
              </div>
              <ReviewForm
                verifyAction={verifyTechnicianTrainingAction}
                rejectAction={rejectTechnicianTrainingAction}
                id={entry.id}
              />
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
