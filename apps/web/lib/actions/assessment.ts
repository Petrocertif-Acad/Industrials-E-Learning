"use server";

import { revalidateLocalizedPath } from "@/lib/revalidate";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/permissions";
import { UserRole } from "@/lib/generated/prisma/enums";
import { assessmentSchema } from "@/lib/validation/assessment";
import { buildDocumentStorageKey, deleteDocumentObject, uploadDocumentObject, validateDocumentFile } from "@/lib/storage/s3";
import { recalculateTechnicianScore } from "@/lib/score";

export interface AssessmentFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function readFormInput(formData: FormData) {
  return {
    technicianId: formData.get("technicianId"),
    skillId: (formData.get("skillId") as string) || undefined,
    title: formData.get("title"),
    score: formData.get("score"),
    evaluatorName: formData.get("evaluatorName"),
    assessedAt: formData.get("assessedAt"),
    notes: formData.get("notes"),
  };
}

async function uploadAssessmentDocument(technicianId: string, ownerId: string, file: File) {
  const validationError = validateDocumentFile(file);
  if (validationError) return { error: validationError } as const;

  const storageKey = buildDocumentStorageKey(technicianId, "assessments", file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadDocumentObject(storageKey, buffer, file.type);

  return {
    document: {
      ownerId,
      technicianId,
      type: "ASSESSMENT_REPORT" as const,
      storageKey,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      verificationStatus: "VERIFIED" as const,
    },
  } as const;
}

export async function createAssessmentAction(
  _prevState: AssessmentFormState,
  formData: FormData
): Promise<AssessmentFormState> {
  const admin = await requireRole(UserRole.ADMIN);

  const parsed = assessmentSchema.safeParse(readFormInput(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const technician = await prisma.technicianProfile.findUnique({ where: { id: parsed.data.technicianId } });
  if (!technician) {
    return { error: "Technicien introuvable." };
  }

  const file = formData.get("document");
  let documentData: Awaited<ReturnType<typeof uploadAssessmentDocument>>["document"] | undefined;

  if (file instanceof File && file.size > 0) {
    const result = await uploadAssessmentDocument(parsed.data.technicianId, admin.id, file);
    if ("error" in result) return { error: result.error };
    documentData = result.document;
  }

  const assessment = await prisma.$transaction(async (tx) => {
    const document = documentData ? await tx.document.create({ data: documentData }) : null;
    return tx.assessment.create({
      data: {
        technicianId: parsed.data.technicianId,
        skillId: parsed.data.skillId,
        title: parsed.data.title,
        score: parsed.data.score,
        evaluatorName: parsed.data.evaluatorName,
        assessedAt: parsed.data.assessedAt,
        notes: parsed.data.notes || null,
        documentId: document?.id,
        recordedById: admin.id,
      },
    });
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "assessment.created",
      targetType: "Assessment",
      targetId: assessment.id,
    },
  });

  await recalculateTechnicianScore(parsed.data.technicianId);

  await revalidateLocalizedPath(`/technicians/${parsed.data.technicianId}`);
  return {};
}

export async function updateAssessmentAction(
  _prevState: AssessmentFormState,
  formData: FormData
): Promise<AssessmentFormState> {
  const admin = await requireRole(UserRole.ADMIN);

  const assessmentId = String(formData.get("id") ?? "");
  const existing = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!existing) {
    return { error: "Évaluation introuvable." };
  }

  const parsed = assessmentSchema.safeParse(readFormInput(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const file = formData.get("document");
  let documentData: Awaited<ReturnType<typeof uploadAssessmentDocument>>["document"] | undefined;

  if (file instanceof File && file.size > 0) {
    // Le technicien d'une évaluation ne change jamais à l'édition : on utilise
    // `existing.technicianId`, jamais la valeur soumise dans le formulaire.
    const result = await uploadAssessmentDocument(existing.technicianId, admin.id, file);
    if ("error" in result) return { error: result.error };
    documentData = result.document;
  }

  let previousStorageKeyToDelete: string | undefined;

  await prisma.$transaction(async (tx) => {
    let documentId = existing.documentId;

    if (documentData) {
      const newDocument = await tx.document.create({ data: documentData });
      if (existing.documentId) {
        const oldDocument = await tx.document.findUnique({ where: { id: existing.documentId } });
        await tx.document.delete({ where: { id: existing.documentId } });
        previousStorageKeyToDelete = oldDocument?.storageKey;
      }
      documentId = newDocument.id;
    }

    await tx.assessment.update({
      where: { id: existing.id },
      data: {
        skillId: parsed.data.skillId,
        title: parsed.data.title,
        score: parsed.data.score,
        evaluatorName: parsed.data.evaluatorName,
        assessedAt: parsed.data.assessedAt,
        notes: parsed.data.notes || null,
        documentId,
      },
    });
  });

  if (previousStorageKeyToDelete) {
    await deleteDocumentObject(previousStorageKeyToDelete);
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "assessment.updated",
      targetType: "Assessment",
      targetId: existing.id,
    },
  });

  await recalculateTechnicianScore(existing.technicianId);

  await revalidateLocalizedPath(`/technicians/${existing.technicianId}`);
  return {};
}

export async function deleteAssessmentAction(formData: FormData): Promise<void> {
  const admin = await requireRole(UserRole.ADMIN);

  const assessmentId = String(formData.get("id") ?? "");
  const existing = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!existing) return;

  const documentId = existing.documentId;
  let storageKeyToDelete: string | undefined;

  await prisma.$transaction(async (tx) => {
    await tx.assessment.delete({ where: { id: existing.id } });
    if (documentId) {
      const document = await tx.document.findUnique({ where: { id: documentId } });
      if (document) {
        await tx.document.delete({ where: { id: documentId } });
        storageKeyToDelete = document.storageKey;
      }
    }
  });

  if (storageKeyToDelete) {
    await deleteDocumentObject(storageKeyToDelete);
  }

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "assessment.deleted",
      targetType: "Assessment",
      targetId: assessmentId,
    },
  });

  await recalculateTechnicianScore(existing.technicianId);

  await revalidateLocalizedPath(`/technicians/${existing.technicianId}`);
}
