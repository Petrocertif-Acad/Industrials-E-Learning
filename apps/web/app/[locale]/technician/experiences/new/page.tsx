import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { ExperienceForm } from "@/components/features/experience/experience-form";

export default async function NewExperiencePage() {
  const countries = await prisma.country.findMany({
    orderBy: { nameFr: "asc" },
    select: { id: true, nameFr: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Ajouter une expérience</h1>
      <Card>
        <ExperienceForm countries={countries} mode="create" />
      </Card>
    </div>
  );
}
