import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { CertificationForm } from "@/components/features/certification/certification-form";

export default async function NewCertificationPage() {
  const t = await getTranslations("NewCertificationPage");
  const certifications = await prisma.certification.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, standardRef: true, category: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <Card>
        <CertificationForm certifications={certifications} mode="create" />
      </Card>
    </div>
  );
}
