// Données de démonstration — toutes les personnes, entreprises et documents
// listés ici sont fictifs et destinés uniquement au développement local.
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const DEMO_PASSWORD_HASH = await bcrypt.hash("Demo1234!", 12);

  const [morocco, ivoryCoast, southAfrica] = await Promise.all([
    prisma.country.upsert({
      where: { isoCode: "MA" },
      update: {},
      create: { isoCode: "MA", nameFr: "Maroc", nameEn: "Morocco" },
    }),
    prisma.country.upsert({
      where: { isoCode: "CI" },
      update: {},
      create: { isoCode: "CI", nameFr: "Côte d'Ivoire", nameEn: "Ivory Coast" },
    }),
    prisma.country.upsert({
      where: { isoCode: "ZA" },
      update: {},
      create: { isoCode: "ZA", nameFr: "Afrique du Sud", nameEn: "South Africa" },
    }),
  ]);
  void ivoryCoast;
  void southAfrica;

  const welding = await prisma.trade.upsert({
    where: { slug: "welding" },
    update: {},
    create: {
      slug: "welding",
      nameFr: "Soudage industriel",
      nameEn: "Industrial welding",
      category: "WELDING",
    },
  });

  const weldingGtaw = await prisma.trade.upsert({
    where: { slug: "welder-gtaw" },
    update: {},
    create: {
      slug: "welder-gtaw",
      nameFr: "Soudeur GTAW",
      nameEn: "GTAW welder",
      category: "WELDING",
      parentTradeId: welding.id,
    },
  });

  await prisma.trade.upsert({
    where: { slug: "piping" },
    update: {},
    create: {
      slug: "piping",
      nameFr: "Tuyauterie industrielle",
      nameEn: "Industrial piping",
      category: "PIPING",
    },
  });

  const readingIsometrics = await prisma.skill.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      tradeId: weldingGtaw.id,
      nameFr: "Lecture de plans de soudage",
      nameEn: "Welding blueprint reading",
    },
  });

  const gtawCertification = await prisma.certification.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      name: "Qualification de soudeur ISO 9606-1",
      issuingBody: "Organisme de certification (démonstration)",
      standardRef: "ISO 9606-1",
      category: "WELDING",
    },
  });

  // Compte administrateur de démonstration
  await prisma.user.upsert({
    where: { email: "demo.admin@atti.example" },
    update: {},
    create: {
      email: "demo.admin@atti.example",
      passwordHash: DEMO_PASSWORD_HASH,
      role: "ADMIN",
      locale: "FR",
    },
  });

  // Technicien de démonstration
  const technicianUser = await prisma.user.upsert({
    where: { email: "demo.technicien@atti.example" },
    update: {},
    create: {
      email: "demo.technicien@atti.example",
      passwordHash: DEMO_PASSWORD_HASH,
      role: "TECHNICIAN",
      locale: "FR",
      technicianProfile: {
        create: {
          firstName: "Amina (démo)",
          lastName: "Fictive",
          primaryTradeId: weldingGtaw.id,
          countryId: morocco.id,
          city: "Casablanca",
          yearsExperience: 7,
          availability: "AVAILABLE",
          mobilityScope: "INTERNATIONAL",
          verificationStatus: "PARTIALLY_VERIFIED",
        },
      },
    },
    include: { technicianProfile: true },
  });

  if (technicianUser.technicianProfile) {
    await prisma.technicianSkill.upsert({
      where: {
        technicianId_skillId: {
          technicianId: technicianUser.technicianProfile.id,
          skillId: readingIsometrics.id,
        },
      },
      update: {},
      create: {
        technicianId: technicianUser.technicianProfile.id,
        skillId: readingIsometrics.id,
        selfLevel: "ADVANCED",
        reliabilityCoefficient: 0.4,
      },
    });

    await prisma.technicianCertification.upsert({
      where: { id: "00000000-0000-0000-0000-000000000020" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000020",
        technicianId: technicianUser.technicianProfile.id,
        certificationId: gtawCertification.id,
        issueDate: new Date("2022-03-01"),
        expiryDate: new Date("2026-03-01"),
        verificationStatus: "DECLARED",
        weldingProcess: "GTAW",
        materialType: "Acier inoxydable",
      },
    });
  }

  // Entreprise de démonstration
  const demoOrg = await prisma.organization.upsert({
    where: { id: "00000000-0000-0000-0000-000000000030" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000030",
      name: "Industrials Demo SARL (démonstration)",
      type: "COMPANY",
      countryId: morocco.id,
      verificationStatus: "VERIFIED",
    },
  });

  const orgUser = await prisma.user.upsert({
    where: { email: "demo.entreprise@atti.example" },
    update: {},
    create: {
      email: "demo.entreprise@atti.example",
      passwordHash: DEMO_PASSWORD_HASH,
      role: "ORGANIZATION",
      locale: "FR",
    },
  });

  await prisma.organizationMember.upsert({
    where: { userId_organizationId: { userId: orgUser.id, organizationId: demoOrg.id } },
    update: {},
    create: { userId: orgUser.id, organizationId: demoOrg.id, role: "OWNER" },
  });

  console.log("Seed terminé. Comptes de démonstration (mot de passe: Demo1234!) :");
  console.log("  - demo.admin@atti.example (ADMIN)");
  console.log("  - demo.technicien@atti.example (TECHNICIAN)");
  console.log("  - demo.entreprise@atti.example (ORGANIZATION)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
