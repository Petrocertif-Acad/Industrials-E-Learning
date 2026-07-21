import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { getOwnOrganization } from "@/lib/organization";
import { localizedName } from "@/lib/localized-name";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrganizationDashboardPageProps {
  searchParams: Promise<{ updated?: string }>;
}

export default async function OrganizationDashboardPage({ searchParams }: OrganizationDashboardPageProps) {
  const t = await getTranslations("OrganizationDashboardPage");
  const locale = await getLocale();
  const { updated } = await searchParams;
  const session = await auth();
  const organization = await getOwnOrganization(session!.user.id);

  const ORG_VERIFICATION_LABELS: Record<string, string> = {
    PENDING: t("verificationPending"),
    VERIFIED: t("verificationVerified"),
    REJECTED: t("verificationRejected"),
  };

  const ORG_VERIFICATION_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
    PENDING: "warning",
    VERIFIED: "success",
    REJECTED: "danger",
  };

  if (!organization) {
    return <p className="text-slate-600">{t("notFound")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{organization.name}</h1>
        <Badge tone={ORG_VERIFICATION_TONE[organization.verificationStatus]}>
          {ORG_VERIFICATION_LABELS[organization.verificationStatus]}
        </Badge>
      </div>

      {updated === "1" && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{t("savedNotice")}</p>
      )}

      <Card>
        <h2 className="text-sm font-medium text-slate-500">{t("location")}</h2>
        <p className="mt-2 text-lg font-medium">{localizedName(organization.country, locale)}</p>
        {organization.website && (
          <p className="mt-1 text-sm text-slate-600">
            <a
              href={organization.website}
              target="_blank"
              rel="noreferrer"
              className="rounded text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
            >
              {organization.website}
            </a>
          </p>
        )}
        <Link
          href="/organization/profile"
          className="mt-3 inline-block rounded text-sm text-slate-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
        >
          {t("editProfile")}
        </Link>
      </Card>

      <Card>
        <h2 className="text-sm font-medium text-slate-500">{t("searchTitle")}</h2>
        <p className="mt-2 text-sm text-slate-600">{t("searchSubtitle")}</p>
        <Link
          href="/organization/search"
          className="mt-3 inline-block rounded text-sm font-medium text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
        >
          {t("searchCta")}
        </Link>
      </Card>

      <Card className="border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-600">{t("comingSoon")}</p>
      </Card>
    </div>
  );
}
