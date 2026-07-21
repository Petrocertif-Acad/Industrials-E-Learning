import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getOwnOrganization } from "@/lib/organization";
import { localizedName } from "@/lib/localized-name";
import {
  getTechnicianProfileForDisplay,
  canViewFullTechnicianProfile,
  isTechnicianProfilePublishable,
  isTechnicianProfileHidden,
} from "@/lib/technician";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TalentPoolToggleButton } from "@/components/features/organization/talent-pool-toggle-button";
import {
  DOCUMENT_VERIFICATION_LABELS,
  DOCUMENT_VERIFICATION_TONE,
  PROFILE_VERIFICATION_LABELS,
  PROFILE_VERIFICATION_TONE,
} from "@/lib/verification-labels";
import { SKILL_LEVEL_LABELS } from "@/lib/skill-levels";
import { AVAILABILITY_LABELS, AVAILABILITY_TONE, MOBILITY_LABELS } from "@/lib/availability-labels";
import { getExpiryBadge, isCertificationCurrentlyValid } from "@/lib/certification-expiry";
import { ScoreBreakdownList } from "@/components/features/technician/score-breakdown-list";
import type { ScoreCalculationDetails } from "@/lib/score";

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", timeZone: "UTC" });
}

interface TechnicianProfileViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function TechnicianProfileViewPage({ params }: TechnicianProfileViewPageProps) {
  const t = await getTranslations("TechnicianProfileViewPage");
  const locale = await getLocale();
  const { id } = await params;
  const session = await auth();

  const profile = await getTechnicianProfileForDisplay(id);

  const isPrivileged =
    (session?.user?.id !== undefined && profile?.userId === session.user.id) || session?.user?.role === "ADMIN";
  const isPublishable = Boolean(profile && isTechnicianProfilePublishable(profile));
  const isHidden = Boolean(profile && isTechnicianProfileHidden(profile));

  if (!profile || (!isPublishable && !isPrivileged) || (isHidden && !isPrivileged)) {
    notFound();
  }

  const fullAccess = canViewFullTechnicianProfile(profile, session);

  const organization =
    session?.user?.role === "ORGANIZATION" ? await getOwnOrganization(session.user.id) : null;
  const isSavedInTalentPool = organization
    ? Boolean(
        await prisma.talentPoolEntry.findUnique({
          where: { organizationId_technicianId: { organizationId: organization.id, technicianId: profile.id } },
        })
      )
    : false;

