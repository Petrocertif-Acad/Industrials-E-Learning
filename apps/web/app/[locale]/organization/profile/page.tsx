import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getOwnOrganization } from "@/lib/organization";
import { localizedName } from "@/lib/localized-name";
import { Card } from "@/components/ui/card";
import { OrganizationProfileForm } from "@/components/features/organization/organization-profile-form";

export default async function OrganizationProfilePage() {
  const t = await getTranslations("OrganizationProfilePage");
  const locale = await getLocale();
  const session = await auth();

  const [organization, countriesData] = await Promise.all([
    getOwnOrganization(session!.user.id),
    prisma.country.findMany({ orderBy: { nameFr: "asc" }, select: { id: true, nameFr: true, nameEn: true } }),
  ]);
  const countries = countriesData.map((country) => ({ id: country.id, name: localizedName(country, locale) }));

  if (!organization) {
    return <p className="text-slate-600">{t("notFound")}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
      </div>

      <Card>
        <OrganizationProfileForm
          countries={countries}
          defaults={{
            name: organization.name,
            countryId: organization.countryId,
            description: organization.description,
            website: organization.website,
          }}
        />
      </Card>
    </div>
  );
}
