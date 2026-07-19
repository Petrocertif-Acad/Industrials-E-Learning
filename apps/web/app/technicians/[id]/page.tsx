import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  DOCUMENT_VERIFICATION_LABELS,
  DOCUMENT_VERIFICATION_TONE,
  PROFILE_VERIFICATION_LABELS,
  PROFILE_VERIFICATION_TONE,
} from "@/lib/verification-labels";
import { SKILL_LEVEL_LABELS } from "@/lib/skill-levels";

const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  AVAILABLE_SOON: "Disponible prochainement",
  UNAVAILABLE: "Non disponible",
};

const AVAILABILITY_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  AVAILABLE: "success",
  AVAILABLE_SOON: "warning",
  UNAVAILABLE: "neutral",
};

const MOBILITY_LABELS: Record<string, string> = {
  LOCAL: "Mobilité locale",
  NATIONAL: "Mobilité nationale",
  INTERNATIONAL: "Mobilité internationale",
};

const EXPIRY_WARNING_WINDOW_DAYS = 60;

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", timeZone: "UTC" });
}

function getExpiryBadge(expiryDate: Date | null) {
  if (!expiryDate) return null;
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) return { label: "Expirée", tone: "danger" as const };
  if (daysUntilExpiry <= EXPIRY_WARNING_WINDOW_DAYS) return { label: `Expire dans ${daysUntilExpiry} j`, tone: "warning" as const };
  return null;
}

interface TechnicianProfileViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function TechnicianProfileViewPage({ params }: TechnicianProfileViewPageProps) {
  const { id } = await params;
  const session = await auth();

  const profile = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      primaryTrade: true,
      secondaryTrades: { include: { trade: true } },
      country: true,
      score: true,
      skills: { include: { skill: { include: { trade: true } } }, orderBy: { updatedAt: "desc" } },
      certifications: { include: { certification: true }, orderBy: { createdAt: "desc" } },
      workExperiences: { include: { country: true }, orderBy: { startDate: "desc" } },
      languages: true,
    },
  });

  const isOwner = session?.user?.id !== undefined && profile?.userId === session.user.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const isPrivileged = isOwner || isAdmin;

  const isPublishable = Boolean(profile?.primaryTradeId && profile?.countryId);
  const isHidden = profile?.verificationStatus === "SUSPENDED" || profile?.verificationStatus === "ARCHIVED";

  if (!profile || (!isPublishable && !isPrivileged) || (isHidden && !isPrivileged)) {
    notFound();
  }

  const fullAccess = isPrivileged || profile.visibility === "PUBLIC_FULL";

  const verifiedCertifications = profile.certifications.filter((c) => c.verificationStatus === "VERIFIED").length;
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
          <p className="mt-1 text-lg text-slate-700">{profile.primaryTrade?.nameFr}</p>
          <p className="mt-1 text-sm text-slate-500">
            {profile.country?.nameFr}
            {profile.city ? ` · ${profile.city}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={AVAILABILITY_TONE[profile.availability]}>{AVAILABILITY_LABELS[profile.availability]}</Badge>
            <Badge tone="neutral">{MOBILITY_LABELS[profile.mobilityScope]}</Badge>
          </div>
        </div>
        <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Score global</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {profile.score ? Number(profile.score.totalScore) : "—"}
            {profile.score && <span className="text-base font-normal text-slate-500"> / 100</span>}
          </p>
          {!profile.score && <p className="mt-1 text-xs text-slate-500">Non encore calculé</p>}
        </div>
      </Card>

      {/* Trust indicators */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900">{profile.yearsExperience}</p>
          <p className="mt-1 text-xs text-slate-500">Années d&apos;expérience</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900">
            {verifiedCertifications}
            <span className="text-base text-slate-500">/{profile.certifications.length}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Certifications vérifiées</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900">
            {verifiedExperiences}
            <span className="text-base text-slate-500">/{profile.workExperiences.length}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Expériences vérifiées</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-slate-900">{profile.skills.length}</p>
          <p className="mt-1 text-xs text-slate-500">Compétences déclarées</p>
        </Card>
      </div>

      {!fullAccess ? (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <h2 className="text-sm font-semibold text-amber-900">Profil à visibilité limitée</h2>
          <p className="mt-1 text-sm text-amber-800">
            Ce technicien n&apos;a pas encore rendu publiques ses compétences, certifications et
            expériences détaillées. Seules les informations générales ci-dessus sont visibles.
          </p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {profile.skills.length > 0 && (
              <Card>
                <h2 className="text-lg font-medium text-slate-900">Compétences</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {profile.skills.map((entry) => (
                    <li key={entry.id}>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                        {entry.skill.nameFr}
                        <span className="text-xs text-slate-500">
                          · {SKILL_LEVEL_LABELS[entry.verifiedLevel ?? entry.selfLevel]}
                        </span>
                        {entry.verifiedLevel && (
                          <span aria-label="Compétence vérifiée" title="Compétence vérifiée" className="text-emerald-600">
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
                <h2 className="text-lg font-medium text-slate-900">Certifications</h2>
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
                              <p className="mt-1 text-sm text-slate-500">Procédé : {entry.weldingProcess}</p>
                            )}
                            {entry.expiryDate && (
                              <p className="mt-1 text-xs text-slate-500">
                                Expire le {formatDate(entry.expiryDate)}
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
                <h2 className="text-lg font-medium text-slate-900">Expériences professionnelles</h2>
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
                            {experience.country.nameFr} · {formatMonthYear(experience.startDate)} —{" "}
                            {experience.endDate ? formatMonthYear(experience.endDate) : "en cours"}
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
            <Card>
              <h2 className="text-sm font-semibold text-slate-900">Informations complémentaires</h2>
              <dl className="mt-3 space-y-3 text-sm">
                {profile.secondaryTrades.length > 0 && (
                  <div>
                    <dt className="text-slate-500">Métiers secondaires</dt>
                    <dd className="mt-1 text-slate-800">
                      {profile.secondaryTrades.map((t) => t.trade.nameFr).join(", ")}
                    </dd>
                  </div>
                )}
                {profile.languages.length > 0 && (
                  <div>
                    <dt className="text-slate-500">Langues</dt>
                    <dd className="mt-1 text-slate-800">
                      {profile.languages.map((l) => l.languageCode.toUpperCase()).join(", ")}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-slate-500">Dernière mise à jour</dt>
                  <dd className="mt-1 text-slate-800">{formatDate(profile.updatedAt)}</dd>
                </div>
              </dl>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-slate-900">Mettre en relation</h2>
              <p className="mt-1 text-sm text-slate-600">
                La messagerie entre entreprises et techniciens arrive dans un prochain module.
              </p>
              <button
                type="button"
                disabled
                className="mt-3 w-full cursor-not-allowed rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
              >
                Contacter ce technicien (bientôt disponible)
              </button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