  const verifiedCertifications = profile.certifications.filter(isCertificationCurrentlyValid).length;
  const verifiedExperiences = profile.workExperiences.filter((e) => e.verificationStatus === "VERIFIED").length;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      {/* Hero */}
      <Card className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar firstName={profile.firstName} lastName={profile.lastName} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {profile.firstName} {profile.lastName}
            </h1>
            <Badge tone={PROFILE_VERIFICATION_TONE[profile.verificationStatus]}>
              {PROFILE_VERIFICATION_LABELS[profile.verificationStatus]}
            </Badge>
          </div>
          <p className="mt-1 text-lg text-slate-700">
            {profile.primaryTrade && localizedName(profile.primaryTrade, locale)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {profile.country && localizedName(profile.country, locale)}
            {profile.city ? ` · ${profile.city}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={AVAILABILITY_TONE[profile.availability]}>{AVAILABILITY_LABELS[profile.availability]}</Badge>
            <Badge tone="neutral">{MOBILITY_LABELS[profile.mobilityScope]}</Badge>
          </div>
        </div>
        <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("scoreGlobal")}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {profile.score ? Number(profile.score.totalScore) : "—"}
            {profile.score && <span className="text-base font-normal text-slate-500"> / 100</span>}
          </p>
          {!profile.score && <p className="mt-1 text-xs text-slate-500">{t("scoreNotCalculated")}</p>}
          {fullAccess && (
            // Lien direct (pas le Link localisé) : /api/* n'est jamais préfixé par la langue.
            <a
              href={`/api/technicians/${profile.id}/passport?locale=${locale}`}
              className="mt-3 inline-block rounded text-xs font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
            >
              {t("downloadPassport")}
            </a>
          )}
        </div>
      </Card>

      {/* Trust indicators */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900">{profile.yearsExperience}</p>
          <p className="mt-1 text-xs text-slate-500">{t("yearsExperience")}</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900">
            {verifiedCertifications}
            <span className="text-base text-slate-500">/{profile.certifications.length}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{t("certificationsVerified")}</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900">
            {verifiedExperiences}
            <span className="text-base text-slate-500">/{profile.workExperiences.length}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{t("experiencesVerified")}</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900">{profile.skills.length}</p>
          <p className="mt-1 text-xs text-slate-500">{t("skillsDeclared")}</p>
        </Card>
      </div>

      {organization && (
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{t("talentPoolTitle")}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isSavedInTalentPool ? t("talentPoolSaved") : t("talentPoolNotSaved")}
            </p>
          </div>
          <TalentPoolToggleButton technicianId={profile.id} isSaved={isSavedInTalentPool} />
        </Card>
      )}

      {!fullAccess ? (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <h2 className="text-sm font-semibold text-amber-900">{t("limitedVisibilityTitle")}</h2>
          <p className="mt-1 text-sm text-amber-800">{t("limitedVisibilityDescription")}</p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {profile.skills.length > 0 && (
              <Card>
                <h2 className="text-lg font-medium text-slate-900">{t("skillsTitle")}</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {profile.skills.map((entry) => (
                    <li key={entry.id}>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                        {localizedName(entry.skill, locale)}
                        <span className="text-xs text-slate-500">
                          · {SKILL_LEVEL_LABELS[entry.verifiedLevel ?? entry.selfLevel]}
                        </span>
                        {entry.verifiedLevel && (
                          <span aria-label={t("skillVerified")} title={t("skillVerified")} className="text-emerald-600">
                            ✓
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {profile.certifications.length > 0 && (
              <Card>
                <h2 className="text-lg font-medium text-slate-900">{t("certificationsTitle")}</h2>
                <ul className="mt-4 space-y-4">
                  {profile.certifications.map((entry) => {
                    const expiryBadge = getExpiryBadge(entry.expiryDate);
                    return (
                      <li key={entry.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-900">
                              {entry.certification.standardRef
                                ? `${entry.certification.standardRef} — ${entry.certification.name}`
                                : entry.certification.name}
                            </p>
                            <p className="text-sm text-slate-500">{entry.certification.issuingBody}</p>
                            {entry.weldingProcess && (
                              <p className="mt-1 text-sm text-slate-500">{t("process", { process: entry.weldingProcess })}</p>
                            )}
                            {entry.expiryDate && (
                              <p className="mt-1 text-xs text-slate-500">
                                {t("expiresOn", { date: formatDate(entry.expiryDate) })}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <Badge tone={DOCUMENT_VERIFICATION_TONE[entry.verificationStatus]}>
                              {DOCUMENT_VERIFICATION_LABELS[entry.verificationStatus]}
                            </Badge>
                            {expiryBadge && <Badge tone={expiryBadge.tone}>{expiryBadge.label}</Badge>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}

            {profile.workExperiences.length > 0 && (
              <Card>
                <h2 className="text-lg font-medium text-slate-900">{t("experiencesTitle")}</h2>
                <ul className="mt-4 space-y-4">
                  {profile.workExperiences.map((experience) => (
                    <li key={experience.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">{experience.projectName}</p>
                          <p className="text-sm text-slate-600">
                            {experience.role} — {experience.employer}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {localizedName(experience.country, locale)} · {formatMonthYear(experience.startDate)} —{" "}
                            {experience.endDate ? formatMonthYear(experience.endDate) : t("ongoing")}
                          </p>
                        </div>
                        <Badge tone={DOCUMENT_VERIFICATION_TONE[experience.verificationStatus]}>
                          {DOCUMENT_VERIFICATION_LABELS[experience.verificationStatus]}
                        </Badge>
                      </div>
                      {experience.description && (
                        <p className="mt-2 text-sm text-slate-600">{experience.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {profile.score?.calculationDetails && (
              <Card>
                <h2 className="text-sm font-semibold text-slate-900">{t("scoreDetailTitle")}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {(profile.score.calculationDetails as unknown as ScoreCalculationDetails).method}
                </p>
                <div className="mt-4">
                  <ScoreBreakdownList
                    breakdown={(profile.score.calculationDetails as unknown as ScoreCalculationDetails).breakdown}
                  />
                </div>
              </Card>
            )}

            <Card>
              <h2 className="text-sm font-semibold text-slate-900">{t("additionalInfoTitle")}</h2>
              <dl className="mt-3 space-y-3 text-sm">
                {profile.secondaryTrades.length > 0 && (
                  <div>
                    <dt className="text-slate-500">{t("secondaryTrades")}</dt>
                    <dd className="mt-1 text-slate-800">
                      {profile.secondaryTrades
                        .map((secondaryTrade) => localizedName(secondaryTrade.trade, locale))
                        .join(", ")}
                    </dd>
                  </div>
                )}
                {profile.languages.length > 0 && (
                  <div>
                    <dt className="text-slate-500">{t("languages")}</dt>
                    <dd className="mt-1 text-slate-800">
                      {profile.languages.map((l) => l.languageCode.toUpperCase()).join(", ")}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-slate-500">{t("lastUpdated")}</dt>
                  <dd className="mt-1 text-slate-800">{formatDate(profile.updatedAt)}</dd>
                </div>
              </dl>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-slate-900">{t("connectTitle")}</h2>
              <p className="mt-1 text-sm text-slate-600">{t("connectDescription")}</p>
              <button
                type="button"
                disabled
                className="mt-3 w-full cursor-not-allowed rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
              >
                {t("connectButton")}
              </button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
