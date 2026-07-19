import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileBasicsForm } from "@/components/features/profile/profile-basics-form";

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

  const checklist = [
    { label: "Métier et pays renseignés", done: Boolean(profile.primaryTradeId && profile.countryId) },
    { label: "Au moins une compétence déclarée", done: profile._count.skills > 0 },
    { label: "Au moins une certification ajoutée", done: profile._count.certifications > 0 },
    { label: "Au moins une expérience professionnelle", done: profile._count.workExperiences > 0 },
  ];
  const completedCount = checklist.filter((item) => item.done).length;
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
            className="shrink-0 text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
          >
            Voir mon profil public ↗
          </Link>
        )}
      </div>

      <Card className="border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Complétude du profil</h2>
          <Badge tone={completedCount === checklist.length ? "success" : "neutral"}>
            {completedCount}/{checklist.length}
          </Badge>
        </div>
        <ul className="mt-3 space-y-1.5">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className={
                  item.done
                    ? "flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white"
                    : "flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] text-transparent"
                }
              >
                ✓
              </span>
              <span className={item.done ? "text-slate-700" : "text-slate-500"}>{item.label}</span>
            </li>
          ))}
        </ul>
      </Card>

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
