import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { searchTechnicians, type TechnicianSearchFilters } from "@/lib/search";
import { getOwnOrganization } from "@/lib/organization";
import { getTalentPoolTechnicianIds } from "@/lib/talent-pool";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TalentPoolToggleButton } from "@/components/features/organization/talent-pool-toggle-button";
import { AVAILABILITY_LABELS, AVAILABILITY_TONE, MOBILITY_LABELS } from "@/lib/availability-labels";
import { PROFILE_VERIFICATION_LABELS, PROFILE_VERIFICATION_TONE } from "@/lib/verification-labels";
import type { AvailabilityStatus, MobilityScope } from "@/lib/generated/prisma/enums";

interface OrganizationSearchPageProps {
  searchParams: Promise<{
    trade?: string;
    country?: string;
    availability?: string;
    mobility?: string;
    certification?: string;
    minScore?: string;
  }>;
}

export default async function OrganizationSearchPage({ searchParams }: OrganizationSearchPageProps) {
  const params = await searchParams;

  const filters: TechnicianSearchFilters = {
    tradeId: params.trade || undefined,
    countryId: params.country || undefined,
    availability: (params.availability as AvailabilityStatus) || undefined,
    mobilityScope: (params.mobility as MobilityScope) || undefined,
    certificationId: params.certification || undefined,
    minScore: params.minScore ? Number(params.minScore) : undefined,
  };

  const hasActiveFilters = Object.values(params).some((value) => Boolean(value));

  const session = await auth();
  const organization = await getOwnOrganization(session!.user.id);

  const [technicians, trades, countries, certifications, savedTechnicianIds] = await Promise.all([
    searchTechnicians(filters),
    prisma.trade.findMany({ orderBy: { nameFr: "asc" }, select: { id: true, nameFr: true } }),
    prisma.country.findMany({ orderBy: { nameFr: "asc" }, select: { id: true, nameFr: true } }),
    prisma.certification.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, standardRef: true } }),
    organization ? getTalentPoolTechnicianIds(organization.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rechercher des techniciens</h1>
        <p className="mt-1 text-sm text-slate-600">
          Filtrez parmi les profils publiés pour trouver les techniciens correspondant à vos besoins.
        </p>
      </div>

      <Card>
        <form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="trade">Métier</Label>
            <Select id="trade" name="trade" defaultValue={params.trade ?? ""}>
              <option value="">Tous les métiers</option>
              {trades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.nameFr}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="country">Pays</Label>
            <Select id="country" name="country" defaultValue={params.country ?? ""}>
              <option value="">Tous les pays</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.nameFr}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="availability">Disponibilité</Label>
            <Select id="availability" name="availability" defaultValue={params.availability ?? ""}>
              <option value="">Toutes</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="AVAILABLE_SOON">Disponible prochainement</option>
              <option value="UNAVAILABLE">Non disponible</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="mobility">Mobilité</Label>
            <Select id="mobility" name="mobility" defaultValue={params.mobility ?? ""}>
              <option value="">Toutes</option>
              <option value="LOCAL">Locale</option>
              <option value="NATIONAL">Nationale</option>
              <option value="INTERNATIONAL">Internationale</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="certification">Certification</Label>
            <Select id="certification" name="certification" defaultValue={params.certification ?? ""}>
              <option value="">Toutes</option>
              {certifications.map((certification) => (
                <option key={certification.id} value={certification.id}>
                  {certification.standardRef
                    ? `${certification.standardRef} — ${certification.name}`
                    : certification.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="minScore">Score ATTI minimum</Label>
            <Input
              id="minScore"
              name="minScore"
              type="number"
              min={0}
              max={100}
              placeholder="0–100"
              defaultValue={params.minScore ?? ""}
            />
          </div>

          <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
            <Button type="submit">Rechercher</Button>
            {hasActiveFilters && (
              <Link href="/organization/search" className="text-sm text-slate-600 hover:underline">
                Réinitialiser les filtres
              </Link>
            )}
          </div>
        </form>
      </Card>

      <p className="text-sm text-slate-600">
        {technicians.length} technicien{technicians.length > 1 ? "s" : ""} trouvé
        {technicians.length > 1 ? "s" : ""}
      </p>

      {technicians.length === 0 ? (
        <Card className="border-slate-200 bg-slate-50 text-center">
          <p className="text-sm text-slate-600">
            Aucun technicien ne correspond à ces critères. Essayez d&apos;élargir votre recherche.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((technician) => {
            const verifiedCertifications = technician.certifications.filter(
              (c) => c.verificationStatus === "VERIFIED"
            ).length;

            return (
              <Card key={technician.id} className="flex h-full flex-col transition-colors hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Avatar firstName={technician.firstName} lastName={technician.lastName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {technician.firstName} {technician.lastName}
                    </p>
                    <p className="truncate text-sm text-slate-600">{technician.primaryTrade?.nameFr}</p>
                    <p className="truncate text-xs text-slate-500">
                      {technician.country?.nameFr}
                      {technician.city ? ` · ${technician.city}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      {technician.score ? Number(technician.score.totalScore) : "—"}
                    </p>
                    <p className="text-xs text-slate-500">Score</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone={PROFILE_VERIFICATION_TONE[technician.verificationStatus]}>
                    {PROFILE_VERIFICATION_LABELS[technician.verificationStatus]}
                  </Badge>
                  <Badge tone={AVAILABILITY_TONE[technician.availability]}>
                    {AVAILABILITY_LABELS[technician.availability]}
                  </Badge>
                  <Badge tone="neutral">{MOBILITY_LABELS[technician.mobilityScope]}</Badge>
                </div>

                {technician.certifications.length > 0 && (
                  <p className="mt-3 text-xs text-slate-500">
                    {verifiedCertifications}/{technician.certifications.length} certification
                    {technician.certifications.length > 1 ? "s" : ""} vérifiée
                    {verifiedCertifications > 1 ? "s" : ""}
                  </p>
                )}

                <div className="mt-4 flex flex-1 items-end justify-between gap-2">
                  <Link
                    href={`/technicians/${technician.id}`}
                    className="rounded text-sm font-medium text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                  >
                    Voir le profil →
                  </Link>
                  <TalentPoolToggleButton
                    technicianId={technician.id}
                    isSaved={savedTechnicianIds.has(technician.id)}
                    className="px-3 py-1.5 text-xs"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
