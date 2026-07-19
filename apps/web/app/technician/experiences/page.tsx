import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteExperienceButton } from "@/components/features/experience/delete-experience-button";
import { DOCUMENT_VERIFICATION_LABELS, DOCUMENT_VERIFICATION_TONE } from "@/lib/verification-labels";

function formatDate(date: Date) {
  // Les dates de mission n'ont pas de composante horaire : elles sont stockées
  // à minuit UTC. Formater dans le fuseau du serveur ferait glisser
  // l'affichage d'un jour selon son décalage horaire (ex. UTC-5 en soirée).
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", timeZone: "UTC" });
}

interface TechnicianExperiencesPageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function TechnicianExperiencesPage({ searchParams }: TechnicianExperiencesPageProps) {
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
    return <p className="text-slate-600">Profil introuvable.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mes expériences professionnelles</h1>
          <p className="mt-1 text-sm text-slate-600">
            Vos projets et missions passés. Ils sont pris en compte dans votre score
            d&apos;expérience une fois vérifiés.
          </p>
        </div>
        <Link href="/technician/experiences/new">
          <Button>Ajouter une expérience</Button>
        </Link>
      </div>

      {saved === "1" && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Expérience enregistrée.
        </p>
      )}

      {profile.workExperiences.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">
            Vous n&apos;avez pas encore ajouté d&apos;expérience professionnelle.
          </p>
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
                    {experience.client ? ` (client : ${experience.client})` : ""}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {experience.country.nameFr}
                    {experience.sector ? ` · ${experience.sector}` : ""} ·{" "}
                    {formatDate(experience.startDate)} —{" "}
                    {experience.endDate ? formatDate(experience.endDate) : "en cours"}
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
                  className="text-sm text-slate-700 hover:underline"
                >
                  Modifier
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
