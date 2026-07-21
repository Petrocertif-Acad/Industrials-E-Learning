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
import { EmployerReviewForm } from "@/components/features/organization/employer-review-form";
import {
  getDocumentVerificationLabels,
  DOCUMENT_VERIFICATION_TONE,
  getProfileVerificationLabels,
  PROFILE_VERIFICATION_TONE,
} from "@/lib/verification-labels";
import { getSkillLevelLabels } from "@/lib/skill-levels";
import { getAvailabilityLabels, AVAILABILITY_TONE, getMobilityLabels } from "@/lib/availability-labels";
import { getExpiryBadge, isCertificationCurrentlyValid } from "@/lib/certification-expiry";
import { getTradeCategoryLabels } from "@/lib/trade-categories";
import { ScoreBreakdownList } from "@/components/features/technician/score-breakdown-list";
import type { ScoreCalculationDetails } from "@/lib/score";

function formatDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatMonthYear(date: Date, locale: string) {
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

interface TechnicianProfileViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function TechnicianProfileViewPage({ params }: TechnicianProfileViewPageProps) {
  const t = await getTranslations("TechnicianProfileViewPage");
  const locale = await getLocale();
  const DOCUMENT_VERIFICATION_LABELS = getDocumentVerificationLabels(locale);
  const PROFILE_VERIFICATION_LABELS = getProfileVerificationLabels(locale);
  const SKILL_LEVEL_LABELS = getSkillLevelLabels(locale);
  const AVAILABILITY_LABELS = getAvailabilityLabels(locale);
  const MOBILITY_LABELS = getMobilityLabels(locale);
  const TRADE_CATEGORY_LABELS = getTradeCategoryLabels(locale);
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
  const averageReviewRating =
    profile.employerReviews.length > 0
      ? profile.employerReviews.reduce((acc, review) => acc + review.rating, 0) / profile.employerReviews.length
      : null;
  const ownReview = organization
    ? profile.employerReviews.find((review) => review.organizationId === organization.id)
    : undefined;

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
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
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
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900">
            {averageReviewRating !== null ? averageReviewRating.toFixed(1) : "—"}
            <span className="text-base text-slate-500">/5</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{t("employerReviewsCount")}</p>
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
                                {t("expiresOn", { date: formatDate(entry.expiryDate, locale) })}
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
                            {localizedName(experience.country, locale)} · {formatMonthYear(experience.startDate, locale)} —{" "}
                            {experience.endDate ? formatMonthYear(experience.endDate, locale) : t("ongoing")}
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

            {profile.trainings.length > 0 && (
              <Card>
                <h2 className="text-lg font-medium text-slate-900">{t("trainingsTitle")}</h2>
                <ul className="mt-4 space-y-4">
                  {profile.trainings.map((training) => (
                    <li key={training.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">{training.title}</p>
                          <p className="text-sm text-slate-600">
                            {training.provider}
                            {training.category ? ` · ${TRADE_CATEGORY_LABELS[training.category]}` : ""}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatMonthYear(training.completionDate, locale)}
                            {training.hours ? ` · ${t("trainingHours", { hours: training.hours })}` : ""}
                          </p>
                        </div>
                        <Badge tone={DOCUMENT_VERIFICATION_TONE[training.verificationStatus]}>
                          {DOCUMENT_VERIFICATION_LABELS[training.verificationStatus]}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card>
              <h2 className="text-lg font-medium text-slate-900">{t("employerReviewsTitle")}</h2>
              {profile.employerReviews.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">{t("noEmployerReviews")}</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {profile.employerReviews.map((review) => (
                    <li key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">{review.organization.name}</p>
                          {review.context && <p className="text-sm text-slate-600">{review.context}</p>}
                        </div>
                        <span aria-label={t("ratingAriaLabel", { rating: review.rating })} className="text-amber-600">
                          {"★".repeat(review.rating)}
                          <span className="text-slate-300">{"★".repeat(5 - review.rating)}</span>
                        </span>
                      </div>
                      {review.comment && <p className="mt-2 text-sm text-slate-700">{review.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}

              {organization &&
                (organization.verificationStatus === "VERIFIED" ? (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {ownReview ? t("editYourReview") : t("addYourReview")}
                    </h3>
                    <div className="mt-3">
                      <EmployerReviewForm
                        technicianId={profile.id}
                        defaults={
                          ownReview
                            ? { rating: ownReview.rating, context: ownReview.context, comment: ownReview.comment }
                            : undefined
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 border-t border-slate-100 pt-6 text-xs text-slate-500">
                    {t("unverifiedOrganizationNotice")}
                  </p>
                ))}
            </Card>
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
                  <dd className="mt-1 text-slate-800">{formatDate(profile.updatedAt, locale)}</dd>
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
