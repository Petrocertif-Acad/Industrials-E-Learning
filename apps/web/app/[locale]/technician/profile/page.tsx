import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { ProfileBasicsForm } from "@/components/features/profile/profile-basics-form";
import { ProfileCompleteness } from "@/components/features/technician/profile-completeness";
import { buildProfileCompletenessChecklist } from "@/lib/technician";

export default async function TechnicianProfilePage() {
  const session = await auth();

  const [profile, trades, countries] = await Promise.all([
    prisma.technicianProfile.findUnique({
      where: { userId: session!.user.id },
      include: {
        secondaryTrades: true,
        _count: { select: { skills: true, certifications: true, workExperiences: true } },
      },
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

  const checklist = buildProfileCompletenessChecklist({
    primaryTradeId: profile.primaryTradeId,
    countryId: profile.countryId,
    skillsCount: profile._count.skills,
    certificationsCount: profile._count.certifications,
    workExperiencesCount: profile._count.workExperiences,
  });
  const isPubliclyViewable = Boolean(profile.primaryTradeId && profile.countryId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
          <p className="mt-1 text-sm text-slate-600">
            Ces informations déterminent votre visibilité dans les résultats de recherche des
            entreprises.
          </p>
        </div>
        {isPubliclyViewable && (
          <Link
            href={`/technicians/${profile.id}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
          >
            Voir mon profil public ↗
          </Link>
        )}
      </div>

      <ProfileCompleteness items={checklist} />

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
            visibility: profile.visibility,
          }}
        />
      </Card>
    </div>
  );
}
