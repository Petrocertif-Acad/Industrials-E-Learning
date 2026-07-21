-- CreateTable
CREATE TABLE "EmployerReview" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "context" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployerReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployerReview_technicianId_idx" ON "EmployerReview"("technicianId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerReview_organizationId_technicianId_key" ON "EmployerReview"("organizationId", "technicianId");

-- AddForeignKey
ALTER TABLE "EmployerReview" ADD CONSTRAINT "EmployerReview_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerReview" ADD CONSTRAINT "EmployerReview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerReview" ADD CONSTRAINT "EmployerReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

