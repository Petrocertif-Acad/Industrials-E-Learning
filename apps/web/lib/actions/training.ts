"use server";

import { redirectLocalized } from "@/lib/redirect";
import { revalidateLocalizedPath } from "@/lib/revalidate";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions";
import { getOwnTechnicianProfile } from "@/lib/technician";
import { trainingSchema } from "@/lib/validation/training";
import { buildDocumentStorageKey, deleteDocumentObject, uploadDocumentObject, validateDocumentFile } from "@/lib/storage/s3";
import { recalculateTechnicianScore } from "@/lib/score";

export interface TrainingFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

async function requireOwnTechnicianProfile() {
  const user = await requireUser();
  if (user.role !== "TECHNICIAN") {
    throw new Error("Action réservée aux comptes technicien.");
  }
  const profile = await getOwnTechnicianProfile(user.id);
  if (!profile) {
    throw new Error("Profil introuvable.");
  }
  return { user, profile };
}

function readFormInput(formData: FormData) {
  return {
    title: formData.get("title"),
    provider: formData.get("provider"),
    category: (formData.get("category") as string) || undefined,
    hours: (formData.get("hours") as string) || undefined,
    completionDate: formData.get("completionDate"),
    description: formData.get("description"),
  };
}

async function uploadTrainingDocument(technicianId: string, ownerId: string, file: File) {
  const validationError = validateDocumentFile(file);
  if (validationError) return { error: validationError } as const;

  const storageKey = buildDocumentStorageKey(technicianId, "trainings", file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadDocumentObject(storageKey, buffer, file.type);

  return {
    document: {
      ownerId,
      technicianId,
      type: "TRAINING_PROOF" as const,
      storageKey,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      verificationStatus: "UNDER_REVIEW" as const,
    },
  } as const;
}

export async function createTrainingAction(
  _prevState: TrainingFormState,
  formData: FormData
): Promise<TrainingFormState> {
  const { user, profile } = await requireOwnTechnicianProfile();

  const parsed = trainingSchema.safeParse(readFormInput(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const file = formData.get("document");
  let documentData: Awaited<ReturnType<typeof uploadTrainingDocument>>["document"] | undefined;

  if (file instanceof File && file.size > 0) {
    const result = await uploadTrainingDocument(profile.id, user.id, file);
    if ("error" in result) return { error: result.error };
    documentData = result.document;
  }

  const training = await prisma.$transaction(async (tx) => {
    const document = documentData ? await tx.document.create({ data: documentData }) : null;
    return tx.technicianTraining.create({
      data: {
        technicianId: profile.id,
        title: parsed.data.title,
        provider: parsed.data.provider,
        category: parsed.data.category,
        hours: parsed.data.hours,
        completionDate: parsed.data.completionDate,
        description: parsed.data.description || null,
        documentId: document?.id,
        verificationStatus: "DECLARED",
      },
    });
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "technician_training.created",
      targetType: "TechnicianTraining",
      targetId: training.id,
    },
  });

  await recalculateTechnicianScore(profile.id);

  await revalidateLocalizedPath("/technician/trainings");
  await revalidateLocalizedPath("/technician/dashboard");
  return redirectLocalized("/technician/trainings?saved=1");
}

export async function updateTrainingAction(
  _prevState: TrainingFormState,
  formData: FormData
): Promise<TrainingFormState> {
  const { user, profile } = await requireOwnTechnicianProfile();

  const trainingId = String(formData.get("id") ?? "");
  const existing = await prisma.technicianTraining.findUnique({ where: { id: trainingId } });
  if (!existing || existing.technicianId !== profile.id) {
    return { error: "Formation introuvable." };
  }

  const parsed = trainingSchema.safeParse(readFormInput(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const file = formData.get("document");
  let documentData: Awaited<ReturnType<typeof uploadTrainingDocument>>["document"] | undefined;

  if (file instanceof File && file.size > 0) {
    const result = await uploadTrainingDocument(profile.id, user.id, file);
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

    await tx.technicianTraining.update({
      where: { id: existing.id },
      data: {
        title: parsed.data.title,
        provider: parsed.data.provider,
        category: parsed.data.category,
        hours: parsed.data.hours,
        completionDate: parsed.data.completionDate,
        description: parsed.data.description || null,
        documentId,
      },
    });
  });

  if (previousStorageKeyToDelete) {
    await deleteDocumentObject(previousStorageKeyToDelete);
  }

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "technician_training.updated",
      targetType: "TechnicianTraining",
      targetId: existing.id,
    },
  });

  await recalculateTechnicianScore(profile.id);

  await revalidateLocalizedPath("/technician/trainings");
  await revalidateLocalizedPath("/technician/dashboard");
  return redirectLocalized("/technician/trainings?saved=1");
}

export async function deleteTrainingAction(formData: FormData): Promise<void> {
  const { user, profile } = await requireOwnTechnicianProfile();

  const trainingId = String(formData.get("id") ?? "");
  const existing = await prisma.technicianTraining.findUnique({ where: { id: trainingId } });
  if (!existing || existing.technicianId !== profile.id) {
    return;
  }

  const documentId = existing.documentId;
  let storageKeyToDelete: string | undefined;

  await prisma.$transaction(async (tx) => {
    await tx.technicianTraining.delete({ where: { id: existing.id } });
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
      actorId: user.id,
      action: "technician_training.deleted",
      targetType: "TechnicianTraining",
      targetId: trainingId,
    },
  });

  await recalculateTechnicianScore(profile.id);

  await revalidateLocalizedPath("/technician/trainings");
  await revalidateLocalizedPath("/technician/dashboard");
}
