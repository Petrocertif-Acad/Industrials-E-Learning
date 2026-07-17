import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { ProfileBasicsForm } from "@/components/features/profile/profile-basics-form";

export default async function TechnicianProfilePage() {
  const session = await auth();

  const [profile, trades, countries] = await Promise.all([
    prisma.technicianProfile.findUnique({
      where: { userId: session!.user.id },
      include: { secondaryTrades: true },
    }),
    // Seuls les métiers "feuilles" (sans sous-métier) sont sélectionnables : les
    // métiers parents (ex. "Soudage industriel") ne servent qu'à regrouper leurs
    // déclinaisons (ex. "Soudeur GTAW") et ne sont pas eux-mêmes un métier précis.
    prisma.trade.findMany({
      where: { childTrades: { none: {} } },
      orderBy: { nameFr: "asc" },
      select: { id: true, nameFr: true, category: true },
    }),
    prisma.country.findMany({
      orderBy: { nameFr: "asc" },
      select: { id: true, nameFr: true },
    }),
  ]);

  if (!profile) {
    return <p className="text-slate-600">Profil introuvable.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ces informations déterminent votre visibilité dans les résultats de recherche des
          entreprises.
        </p>
      </div>

      <Card>
        <ProfileBasicsForm
          trades={trades}
          countries={countries}
          defaults={{
            primaryTradeId: profile.primaryTradeId,
            secondaryTradeIds: profile.secondaryTrades.map((t) => t.tradeId),
            countryId: profile.countryId,
            city: profile.city,
            yearsExperience: profile.yearsExperience,
            availability: profile.availability,
            mobilityScope: profile.mobilityScope,
          }}
        />
      </Card>
    </div>
  );
}
