"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions";
import { getOwnTechnicianProfile } from "@/lib/technician";
import { technicianCertificationSchema, type TechnicianCertificationInput } from "@/lib/validation/certification";
import { buildDocumentStorageKey, deleteDocumentObject, uploadDocumentObject, validateDocumentFile } from "@/lib/storage/s3";
import { recalculateTechnicianScore } from "@/lib/score";

export interface CertificationFormState {
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
    certificationId: formData.get("certificationId"),
    issueDate: (formData.get("issueDate") as string) || undefined,
    expiryDate: (formData.get("expiryDate") as string) || undefined,
    weldingProcess: formData.get("weldingProcess"),
    materialType: formData.get("materialType"),
    materialGroup: formData.get("materialGroup"),
    qualifiedThickness: formData.get("qualifiedThickness"),
    qualifiedDiameter: formData.get("qualifiedDiameter"),
    weldingPosition: formData.get("weldingPosition"),
    jointType: formData.get("jointType"),
    fillerMetal: formData.get("fillerMetal"),
    shieldingGas: formData.get("shieldingGas"),
  };
}

function toWeldingFieldsData(data: TechnicianCertificationInput) {
  return {
    weldingProcess: data.weldingProcess || null,
    materialType: data.materialType || null,
    materialGroup: data.materialGroup || null,
    qualifiedThickness: data.qualifiedThickness || null,
    qualifiedDiameter: data.qualifiedDiameter || null,
    weldingPosition: data.weldingPosition || null,
    jointType: data.jointType || null,
    fillerMetal: data.fillerMetal || null,
    shieldingGas: data.shieldingGas || null,
  };
}

async function uploadCertificationDocument(technicianId: string, ownerId: string, file: File) {
  const validationError = validateDocumentFile(file);
  if (validationError) return { error: validationError } as const;

  const storageKey = buildDocumentStorageKey(technicianId, "certifications", file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadDocumentObject(storageKey, buffer, file.type);

  return {
    document: {
      ownerId,
      technicianId,
      type: "CERTIFICATION_PROOF" as const,
      storageKey,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      verificationStatus: "UNDER_REVIEW" as const,
    },
  } as const;
}

export async function createTechnicianCertificationAction(
  _prevState: CertificationFormState,
  formData: FormData
): Promise<CertificationFormState> {
  const { user, profile } = await requireOwnTechnicianProfile();

  const parsed = technicianCertificationSchema.safeParse(readFormInput(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const file = formData.get("document");
  let documentData: Awaited<ReturnType<typeof uploadCertificationDocument>>["document"] | undefined;

  if (file instanceof File && file.size > 0) {
    const result = await uploadCertificationDocument(profile.id, user.id, file);
    if ("error" in result) return { error: result.error };
    documentData = result.document;
  }

  const certification = await prisma.$transaction(async (tx) => {
    const document = documentData ? await tx.document.create({ data: documentData }) : null;
    return tx.technicianCertification.create({
      data: {
        technicianId: profile.id,
        certificationId: parsed.data.certificationId,
        issueDate: parsed.data.issueDate,
        expiryDate: parsed.data.expiryDate,
        documentId: document?.id,
        verificationStatus: "DECLARED",
        ...toWeldingFieldsData(parsed.data),
      },
    });
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "technician_certification.created",
      targetType: "TechnicianCertification",
      targetId: certification.id,
    },
  });

  await recalculateTechnicianScore(profile.id);

  revalidatePath("/technician/certifications");
  revalidatePath("/technician/dashboard");
  redirect("/technician/certifications?saved=1");
}

export async function updateTechnicianCertificationAction(
  _prevState: CertificationFormState,
  formData: FormData
): Promise<CertificationFormState> {
  const { user, profile } = await requireOwnTechnicianProfile();

  const certificationRecordId = String(formData.get("id") ?? "");
  const existing = await prisma.technicianCertification.findUnique({ where: { id: certificationRecordId } });
  if (!existing || existing.technicianId !== profile.id) {
    return { error: "Certification introuvable." };
  }

  const parsed = technicianCertificationSchema.safeParse(readFormInput(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const file = formData.get("document");
  let documentData: Awaited<ReturnType<typeof uploadCertificationDocument>>["document"] | undefined;

  if (file instanceof File && file.size > 0) {
    const result = await uploadCertificationDocument(profile.id, user.id, file);
    if ("error" in result) return { error: result.error };
    documentData = result.document;
  }

  // La suppression de l'ancien objet S3 est différée après la validation de
  // la transaction : on ne détruit jamais un fichier réel tant que le nouvel
  // état n'est pas garanti persisté en base.
  let previousStorageKeyToDelete: string | undefined;

  await prisma.$transaction(async (tx) => {
    let documentId = existing.documentId;

    if (documentData) {
      const newDocument = await tx.document.create({ data: documentData });
      if (existing.documentId) {
        const oldDocument = await tx.document.findUnique({ where: { id: existing.documentId } });
        // ON DELETE SET NULL sur TechnicianCertification.documentId : pas besoin
        // de détacher la référence manuellement avant de supprimer le document.
        await tx.document.delete({ where: { id: existing.documentId } });
        previousStorageKeyToDelete = oldDocument?.storageKey;
      }
      documentId = newDocument.id;
    }

    await tx.technicianCertification.update({
      where: { id: existing.id },
      data: {
        certificationId: parsed.data.certificationId,
        issueDate: parsed.data.issueDate,
        expiryDate: parsed.data.expiryDate,
        documentId,
        ...toWeldingFieldsData(parsed.data),
      },
    });
  });

  if (previousStorageKeyToDelete) {
    await deleteDocumentObject(previousStorageKeyToDelete);
  }

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "technician_certification.updated",
      targetType: "TechnicianCertification",
      targetId: existing.id,
    },
  });

  await recalculateTechnicianScore(profile.id);

  revalidatePath("/technician/certifications");
  revalidatePath("/technician/dashboard");
  redirect("/technician/certifications?saved=1");
}

export async function deleteTechnicianCertificationAction(formData: FormData): Promise<void> {
  const { user, profile } = await requireOwnTechnicianProfile();

  const certificationRecordId = String(formData.get("id") ?? "");
  const existing = await prisma.technicianCertification.findUnique({ where: { id: certificationRecordId } });
  if (!existing || existing.technicianId !== profile.id) {
    return;
  }

  const documentId = existing.documentId;
  let storageKeyToDelete: string | undefined;

  await prisma.$transaction(async (tx) => {
    await tx.technicianCertification.delete({ where: { id: existing.id } });
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
      action: "technician_certification.deleted",
      targetType: "TechnicianCertification",
      targetId: certificationRecordId,
    },
  });

  await recalculateTechnicianScore(profile.id);

  revalidatePath("/technician/certifications");
  revalidatePath("/technician/dashboard");
}
