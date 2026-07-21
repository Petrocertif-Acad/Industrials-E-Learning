import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { searchTechnicians, type TechnicianSearchFilters } from "@/lib/search";
import { getOwnOrganization } from "@/lib/organization";
import { getTalentPoolTechnicianIds } from "@/lib/talent-pool";
import { localizedName } from "@/lib/localized-name";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TalentPoolToggleButton } from "@/components/features/organization/talent-pool-toggle-button";
import { getAvailabilityLabels, AVAILABILITY_TONE, getMobilityLabels } from "@/lib/availability-labels";
import { getProfileVerificationLabels, PROFILE_VERIFICATION_TONE } from "@/lib/verification-labels";
import { isCertificationCurrentlyValid } from "@/lib/certification-expiry";
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
  const t = await getTranslations("OrganizationSearchPage");
  const locale = await getLocale();
  const AVAILABILITY_LABELS = getAvailabilityLabels(locale);
  const MOBILITY_LABELS = getMobilityLabels(locale);
  const PROFILE_VERIFICATION_LABELS = getProfileVerificationLabels(locale);
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

  const [technicians, tradesData, countriesData, certifications, savedTechnicianIds] = await Promise.all([
    searchTechnicians(filters),
    prisma.trade.findMany({ orderBy: { nameFr: "asc" }, select: { id: true, nameFr: true, nameEn: true } }),
    prisma.country.findMany({ orderBy: { nameFr: "asc" }, select: { id: true, nameFr: true, nameEn: true } }),
    prisma.certification.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, standardRef: true } }),
    organization ? getTalentPoolTechnicianIds(organization.id) : Promise.resolve(new Set<string>()),
  ]);
  const trades = tradesData.map((trade) => ({ id: trade.id, name: localizedName(trade, locale) }));
  const countries = countriesData.map((country) => ({ id: country.id, name: localizedName(country, locale) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
      </div>

      <Card>
        <form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="trade">{t("trade")}</Label>
            <Select id="trade" name="trade" defaultValue={params.trade ?? ""}>
              <option value="">{t("allTrades")}</option>
              {trades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="country">{t("country")}</Label>
            <Select id="country" name="country" defaultValue={params.country ?? ""}>
              <option value="">{t("allCountries")}</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="availability">{t("availability")}</Label>
            <Select id="availability" name="availability" defaultValue={params.availability ?? ""}>
              <option value="">{t("allAvailability")}</option>
              <option value="AVAILABLE">{t("availabilityAvailable")}</option>
              <option value="AVAILABLE_SOON">{t("availabilitySoon")}</option>
              <option value="UNAVAILABLE">{t("availabilityUnavailable")}</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="mobility">{t("mobility")}</Label>
            <Select id="mobility" name="mobility" defaultValue={params.mobility ?? ""}>
              <option value="">{t("allMobility")}</option>
              <option value="LOCAL">{t("mobilityLocal")}</option>
              <option value="NATIONAL">{t("mobilityNational")}</option>
              <option value="INTERNATIONAL">{t("mobilityInternational")}</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="certification">{t("certification")}</Label>
            <Select id="certification" name="certification" defaultValue={params.certification ?? ""}>
              <option value="">{t("allCertifications")}</option>
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
            <Label htmlFor="minScore">{t("minScore")}</Label>
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
            <Button type="submit">{t("search")}</Button>
            {hasActiveFilters && (
              <Link href="/organization/search" className="text-sm text-slate-600 hover:underline">
                {t("resetFilters")}
              </Link>
            )}
          </div>
        </form>
      </Card>

      <p className="text-sm text-slate-600">
        {technicians.length > 1
          ? t("resultsCountPlural", { count: technicians.length })
          : t("resultsCount", { count: technicians.length })}
      </p>

      {technicians.length === 0 ? (
        <Card className="border-slate-200 bg-slate-50 text-center">
          <p className="text-sm text-slate-600">{t("empty")}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((technician) => {
            const verifiedCertifications = technician.certifications.filter(isCertificationCurrentlyValid).length;

            return (
              <Card key={technician.id} className="flex h-full flex-col transition-colors hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Avatar firstName={technician.firstName} lastName={technician.lastName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {technician.firstName} {technician.lastName}
                    </p>
                    <p className="truncate text-sm text-slate-600">
                      {technician.primaryTrade && localizedName(technician.primaryTrade, locale)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {technician.country && localizedName(technician.country, locale)}
                      {technician.city ? ` · ${technician.city}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      {technician.score ? Number(technician.score.totalScore) : "—"}
                    </p>
                    <p className="text-xs text-slate-500">{t("score")}</p>
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
                    {verifiedCertifications > 1
                      ? t("certificationsVerifiedPlural", {
                          verified: verifiedCertifications,
                          total: technician.certifications.length,
                        })
                      : t("certificationsVerified", {
                          verified: verifiedCertifications,
                          total: technician.certifications.length,
                        })}
                  </p>
                )}

                <div className="mt-4 flex flex-1 items-end justify-between gap-2">
                  <Link
                    href={`/technicians/${technician.id}`}
                    className="rounded text-sm font-medium text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
                  >
                    {t("viewProfile")}
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
