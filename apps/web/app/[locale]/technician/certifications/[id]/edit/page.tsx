import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { CertificationForm } from "@/components/features/certification/certification-form";

function toDateInputValue(date: Date | null) {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

interface EditCertificationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCertificationPage({ params }: EditCertificationPageProps) {
  const t = await getTranslations("EditCertificationPage");
  const { id } = await params;
  const session = await auth();

  const [profile, certifications] = await Promise.all([
    prisma.technicianProfile.findUnique({ where: { userId: session!.user.id } }),
    prisma.certification.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, standardRef: true, category: true },
    }),
  ]);

  const entry = await prisma.technicianCertification.findUnique({ where: { id } });

  if (!profile || !entry || entry.technicianId !== profile.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <Card>
        <CertificationForm
          certifications={certifications}
          mode="edit"
          certificationRecordId={entry.id}
          existingDocumentId={entry.documentId}
          defaults={{
            certificationId: entry.certificationId,
            issueDate: toDateInputValue(entry.issueDate),
            expiryDate: toDateInputValue(entry.expiryDate),
            weldingProcess: entry.weldingProcess,
            materialType: entry.materialType,
            materialGroup: entry.materialGroup,
            qualifiedThickness: entry.qualifiedThickness,
            qualifiedDiameter: entry.qualifiedDiameter,
            weldingPosition: entry.weldingPosition,
            jointType: entry.jointType,
            fillerMetal: entry.fillerMetal,
            shieldingGas: entry.shieldingGas,
          }}
        />
      </Card>
    </div>
  );
}
