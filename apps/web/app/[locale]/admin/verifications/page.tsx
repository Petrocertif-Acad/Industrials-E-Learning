import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  verifyTechnicianCertificationAction,
  rejectTechnicianCertificationAction,
  verifyWorkExperienceAction,
  rejectWorkExperienceAction,
} from "@/lib/actions/verification";

const STATUS_LABELS: Record<string, string> = {
  DECLARED: "Déclarée",
  UNDER_REVIEW: "En cours de vérification",
};

function ReviewForm({
  verifyAction,
  rejectAction,
  id,
}: {
  verifyAction: (formData: FormData) => Promise<void>;
  rejectAction: (formData: FormData) => Promise<void>;
  id: string;
}) {
  return (
    <form action={verifyAction} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="id" value={id} />
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor={`note-${id}`}>
          Note (facultatif, journalisée dans l&apos;audit)
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
          Valider
        </button>
        <button
          type="submit"
          formAction={rejectAction}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Rejeter
        </button>
      </div>
    </form>
  );
}

export default async function AdminVerificationsPage() {
  const [pendingCertifications, pendingExperiences] = await Promise.all([
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
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vérifications en attente</h1>
        <p className="mt-1 text-sm text-slate-600">
          Contrôlez les certifications et expériences déclarées par les techniciens avant de
          les valider ou de les rejeter.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">
          Certifications ({pendingCertifications.length})
        </h2>
        {pendingCertifications.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">Aucune certification en attente.</p>
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
                        Voir le justificatif
                      </a>
                    ) : (
                      "Aucun justificatif fourni"
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
        <h2 className="text-lg font-medium">
          Expériences professionnelles ({pendingExperiences.length})
        </h2>
        {pendingExperiences.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">Aucune expérience en attente.</p>
          </Card>
        ) : (
          pendingExperiences.map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{entry.projectName}</h3>
                  <p className="text-sm text-slate-600">
                    {entry.technician.firstName} {entry.technician.lastName} — {entry.role} chez{" "}
                    {entry.employer} ({entry.country.nameFr})
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {entry.document ? (
                      <a
                        href={`/api/documents/${entry.document.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-700 hover:underline"
                      >
                        Voir le justificatif
                      </a>
                    ) : (
                      "Aucun justificatif fourni"
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
    </div>
  );
}
