import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { localizedName } from "@/lib/localized-name";
import { Card } from "@/components/ui/card";
import { SkillsForm } from "@/components/features/profile/skills-form";

export default async function TechnicianSkillsPage() {
  const t = await getTranslations("TechnicianSkillsPage");
  const tCommon = await getTranslations("Common");
  const locale = await getLocale();
  const session = await auth();

  const [profile, skills] = await Promise.all([
    prisma.technicianProfile.findUnique({
      where: { userId: session!.user.id },
      include: { skills: true },
    }),
    prisma.skill.findMany({
      orderBy: { nameFr: "asc" },
      select: { id: true, nameFr: true, nameEn: true, trade: { select: { nameFr: true, nameEn: true } } },
    }),
  ]);

  if (!profile) {
    return <p className="text-slate-600">{tCommon("profileNotFound")}</p>;
  }

  const currentLevels = Object.fromEntries(profile.skills.map((s) => [s.skillId, s.selfLevel]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
      </div>

      <Card>
        <SkillsForm
          skills={skills.map((s) => ({
            id: s.id,
            name: localizedName(s, locale),
            tradeName: localizedName(s.trade, locale),
          }))}
          currentLevels={currentLevels}
        />
      </Card>
    </div>
  );
}
