import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { localizedName } from "@/lib/localized-name";
import { Card } from "@/components/ui/card";
import { RegisterOrganizationForm } from "@/components/features/auth/register-organization-form";

// Sans vérification d'authentification (page publique), Next.js tenterait
// sinon de pré-rendre cette page statiquement au moment du build — donc
// d'exécuter la requête Prisma sans base de données disponible.
export const dynamic = "force-dynamic";

export default async function RegisterOrganizationPage() {
  const t = await getTranslations("RegisterOrganizationPage");
  const locale = await getLocale();
  const countriesData = await prisma.country.findMany({
    orderBy: { nameFr: "asc" },
    select: { id: true, nameFr: true, nameEn: true },
  });
  const countries = countriesData.map((country) => ({ id: country.id, name: localizedName(country, locale) }));

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mb-6 text-center text-sm text-slate-600">{t("subtitle")}</p>
        <Card>
          <RegisterOrganizationForm countries={countries} />
        </Card>
        <p className="mt-4 text-center text-sm text-slate-600">
          {t("alreadyRegistered")}{" "}
          <Link href="/login" className="font-medium text-slate-900 hover:underline">
            {t("login")}
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-600">
          {t("isTechnician")}{" "}
          <Link href="/register" className="font-medium text-slate-900 hover:underline">
            {t("registerTechnician")}
          </Link>
        </p>
      </div>
    </div>
  );
}
