import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { localizedName } from "@/lib/localized-name";
import { Card } from "@/components/ui/card";
import { ExperienceForm } from "@/components/features/experience/experience-form";

export default async function NewExperiencePage() {
  const t = await getTranslations("NewExperiencePage");
  const locale = await getLocale();
  const countriesData = await prisma.country.findMany({
    orderBy: { nameFr: "asc" },
    select: { id: true, nameFr: true, nameEn: true },
  });
  const countries = countriesData.map((country) => ({ id: country.id, name: localizedName(country, locale) }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <Card>
        <ExperienceForm countries={countries} mode="create" />
      </Card>
    </div>
  );
}
