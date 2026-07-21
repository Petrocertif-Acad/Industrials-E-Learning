import Link from "next/link";
import { auth } from "@/auth";
import { getOwnOrganization } from "@/lib/organization";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ORG_VERIFICATION_LABELS: Record<string, string> = {
  PENDING: "Vérification en attente",
  VERIFIED: "Entreprise vérifiée",
  REJECTED: "Vérification rejetée",
};

const ORG_VERIFICATION_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
};

interface OrganizationDashboardPageProps {
  searchParams: Promise<{ updated?: string }>;
}

export default async function OrganizationDashboardPage({ searchParams }: OrganizationDashboardPageProps) {
  const { updated } = await searchParams;
  const session = await auth();
  const organization = await getOwnOrganization(session!.user.id);

  if (!organization) {
    return <p className="text-slate-600">Organisation introuvable.</p>;
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
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Vos informations ont été enregistrées.
        </p>
      )}

      <Card>
        <h2 className="text-sm font-medium text-slate-500">Localisation</h2>
        <p className="mt-2 text-lg font-medium">{organization.country.nameFr}</p>
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
          Modifier le profil entreprise
        </Link>
      </Card>

      <Card className="border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-600">
          La recherche de techniciens, les viviers et les missions arrivent dans un prochain
          module. Votre compte entreprise est prêt à les recevoir.
        </p>
      </Card>
    </div>
  );
}
