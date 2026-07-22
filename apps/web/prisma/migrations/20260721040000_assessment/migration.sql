-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'ASSESSMENT_REPORT';

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "skillId" TEXT,
    "title" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "evaluatorName" TEXT NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "documentId" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_documentId_key" ON "Assessment"("documentId");

-- CreateIndex
CREATE INDEX "Assessment_technicianId_idx" ON "Assessment"("technicianId");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

