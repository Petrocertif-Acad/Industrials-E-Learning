import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { RegisterOrganizationForm } from "@/components/features/auth/register-organization-form";

// Sans vérification d'authentification (page publique), Next.js tenterait
// sinon de pré-rendre cette page statiquement au moment du build — donc
// d'exécuter la requête Prisma sans base de données disponible.
export const dynamic = "force-dynamic";

export default async function RegisterOrganizationPage() {
  const countries = await prisma.country.findMany({
    orderBy: { nameFr: "asc" },
    select: { id: true, nameFr: true },
  });

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">
          Créer mon compte entreprise
        </h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Gratuit. Recherchez et évaluez des techniciens vérifiés.
        </p>
        <Card>
          <RegisterOrganizationForm countries={countries} />
        </Card>
        <p className="mt-4 text-center text-sm text-slate-600">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-medium text-slate-900 hover:underline">
            Se connecter
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-600">
          Vous êtes technicien ?{" "}
          <Link href="/register" className="font-medium text-slate-900 hover:underline">
            Créer un profil technicien
          </Link>
        </p>
      </div>
    </div>
  );
}
