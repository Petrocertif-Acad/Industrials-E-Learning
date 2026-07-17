import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const VERIFICATION_LABELS: Record<string, string> = {
  INCOMPLETE: "Profil incomplet",
  DECLARED: "Profil déclaré",
  IDENTITY_VERIFIED: "Identité vérifiée",
  DOCUMENTS_PENDING: "Documents en cours de vérification",
  PARTIALLY_VERIFIED: "Profil partiellement vérifié",
  PROFESSIONALLY_VERIFIED: "Profil professionnel vérifié",
  PREMIUM_VERIFIED: "Profil premium vérifié",
  SUSPENDED: "Profil suspendu",
  ARCHIVED: "Profil archivé",
};

export default async function TechnicianDashboardPage() {
  // La couche layout (app/technician/layout.tsx) a déjà vérifié le rôle ;
  // ce composant peut donc supposer une session TECHNICIAN valide.
  const session = await auth();
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session!.user.id },
    include: { primaryTrade: true, score: true },
  });

  if (!profile) {
    return <p className="text-slate-600">Profil introuvable.</p>;
  }

  const onboardingComplete = Boolean(profile.primaryTradeId && profile.countryId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bonjour {profile.firstName}
        </h1>
        <Badge tone={onboardingComplete ? "success" : "warning"}>
          {VERIFICATION_LABELS[profile.verificationStatus]}
        </Badge>
      </div>

      {!onboardingComplete && (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            Votre profil est incomplet. Renseignez votre métier principal, votre pays et vos
            compétences pour apparaître dans les résultats de recherche des entreprises.
          </p>
          <Button className="mt-4" disabled>
            Compléter mon profil (module à venir)
          </Button>
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
          <Link href="/technician/dashboard" className="mt-1 inline-block text-sm text-slate-600 hover:underline">
            {profile.primaryTrade ? "Modifier" : "Renseigner mon métier"}
          </Link>
        </Card>
      </div>
    </div>
  );
}
