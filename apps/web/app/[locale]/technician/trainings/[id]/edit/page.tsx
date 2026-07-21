import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { TrainingForm } from "@/components/features/training/training-form";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

interface EditTrainingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTrainingPage({ params }: EditTrainingPageProps) {
  const t = await getTranslations("EditTrainingPage");
  const { id } = await params;
  const session = await auth();

  const profile = await prisma.technicianProfile.findUnique({ where: { userId: session!.user.id } });
  const training = await prisma.technicianTraining.findUnique({ where: { id } });

  if (!profile || !training || training.technicianId !== profile.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <Card>
        <TrainingForm
          mode="edit"
          trainingId={training.id}
          existingDocumentId={training.documentId}
          defaults={{
            title: training.title,
            provider: training.provider,
            category: training.category,
            hours: training.hours,
            completionDate: toDateInputValue(training.completionDate),
            description: training.description,
          }}
        />
      </Card>
    </div>
  );
}
