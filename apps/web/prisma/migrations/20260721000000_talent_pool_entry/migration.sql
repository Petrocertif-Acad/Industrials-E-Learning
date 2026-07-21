-- CreateTable
CREATE TABLE "TalentPoolEntry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "note" TEXT,
    "addedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentPoolEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalentPoolEntry_organizationId_idx" ON "TalentPoolEntry"("organizationId");

-- CreateIndex
CREATE INDEX "TalentPoolEntry_technicianId_idx" ON "TalentPoolEntry"("technicianId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentPoolEntry_organizationId_technicianId_key" ON "TalentPoolEntry"("organizationId", "technicianId");

-- AddForeignKey
ALTER TABLE "TalentPoolEntry" ADD CONSTRAINT "TalentPoolEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentPoolEntry" ADD CONSTRAINT "TalentPoolEntry_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentPoolEntry" ADD CONSTRAINT "TalentPoolEntry_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

