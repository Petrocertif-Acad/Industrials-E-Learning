import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ScoreMeter } from "@/components/features/technician/score-meter";
import { PROFILE_VERIFICATION_LABELS, PROFILE_VERIFICATION_TONE } from "@/lib/verification-labels";
import { AVAILABILITY_LABELS, AVAILABILITY_TONE, MOBILITY_LABELS } from "@/lib/availability-labels";

const SECONDARY_LINK_CLASSNAME =
  "rounded text-sm text-slate-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2";

interface TechnicianDashboardPageProps {
  searchParams: Promise<{ updated?: string }>;
}

export default async function TechnicianDashboardPage({ searchParams }: TechnicianDashboardPageProps) {
  // La couche layout (app/technician/layout.tsx) a déjà vérifié le rôle ;
  // ce composant peut donc supposer une session TECHNICIAN valide.
  const { updated } = await searchParams;
  const session = await auth();
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      primaryTrade: true,
      country: true,
      score: true,
      _count: { select: { skills: true, workExperiences: true, certifications: true } },
    },
  });

  if (!profile) {
    return <p className="text-slate-600">Profil introuvable.</p>;
  }

  const onboardingComplete = Boolean(profile.primaryTradeId && profile.countryId);

  return (
    <div className="space-y-6">
      {/* Bloc identité & confiance */}
      <Card className="flex flex-col gap-6 border-slate-200 bg-slate-50 sm:flex-row sm:items-start">
        <Avatar firstName={profile.firstName} lastName={profile.lastName} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Bonjour {profile.firstName}</h1>
            <Badge tone={PROFILE_VERIFICATION_TONE[profile.verificationStatus]}>
              {PROFILE_VERIFICATION_LABELS[profile.verificationStatus]}
            </Badge>
          </div>
          <p className="mt-1 text-lg text-slate-700">
            {profile.primaryTrade?.nameFr ?? "Métier non renseigné"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {profile.country?.nameFr ?? "Localisation non renseignée"}
            {profile.city ? ` · ${profile.city}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={AVAILABILITY_TONE[profile.availability]}>{AVAILABILITY_LABELS[profile.availability]}</Badge>
            <Badge tone="neutral">{MOBILITY_LABELS[profile.mobilityScope]}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link href="/technician/profile" className={SECONDARY_LINK_CLASSNAME}>
              Modifier mon profil
            </Link>
            {onboardingComplete && (
              <Link
                href={`/technicians/${profile.id}`}
                target="_blank"
                rel="noreferrer"
                className={SECONDARY_LINK_CLASSNAME}
              >
                Voir mon profil public ↗
              </Link>
            )}
          </div>
        </div>
      </Card>

      {updated === "1" && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Vos informations ont été enregistrées.
        </p>
      )}

      {!onboardingComplete && (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            Votre profil est incomplet. Renseignez votre métier principal, votre pays et vos
            compétences pour apparaître dans les résultats de recherche des entreprises.
          </p>
          <Link href="/technician/profile">
            <Button className="mt-4">Compléter mon profil</Button>
          </Link>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreMeter
          score={profile.score ? Number(profile.score.totalScore) : null}
          calculatedAt={profile.score?.calculatedAt ?? null}
        />

        <Card>
          <h2 className="text-sm font-medium text-slate-500">Compétences déclarées</h2>
          <p className="mt-2 text-3xl font-semibold">{profile._count.skills}</p>
          <Link href="/technician/skills" className={`mt-1 inline-block ${SECONDARY_LINK_CLASSNAME}`}>
            {profile._count.skills > 0 ? "Modifier mes compétences" : "Déclarer mes compétences"}
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-slate-500">Expériences professionnelles</h2>
          <p className="mt-2 text-3xl font-semibold">{profile._count.workExperiences}</p>
          <Link href="/technician/experiences" className={`mt-1 inline-block ${SECONDARY_LINK_CLASSNAME}`}>
            {profile._count.workExperiences > 0 ? "Voir mes expériences" : "Ajouter une expérience"}
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-slate-500">Certifications</h2>
          <p className="mt-2 text-3xl font-semibold">{profile._count.certifications}</p>
          <Link href="/technician/certifications" className={`mt-1 inline-block ${SECONDARY_LINK_CLASSNAME}`}>
            {profile._count.certifications > 0 ? "Voir mes certifications" : "Ajouter une certification"}
          </Link>
        </Card>
      </div>
    </div>
  );
}
