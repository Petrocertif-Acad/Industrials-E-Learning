import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { localizedName } from "@/lib/localized-name";
import { Card } from "@/components/ui/card";
import { ExperienceForm } from "@/components/features/experience/experience-form";

function toDateInputValue(date: Date | null) {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

interface EditExperiencePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({ params }: EditExperiencePageProps) {
  const t = await getTranslations("EditExperiencePage");
  const locale = await getLocale();
  const { id } = await params;
  const session = await auth();

  const [profile, countriesData] = await Promise.all([
    prisma.technicianProfile.findUnique({ where: { userId: session!.user.id } }),
    prisma.country.findMany({ orderBy: { nameFr: "asc" }, select: { id: true, nameFr: true, nameEn: true } }),
  ]);
  const countries = countriesData.map((country) => ({ id: country.id, name: localizedName(country, locale) }));

  const experience = await prisma.workExperience.findUnique({ where: { id } });

  if (!profile || !experience || experience.technicianId !== profile.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <Card>
        <ExperienceForm
          countries={countries}
          mode="edit"
          experienceId={experience.id}
          defaults={{
            projectName: experience.projectName,
            employer: experience.employer,
            client: experience.client,
            countryId: experience.countryId,
            sector: experience.sector,
            role: experience.role,
            startDate: toDateInputValue(experience.startDate)!,
            endDate: toDateInputValue(experience.endDate),
            description: experience.description,
            equipmentUsed: experience.equipmentUsed,
            materialsWorked: experience.materialsWorked,
            processesApplied: experience.processesApplied,
            standardsUsed: experience.standardsUsed,
            responsibilities: experience.responsibilities,
            referenceContact: experience.referenceContact,
          }}
        />
      </Card>
    </div>
  );
}
