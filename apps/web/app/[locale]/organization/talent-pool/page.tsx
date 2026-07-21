import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { getOwnOrganization } from "@/lib/organization";
import { getOwnTalentPoolEntries } from "@/lib/talent-pool";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TalentPoolToggleButton } from "@/components/features/organization/talent-pool-toggle-button";
import { TalentPoolNoteForm } from "@/components/features/organization/talent-pool-note-form";
import { AVAILABILITY_LABELS, AVAILABILITY_TONE, MOBILITY_LABELS } from "@/lib/availability-labels";
import { PROFILE_VERIFICATION_LABELS, PROFILE_VERIFICATION_TONE } from "@/lib/verification-labels";

export default async function TalentPoolPage() {
  const session = await auth();
  const organization = await getOwnOrganization(session!.user.id);

  if (!organization) {
    return <p className="text-slate-600">Organisation introuvable.</p>;
  }

  const entries = await getOwnTalentPoolEntries(organization.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vivier de candidats</h1>
        <p className="mt-1 text-sm text-slate-600">
          Techniciens que vous avez enregistrés pour un suivi ultérieur.
        </p>
      </div>

      {entries.length === 0 ? (
        <Card className="border-slate-200 bg-slate-50 text-center">
          <p className="text-sm text-slate-600">
            Votre vivier est vide. Ajoutez des techniciens depuis la recherche ou leur profil public.
          </p>
          <Link
            href="/organization/search"
            className="mt-3 inline-block rounded text-sm font-medium text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
          >
            Lancer une recherche →
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar firstName={entry.technician.firstName} lastName={entry.technician.lastName} />
                  <div className="min-w-0">
                    <Link
                      href={`/technicians/${entry.technician.id}`}
                      className="font-medium text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                    >
                      {entry.technician.firstName} {entry.technician.lastName}
                    </Link>
                    <p className="text-sm text-slate-600">{entry.technician.primaryTrade?.nameFr}</p>
                    <p className="text-xs text-slate-500">
                      {entry.technician.country?.nameFr}
                      {entry.technician.city ? ` · ${entry.technician.city}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone={PROFILE_VERIFICATION_TONE[entry.technician.verificationStatus]}>
                        {PROFILE_VERIFICATION_LABELS[entry.technician.verificationStatus]}
                      </Badge>
                      <Badge tone={AVAILABILITY_TONE[entry.technician.availability]}>
                        {AVAILABILITY_LABELS[entry.technician.availability]}
                      </Badge>
                      <Badge tone="neutral">{MOBILITY_LABELS[entry.technician.mobilityScope]}</Badge>
                    </div>
                  </div>
                </div>
                <TalentPoolToggleButton
                  technicianId={entry.technician.id}
                  isSaved
                  className="shrink-0 px-3 py-1.5 text-xs"
                />
              </div>

              <TalentPoolNoteForm entryId={entry.id} defaultNote={entry.note ?? ""} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
