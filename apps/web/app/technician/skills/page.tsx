import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { SkillsForm } from "@/components/features/profile/skills-form";

export default async function TechnicianSkillsPage() {
  const session = await auth();

  const [profile, skills] = await Promise.all([
    prisma.technicianProfile.findUnique({
      where: { userId: session!.user.id },
      include: { skills: true },
    }),
    prisma.skill.findMany({
      orderBy: { nameFr: "asc" },
      select: { id: true, nameFr: true, trade: { select: { nameFr: true } } },
    }),
  ]);

  if (!profile) {
    return <p className="text-slate-600">Profil introuvable.</p>;
  }

  const currentLevels = Object.fromEntries(profile.skills.map((s) => [s.skillId, s.selfLevel]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mes compétences</h1>
        <p className="mt-1 text-sm text-slate-600">
          Déclarez vos compétences et votre niveau. Elles seront prises en compte dans votre
          score une fois vérifiées.
        </p>
      </div>

      <Card>
        <SkillsForm
          skills={skills.map((s) => ({ id: s.id, nameFr: s.nameFr, tradeNameFr: s.trade.nameFr }))}
          currentLevels={currentLevels}
        />
      </Card>
    </div>
  );
}
