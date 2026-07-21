-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'TRAINING_PROOF';

-- CreateTable
CREATE TABLE "TechnicianTraining" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "category" "TradeCategory",
    "hours" INTEGER,
    "completionDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'DECLARED',
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicianTraining_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TechnicianTraining_documentId_key" ON "TechnicianTraining"("documentId");

-- CreateIndex
CREATE INDEX "TechnicianTraining_technicianId_idx" ON "TechnicianTraining"("technicianId");

-- CreateIndex
CREATE INDEX "TechnicianTraining_completionDate_idx" ON "TechnicianTraining"("completionDate");

-- AddForeignKey
ALTER TABLE "TechnicianTraining" ADD CONSTRAINT "TechnicianTraining_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianTraining" ADD CONSTRAINT "TechnicianTraining_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

