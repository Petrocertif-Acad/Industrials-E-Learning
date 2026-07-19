import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROFILE_VERIFICATION_LABELS, PROFILE_VERIFICATION_TONE } from "@/lib/verification-labels";

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
      secondaryTrades: { include: { trade: true } },
      _count: { select: { skills: true, workExperiences: true, certifications: true } },
    },
  });

  if (!profile) {
    return <p className="text-slate-600">Profil introuvable.</p>;
  }

  const onboardingComplete = Boolean(profile.primaryTradeId && profile.countryId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bonjour {profile.firstName}
        </h1>
        <div className="flex items-center gap-3">
          <Badge tone={PROFILE_VERIFICATION_TONE[profile.verificationStatus]}>
            {PROFILE_VERIFICATION_LABELS[profile.verificationStatus]}
          </Badge>
          {onboardingComplete && (
            <Link
              href={`/technicians/${profile.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
            >
              Voir mon profil public ↗
            </Link>
          )}
        </div>
      </div>

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
        <Card>
          <h2 className="text-sm font-medium text-slate-500">Score global</h2>
          <p className="mt-2 text-3xl font-semibold">
            {profile.score ? `${profile.score.totalScore} / 100` : "Non calculé"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {profile.score
              ? `Dernier calcul : ${profile.score.calculatedAt.toLocaleDateString("fr-FR")}`
              : "Le score sera calculé une fois votre profil et vos certifications complétés."}
          </p>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-slate-500">Métier principal</h2>
          <p className="mt-2 text-lg font-medium">
            {profile.primaryTrade?.nameFr ?? "Non renseigné"}
          </p>
          {profile.secondaryTrades.length > 0 && (
            <p className="mt-1 text-sm text-slate-600">
              Métiers secondaires : {profile.secondaryTrades.map((t) => t.trade.nameFr).join(", ")}
            </p>
          )}
          <Link href="/technician/profile" className="mt-1 inline-block text-sm text-slate-600 hover:underline">
            {profile.primaryTrade ? "Modifier" : "Renseigner mon métier"}
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-slate-500">Localisation</h2>
          <p className="mt-2 text-lg font-medium">{profile.country?.nameFr ?? "Non renseigné"}</p>
          <p className="mt-1 text-sm text-slate-600">{profile.city ?? "Ville non renseignée"}</p>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-slate-500">Compétences déclarées</h2>
          <p className="mt-2 text-3xl font-semibold">{profile._count.skills}</p>
          <Link href="/technician/skills" className="mt-1 inline-block text-sm text-slate-600 hover:underline">
            {profile._count.skills > 0 ? "Modifier mes compétences" : "Déclarer mes compétences"}
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-slate-500">Expériences professionnelles</h2>
          <p className="mt-2 text-3xl font-semibold">{profile._count.workExperiences}</p>
          <Link
            href="/technician/experiences"
            className="mt-1 inline-block text-sm text-slate-600 hover:underline"
          >
            {profile._count.workExperiences > 0 ? "Voir mes expériences" : "Ajouter une expérience"}
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-slate-500">Certifications</h2>
          <p className="mt-2 text-3xl font-semibold">{profile._count.certifications}</p>
          <Link
            href="/technician/certifications"
            className="mt-1 inline-block text-sm text-slate-600 hover:underline"
          >
            {profile._count.certifications > 0 ? "Voir mes certifications" : "Ajouter une certification"}
          </Link>
        </Card>
      </div>
    </div>
  );
}
