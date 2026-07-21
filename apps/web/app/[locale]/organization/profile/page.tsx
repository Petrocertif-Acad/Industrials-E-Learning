import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getOwnOrganization } from "@/lib/organization";
import { Card } from "@/components/ui/card";
import { OrganizationProfileForm } from "@/components/features/organization/organization-profile-form";

export default async function OrganizationProfilePage() {
  const session = await auth();

  const [organization, countries] = await Promise.all([
    getOwnOrganization(session!.user.id),
    prisma.country.findMany({ orderBy: { nameFr: "asc" }, select: { id: true, nameFr: true } }),
  ]);

  if (!organization) {
    return <p className="text-slate-600">Organisation introuvable.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profil entreprise</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ces informations sont visibles par les techniciens que vous contactez.
        </p>
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
