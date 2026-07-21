import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { TrainingForm } from "@/components/features/training/training-form";

export default async function NewTrainingPage() {
  const t = await getTranslations("NewTrainingPage");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <Card>
        <TrainingForm mode="create" />
      </Card>
    </div>
  );
}
