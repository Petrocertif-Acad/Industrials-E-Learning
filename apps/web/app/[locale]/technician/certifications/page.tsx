import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteCertificationButton } from "@/components/features/certification/delete-certification-button";
import { DOCUMENT_VERIFICATION_LABELS, DOCUMENT_VERIFICATION_TONE } from "@/lib/verification-labels";
import { getExpiryBadge } from "@/lib/certification-expiry";

function formatDate(date: Date) {
  // Les dates de certification n'ont pas de composante horaire : elles sont
  // stockées à minuit UTC. Formater dans le fuseau du serveur ferait glisser
  // l'affichage d'un jour selon son décalage horaire (ex. UTC-5 en soirée).
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

interface TechnicianCertificationsPageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function TechnicianCertificationsPage({ searchParams }: TechnicianCertificationsPageProps) {
  const { saved } = await searchParams;
  const session = await auth();

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      certifications: {
        include: { certification: true, document: true },
        orderBy: { createdAt: "desc" },
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
          <h1 className="text-2xl font-semibold tracking-tight">Mes certifications</h1>
          <p className="mt-1 text-sm text-slate-600">
            Vos qualifications et certifications. Un justificatif vérifié augmente
            significativement votre score.
          </p>
        </div>
        <Link href="/technician/certifications/new">
          <Button>Ajouter une certification</Button>
        </Link>
      </div>

      {saved === "1" && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Certification enregistrée.
        </p>
      )}

      {profile.certifications.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">Vous n&apos;avez pas encore ajouté de certification.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {profile.certifications.map((entry) => {
            const expiryBadge = getExpiryBadge(entry.expiryDate);
            return (
              <Card key={entry.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium">
                      {entry.certification.standardRef
                        ? `${entry.certification.standardRef} — ${entry.certification.name}`
                        : entry.certification.name}
                    </h2>
                    <p className="text-sm text-slate-600">{entry.certification.issuingBody}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {entry.issueDate ? `Obtenue le ${formatDate(entry.issueDate)}` : "Date d'obtention non renseignée"}
                      {entry.expiryDate ? ` · Expire le ${formatDate(entry.expiryDate)}` : ""}
                      {entry.weldingProcess ? ` · Procédé ${entry.weldingProcess}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge tone={DOCUMENT_VERIFICATION_TONE[entry.verificationStatus]}>
                      {DOCUMENT_VERIFICATION_LABELS[entry.verificationStatus]}
                    </Badge>
                    {expiryBadge && <Badge tone={expiryBadge.tone}>{expiryBadge.label}</Badge>}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  {entry.document ? (
                    <a
                      href={`/api/documents/${entry.document.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded text-sm text-slate-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                    >
                      Voir le justificatif
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">Aucun justificatif</span>
                  )}
                  <Link
                    href={`/technician/certifications/${entry.id}/edit`}
                    className="rounded text-sm text-slate-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                  >
                    Modifier
                  </Link>
                  <DeleteCertificationButton certificationRecordId={entry.id} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
