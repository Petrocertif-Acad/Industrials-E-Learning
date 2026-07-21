import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { localizedName } from "@/lib/localized-name";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ScoreMeter } from "@/components/features/technician/score-meter";
import { ProfileCompleteness } from "@/components/features/technician/profile-completeness";
import { DashboardStatCard } from "@/components/features/technician/dashboard-stat-card";
import { getProfileVerificationLabels, PROFILE_VERIFICATION_TONE } from "@/lib/verification-labels";
import { getAvailabilityLabels, AVAILABILITY_TONE, getMobilityLabels } from "@/lib/availability-labels";
import { buildProfileCompletenessChecklist } from "@/lib/technician";
import { isExpiringSoonOrExpired, isCertificationCurrentlyValid } from "@/lib/certification-expiry";
import type { ScoreCalculationDetails } from "@/lib/score";

const SECONDARY_LINK_CLASSNAME =
  "rounded text-sm text-slate-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2";

interface TechnicianDashboardPageProps {
  searchParams: Promise<{ updated?: string }>;
}

export default async function TechnicianDashboardPage({ searchParams }: TechnicianDashboardPageProps) {
  // La couche layout (app/technician/layout.tsx) a déjà vérifié le rôle ;
  // ce composant peut donc supposer une session TECHNICIAN valide.
  const t = await getTranslations("TechnicianDashboard");
  const tChecklist = await getTranslations("ProfileCompleteness");
  const tCommon = await getTranslations("Common");
  const locale = await getLocale();
  const PROFILE_VERIFICATION_LABELS = getProfileVerificationLabels(locale);
  const AVAILABILITY_LABELS = getAvailabilityLabels(locale);
  const MOBILITY_LABELS = getMobilityLabels(locale);
  const { updated } = await searchParams;
  const session = await auth();
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      primaryTrade: true,
      country: true,
      score: true,
      certifications: { select: { verificationStatus: true, expiryDate: true } },
      _count: { select: { skills: true, workExperiences: true, trainings: true } },
    },
  });

  if (!profile) {
    return <p className="text-slate-600">{tCommon("profileNotFound")}</p>;
  }

  const onboardingComplete = Boolean(profile.primaryTradeId && profile.countryId);
  const certificationsTotal = profile.certifications.length;
  const certificationsVerified = profile.certifications.filter(isCertificationCurrentlyValid).length;
  const hasExpiringCertification = profile.certifications.some((c) => isExpiringSoonOrExpired(c.expiryDate));
  const checklist = buildProfileCompletenessChecklist(
    {
      primaryTradeId: profile.primaryTradeId,
      countryId: profile.countryId,
      skillsCount: profile._count.skills,
      certificationsCount: certificationsTotal,
      workExperiencesCount: profile._count.workExperiences,
    },
    tChecklist
  );

  return (
    <div className="space-y-6">
      {/* Bloc identité & confiance */}
      <Card className="flex flex-col gap-6 border-slate-200 bg-slate-50 sm:flex-row sm:items-start">
        <Avatar firstName={profile.firstName} lastName={profile.lastName} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{t("greeting", { firstName: profile.firstName })}</h1>
            <Badge tone={PROFILE_VERIFICATION_TONE[profile.verificationStatus]}>
              {PROFILE_VERIFICATION_LABELS[profile.verificationStatus]}
            </Badge>
          </div>
          <p className="mt-1 text-lg text-slate-700">
            {profile.primaryTrade ? localizedName(profile.primaryTrade, locale) : t("tradeMissing")}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {profile.country ? localizedName(profile.country, locale) : t("locationMissing")}
            {profile.city ? ` · ${profile.city}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={AVAILABILITY_TONE[profile.availability]}>{AVAILABILITY_LABELS[profile.availability]}</Badge>
            <Badge tone="neutral">{MOBILITY_LABELS[profile.mobilityScope]}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link href="/technician/profile" className={SECONDARY_LINK_CLASSNAME}>
              {t("editProfile")}
            </Link>
            {onboardingComplete && (
              <Link
                href={`/technicians/${profile.id}`}
                target="_blank"
                rel="noreferrer"
                className={SECONDARY_LINK_CLASSNAME}
              >
                {t("viewPublicProfile")}
              </Link>
            )}
            {onboardingComplete && (
              // Lien direct (pas le Link localisé) : /api/* n'est jamais préfixé par la langue.
              <a href={`/api/technicians/${profile.id}/passport?locale=${locale}`} className={SECONDARY_LINK_CLASSNAME}>
                {t("downloadPassport")}
              </a>
            )}
          </div>
        </div>
      </Card>

      {updated === "1" && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{t("savedNotice")}</p>
      )}

      <ProfileCompleteness items={checklist} />

      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreMeter
          score={profile.score ? Number(profile.score.totalScore) : null}
          calculatedAt={profile.score?.calculatedAt ?? null}
          calculationDetails={profile.score?.calculationDetails as unknown as ScoreCalculationDetails | null | undefined}
        />

        <DashboardStatCard
          href="/technician/skills"
          label={t("skillsLabel")}
          value={profile._count.skills}
          description={profile._count.skills > 0 ? t("skillsEditAction") : t("skillsAddAction")}
        />

        <DashboardStatCard
          href="/technician/experiences"
          label={t("experiencesLabel")}
          value={profile._count.workExperiences}
          description={profile._count.workExperiences > 0 ? t("experiencesViewAction") : t("experiencesAddAction")}
        />

        <DashboardStatCard
          href="/technician/certifications"
          label={t("certificationsLabel")}
          value={
            certificationsTotal > 0 ? (
              <>
                {certificationsTotal}
                <span className="text-base font-normal text-slate-500">
                  {" "}
                  · {certificationsVerified}{" "}
                  {certificationsVerified > 1
                    ? t("certificationsVerifiedSuffixPlural")
                    : t("certificationsVerifiedSuffix")}
                </span>
              </>
            ) : (
              0
            )
          }
          description={certificationsTotal > 0 ? t("certificationsViewAction") : t("certificationsAddAction")}
          badge={hasExpiringCertification && <Badge tone="warning">{t("expiryWarning")}</Badge>}
        />

        <DashboardStatCard
          href="/technician/trainings"
          label={t("trainingsLabel")}
          value={profile._count.trainings}
          description={profile._count.trainings > 0 ? t("trainingsViewAction") : t("trainingsAddAction")}
        />
      </div>
    </div>
  );
}
