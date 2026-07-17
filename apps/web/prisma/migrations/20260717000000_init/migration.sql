-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TECHNICIAN', 'ORGANIZATION', 'ADMIN', 'TRAINING_CENTER', 'CERTIFICATION_BODY', 'EVALUATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('FR', 'EN');

-- CreateEnum
CREATE TYPE "TradeCategory" AS ENUM ('WELDING', 'BOILERMAKING', 'PIPING', 'METAL_STRUCTURES', 'MECHANICAL_MANUFACTURING', 'INDUSTRIAL_MAINTENANCE', 'QUALITY_CONTROL', 'NON_DESTRUCTIVE_TESTING', 'SUPERVISION', 'OTHER');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('NOT_ASSESSED', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'AVAILABLE_SOON', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "MobilityScope" AS ENUM ('LOCAL', 'NATIONAL', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "ProfileVerificationStatus" AS ENUM ('INCOMPLETE', 'DECLARED', 'IDENTITY_VERIFIED', 'DOCUMENTS_PENDING', 'PARTIALLY_VERIFIED', 'PROFESSIONALLY_VERIFIED', 'PREMIUM_VERIFIED', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC_LIMITED', 'PUBLIC_FULL');

-- CreateEnum
CREATE TYPE "LanguageProficiency" AS ENUM ('BASIC', 'CONVERSATIONAL', 'FLUENT', 'NATIVE');

-- CreateEnum
CREATE TYPE "DocumentVerificationStatus" AS ENUM ('DECLARED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('IDENTITY', 'CERTIFICATION_PROOF', 'EXPERIENCE_PROOF', 'PROFILE_PHOTO', 'OTHER');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('COMPANY', 'TRAINING_CENTER', 'CERTIFICATION_BODY');

-- CreateEnum
CREATE TYPE "OrganizationVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "locale" "Locale" NOT NULL DEFAULT 'FR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "isoCode" CHAR(2) NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "category" "TradeCategory" NOT NULL,
    "parentTradeId" TEXT,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicianSkill" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "selfLevel" "SkillLevel" NOT NULL DEFAULT 'NOT_ASSESSED',
    "verifiedLevel" "SkillLevel",
    "reliabilityCoefficient" DECIMAL(3,2) NOT NULL DEFAULT 0.4,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicianSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicianSecondaryTrade" (
    "technicianId" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,

    CONSTRAINT "TechnicianSecondaryTrade_pkey" PRIMARY KEY ("technicianId","tradeId")
);

-- CreateTable
CREATE TABLE "TechnicianProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "headline" TEXT,
    "bio" TEXT,
    "primaryTradeId" TEXT,
    "countryId" TEXT,
    "city" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "availability" "AvailabilityStatus" NOT NULL DEFAULT 'UNAVAILABLE',
    "mobilityScope" "MobilityScope" NOT NULL DEFAULT 'LOCAL',
    "verificationStatus" "ProfileVerificationStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "visibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC_LIMITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicianProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicianLanguage" (
    "technicianId" TEXT NOT NULL,
    "languageCode" VARCHAR(5) NOT NULL,
    "proficiency" "LanguageProficiency" NOT NULL,

    CONSTRAINT "TechnicianLanguage_pkey" PRIMARY KEY ("technicianId","languageCode")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "standardRef" TEXT,
    "category" "TradeCategory" NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicianCertification" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "documentId" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'DECLARED',
    "reliabilityCoefficient" DECIMAL(3,2) NOT NULL DEFAULT 0.4,
    "weldingProcess" TEXT,
    "materialType" TEXT,
    "materialGroup" TEXT,
    "qualifiedThickness" TEXT,
    "qualifiedDiameter" TEXT,
    "weldingPosition" TEXT,
    "jointType" TEXT,
    "fillerMetal" TEXT,
    "shieldingGas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicianCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkExperience" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "client" TEXT,
    "country" TEXT NOT NULL,
    "sector" TEXT,
    "role" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "equipmentUsed" TEXT,
    "materialsWorked" TEXT,
    "processesApplied" TEXT,
    "standardsUsed" TEXT,
    "responsibilities" TEXT,
    "referenceContact" TEXT,
    "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'DECLARED',
    "documentId" TEXT,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "technicianId" TEXT,
    "type" "DocumentType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "technicalScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "certificationScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "experienceScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "safetyScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "employabilityScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "continuousTrainingScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "mobilityScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "verificationScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "totalScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "calculationDetails" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreHistory" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "totalScore" DECIMAL(5,2) NOT NULL,
    "subScores" JSONB NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'COMPANY',
    "countryId" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "verificationStatus" "OrganizationVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Country_isoCode_key" ON "Country"("isoCode");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_slug_key" ON "Trade"("slug");

-- CreateIndex
CREATE INDEX "Trade_category_idx" ON "Trade"("category");

-- CreateIndex
CREATE INDEX "Skill_tradeId_idx" ON "Skill"("tradeId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicianSkill_technicianId_skillId_key" ON "TechnicianSkill"("technicianId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicianProfile_userId_key" ON "TechnicianProfile"("userId");

-- CreateIndex
CREATE INDEX "TechnicianProfile_primaryTradeId_idx" ON "TechnicianProfile"("primaryTradeId");

-- CreateIndex
CREATE INDEX "TechnicianProfile_countryId_idx" ON "TechnicianProfile"("countryId");

-- CreateIndex
CREATE INDEX "TechnicianProfile_verificationStatus_idx" ON "TechnicianProfile"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicianCertification_documentId_key" ON "TechnicianCertification"("documentId");

-- CreateIndex
CREATE INDEX "TechnicianCertification_technicianId_idx" ON "TechnicianCertification"("technicianId");

-- CreateIndex
CREATE INDEX "TechnicianCertification_certificationId_idx" ON "TechnicianCertification"("certificationId");

-- CreateIndex
CREATE INDEX "TechnicianCertification_expiryDate_idx" ON "TechnicianCertification"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "WorkExperience_documentId_key" ON "WorkExperience"("documentId");

-- CreateIndex
CREATE INDEX "WorkExperience_technicianId_idx" ON "WorkExperience"("technicianId");

-- CreateIndex
CREATE INDEX "Document_ownerId_idx" ON "Document"("ownerId");

-- CreateIndex
CREATE INDEX "Document_verificationStatus_idx" ON "Document"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Score_technicianId_key" ON "Score"("technicianId");

-- CreateIndex
CREATE INDEX "ScoreHistory_technicianId_snapshotAt_idx" ON "ScoreHistory"("technicianId", "snapshotAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "OrganizationMember"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_parentTradeId_fkey" FOREIGN KEY ("parentTradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianSkill" ADD CONSTRAINT "TechnicianSkill_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianSkill" ADD CONSTRAINT "TechnicianSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianSecondaryTrade" ADD CONSTRAINT "TechnicianSecondaryTrade_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianSecondaryTrade" ADD CONSTRAINT "TechnicianSecondaryTrade_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianProfile" ADD CONSTRAINT "TechnicianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianProfile" ADD CONSTRAINT "TechnicianProfile_primaryTradeId_fkey" FOREIGN KEY ("primaryTradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianProfile" ADD CONSTRAINT "TechnicianProfile_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianLanguage" ADD CONSTRAINT "TechnicianLanguage_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianCertification" ADD CONSTRAINT "TechnicianCertification_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianCertification" ADD CONSTRAINT "TechnicianCertification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicianCertification" ADD CONSTRAINT "TechnicianCertification_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreHistory" ADD CONSTRAINT "ScoreHistory_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "TechnicianProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

