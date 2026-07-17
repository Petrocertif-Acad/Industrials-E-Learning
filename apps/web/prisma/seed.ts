// Données de démonstration et référentiels de base — les comptes, entreprises et
// documents "démonstration" sont fictifs. Les métiers, compétences et pays sont
// un référentiel réel destiné à être complété (pas exhaustif : la liste des pays
// couvre les principaux marchés africains et les marchés de recrutement
// internationaux les plus pertinents pour la plateforme, pas les 195 pays du monde).
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { TradeCategory } from "../lib/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface CountrySeed {
  isoCode: string;
  nameFr: string;
  nameEn: string;
}

const COUNTRIES: CountrySeed[] = [
  // Afrique du Nord
  { isoCode: "MA", nameFr: "Maroc", nameEn: "Morocco" },
  { isoCode: "DZ", nameFr: "Algérie", nameEn: "Algeria" },
  { isoCode: "TN", nameFr: "Tunisie", nameEn: "Tunisia" },
  { isoCode: "EG", nameFr: "Égypte", nameEn: "Egypt" },
  { isoCode: "LY", nameFr: "Libye", nameEn: "Libya" },
  { isoCode: "SD", nameFr: "Soudan", nameEn: "Sudan" },
  // Afrique de l'Ouest
  { isoCode: "NG", nameFr: "Nigeria", nameEn: "Nigeria" },
  { isoCode: "GH", nameFr: "Ghana", nameEn: "Ghana" },
  { isoCode: "CI", nameFr: "Côte d'Ivoire", nameEn: "Ivory Coast" },
  { isoCode: "SN", nameFr: "Sénégal", nameEn: "Senegal" },
  { isoCode: "ML", nameFr: "Mali", nameEn: "Mali" },
  { isoCode: "BF", nameFr: "Burkina Faso", nameEn: "Burkina Faso" },
  { isoCode: "BJ", nameFr: "Bénin", nameEn: "Benin" },
  { isoCode: "TG", nameFr: "Togo", nameEn: "Togo" },
  { isoCode: "GN", nameFr: "Guinée", nameEn: "Guinea" },
  { isoCode: "MR", nameFr: "Mauritanie", nameEn: "Mauritania" },
  // Afrique centrale
  { isoCode: "CM", nameFr: "Cameroun", nameEn: "Cameroon" },
  { isoCode: "GA", nameFr: "Gabon", nameEn: "Gabon" },
  { isoCode: "CD", nameFr: "République démocratique du Congo", nameEn: "DR Congo" },
  { isoCode: "CG", nameFr: "Congo", nameEn: "Congo" },
  { isoCode: "TD", nameFr: "Tchad", nameEn: "Chad" },
  // Afrique de l'Est
  { isoCode: "KE", nameFr: "Kenya", nameEn: "Kenya" },
  { isoCode: "TZ", nameFr: "Tanzanie", nameEn: "Tanzania" },
  { isoCode: "UG", nameFr: "Ouganda", nameEn: "Uganda" },
  { isoCode: "ET", nameFr: "Éthiopie", nameEn: "Ethiopia" },
  { isoCode: "RW", nameFr: "Rwanda", nameEn: "Rwanda" },
  // Afrique australe
  { isoCode: "ZA", nameFr: "Afrique du Sud", nameEn: "South Africa" },
  { isoCode: "NA", nameFr: "Namibie", nameEn: "Namibia" },
  { isoCode: "BW", nameFr: "Botswana", nameEn: "Botswana" },
  { isoCode: "ZM", nameFr: "Zambie", nameEn: "Zambia" },
  { isoCode: "ZW", nameFr: "Zimbabwe", nameEn: "Zimbabwe" },
  { isoCode: "MZ", nameFr: "Mozambique", nameEn: "Mozambique" },
  { isoCode: "AO", nameFr: "Angola", nameEn: "Angola" },
  // Principaux marchés de recrutement internationaux
  { isoCode: "FR", nameFr: "France", nameEn: "France" },
  { isoCode: "BE", nameFr: "Belgique", nameEn: "Belgium" },
  { isoCode: "DE", nameFr: "Allemagne", nameEn: "Germany" },
  { isoCode: "GB", nameFr: "Royaume-Uni", nameEn: "United Kingdom" },
  { isoCode: "CA", nameFr: "Canada", nameEn: "Canada" },
  { isoCode: "SA", nameFr: "Arabie saoudite", nameEn: "Saudi Arabia" },
  { isoCode: "AE", nameFr: "Émirats arabes unis", nameEn: "United Arab Emirates" },
  { isoCode: "QA", nameFr: "Qatar", nameEn: "Qatar" },
];

interface TradeSeed {
  slug: string;
  nameFr: string;
  nameEn: string;
  category: TradeCategory;
  parentSlug?: string;
}

// L'ordre importe : un métier parent doit être listé avant ses métiers enfants.
const TRADES: TradeSeed[] = [
  // Soudage
  { slug: "welding", nameFr: "Soudage industriel", nameEn: "Industrial welding", category: "WELDING" },
  { slug: "welder-smaw", nameFr: "Soudeur SMAW", nameEn: "SMAW welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-gtaw", nameFr: "Soudeur GTAW", nameEn: "GTAW welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-gmaw", nameFr: "Soudeur GMAW", nameEn: "GMAW welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-fcaw", nameFr: "Soudeur FCAW", nameEn: "FCAW welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-saw", nameFr: "Soudeur SAW", nameEn: "SAW welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-oxyacetylene", nameFr: "Soudeur oxyacétylénique", nameEn: "Oxy-acetylene welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-pipeline", nameFr: "Soudeur de pipelines", nameEn: "Pipeline welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-structures", nameFr: "Soudeur de structures", nameEn: "Structural welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-tanks", nameFr: "Soudeur de réservoirs", nameEn: "Tank welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-aluminum", nameFr: "Soudeur aluminium", nameEn: "Aluminum welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-stainless", nameFr: "Soudeur inox", nameEn: "Stainless steel welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-high-pressure", nameFr: "Soudeur haute pression", nameEn: "High-pressure welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-orbital", nameFr: "Soudeur orbital", nameEn: "Orbital welder", category: "WELDING", parentSlug: "welding" },
  { slug: "welder-multi-process", nameFr: "Soudeur polyvalent", nameEn: "Multi-process welder", category: "WELDING", parentSlug: "welding" },

  // Tuyauterie
  { slug: "piping", nameFr: "Tuyauterie industrielle", nameEn: "Industrial piping", category: "PIPING" },
  { slug: "pipefitter-industrial", nameFr: "Tuyauteur industriel", nameEn: "Industrial pipefitter", category: "PIPING", parentSlug: "piping" },
  { slug: "pipefitter-high-pressure", nameFr: "Tuyauteur haute pression", nameEn: "High-pressure pipefitter", category: "PIPING", parentSlug: "piping" },
  { slug: "pipefitter-oil-gas", nameFr: "Tuyauteur pétrole et gaz", nameEn: "Oil & gas pipefitter", category: "PIPING", parentSlug: "piping" },
  { slug: "pipefitter-power-plant", nameFr: "Tuyauteur de centrale électrique", nameEn: "Power plant pipefitter", category: "PIPING", parentSlug: "piping" },
  { slug: "pipefitter-sanitary", nameFr: "Tuyauteur sanitaire", nameEn: "Sanitary pipefitter", category: "PIPING", parentSlug: "piping" },
  { slug: "piping-preparer", nameFr: "Préparateur en tuyauterie", nameEn: "Piping preparer", category: "PIPING", parentSlug: "piping" },
  { slug: "piping-erector", nameFr: "Monteur de tuyauterie", nameEn: "Piping erector", category: "PIPING", parentSlug: "piping" },
  { slug: "piping-supervisor", nameFr: "Superviseur tuyauterie", nameEn: "Piping supervisor", category: "PIPING", parentSlug: "piping" },

  // Chaudronnerie
  { slug: "boilermaking", nameFr: "Chaudronnerie industrielle", nameEn: "Industrial boilermaking", category: "BOILERMAKING" },
  { slug: "boilermaker-industrial", nameFr: "Chaudronnier industriel", nameEn: "Industrial boilermaker", category: "BOILERMAKING", parentSlug: "boilermaking" },
  { slug: "boilermaker-marker", nameFr: "Chaudronnier traceur", nameEn: "Boilermaker marker", category: "BOILERMAKING", parentSlug: "boilermaking" },
  { slug: "boilermaker-assembler", nameFr: "Chaudronnier assembleur", nameEn: "Boilermaker assembler", category: "BOILERMAKING", parentSlug: "boilermaking" },
  { slug: "boilermaker-maintenance", nameFr: "Chaudronnier de maintenance", nameEn: "Maintenance boilermaker", category: "BOILERMAKING", parentSlug: "boilermaking" },
  { slug: "boilermaker-aeronautical", nameFr: "Chaudronnier aéronautique", nameEn: "Aeronautical boilermaker", category: "BOILERMAKING", parentSlug: "boilermaking" },
  { slug: "boilermaker-naval", nameFr: "Chaudronnier naval", nameEn: "Naval boilermaker", category: "BOILERMAKING", parentSlug: "boilermaking" },
  { slug: "boilermaker-tanks", nameFr: "Chaudronnier de réservoirs", nameEn: "Tank boilermaker", category: "BOILERMAKING", parentSlug: "boilermaking" },
  { slug: "boilermaking-supervisor", nameFr: "Superviseur chaudronnerie", nameEn: "Boilermaking supervisor", category: "BOILERMAKING", parentSlug: "boilermaking" },

  // Structures métalliques
  { slug: "metal-construction", nameFr: "Construction métallique", nameEn: "Metal construction", category: "METAL_STRUCTURES" },
  { slug: "structural-erection", nameFr: "Montage de structures métalliques", nameEn: "Structural steel erection", category: "METAL_STRUCTURES" },

  // Autres familles de métiers
  { slug: "mechanical-manufacturing", nameFr: "Fabrication mécanique", nameEn: "Mechanical manufacturing", category: "MECHANICAL_MANUFACTURING" },
  { slug: "industrial-maintenance", nameFr: "Maintenance industrielle", nameEn: "Industrial maintenance", category: "INDUSTRIAL_MAINTENANCE" },
  { slug: "quality-control-inspection", nameFr: "Contrôle qualité et inspection", nameEn: "Quality control and inspection", category: "QUALITY_CONTROL" },
  { slug: "ndt", nameFr: "Contrôle non destructif", nameEn: "Non-destructive testing", category: "NON_DESTRUCTIVE_TESTING" },
  { slug: "industrial-supervision", nameFr: "Supervision de travaux industriels", nameEn: "Industrial works supervision", category: "SUPERVISION" },
  { slug: "other-technical-trades", nameFr: "Autres métiers techniques connexes", nameEn: "Other related technical trades", category: "OTHER" },
];

interface SkillSeed {
  slug: string;
  tradeSlug: string;
  nameFr: string;
  nameEn: string;
}

const SKILLS: SkillSeed[] = [
  // Rattachées à "welding" (compétences transverses au métier, indépendantes du procédé)
  { slug: "welding-blueprint-reading", tradeSlug: "welding", nameFr: "Lecture de plans de soudage", nameEn: "Welding blueprint reading" },
  { slug: "wps-interpretation", tradeSlug: "welding", nameFr: "Interprétation des WPS", nameEn: "WPS interpretation" },
  { slug: "visual-weld-inspection", tradeSlug: "welding", nameFr: "Contrôle visuel de soudure", nameEn: "Visual weld inspection" },
  { slug: "welding-parameter-setting", tradeSlug: "welding", nameFr: "Réglage des paramètres de soudage", nameEn: "Welding parameter setting" },
  { slug: "grinding-finishing", tradeSlug: "welding", nameFr: "Meulage et finition", nameEn: "Grinding and finishing" },
  { slug: "hot-work-safety", tradeSlug: "welding", nameFr: "Sécurité travaux à chaud", nameEn: "Hot work safety" },

  // Rattachées à "piping"
  { slug: "piping-blueprint-reading", tradeSlug: "piping", nameFr: "Lecture de plans", nameEn: "Blueprint reading" },
  { slug: "isometric-reading", tradeSlug: "piping", nameFr: "Lecture d'isométriques", nameEn: "Isometric drawing reading" },
  { slug: "spool-fabrication", tradeSlug: "piping", nameFr: "Fabrication de spools", nameEn: "Spool fabrication" },
  { slug: "dimension-calculation", tradeSlug: "piping", nameFr: "Calcul des cotes", nameEn: "Dimension calculation" },
  { slug: "flange-orientation", tradeSlug: "piping", nameFr: "Orientation des brides", nameEn: "Flange orientation" },
  { slug: "piping-marking", tradeSlug: "piping", nameFr: "Traçage", nameEn: "Marking" },
  { slug: "pipe-bending", tradeSlug: "piping", nameFr: "Cintrage", nameEn: "Pipe bending" },
  { slug: "piping-assembly", tradeSlug: "piping", nameFr: "Montage", nameEn: "Assembly" },
  { slug: "piping-alignment", tradeSlug: "piping", nameFr: "Alignement", nameEn: "Alignment" },
  { slug: "bolting", tradeSlug: "piping", nameFr: "Boulonnage", nameEn: "Bolting" },
  { slug: "pipe-supporting", tradeSlug: "piping", nameFr: "Supportage", nameEn: "Pipe supporting" },
  { slug: "piping-standards", tradeSlug: "piping", nameFr: "Utilisation des standards de tuyauterie", nameEn: "Piping standards usage" },

  // Rattachées à "boilermaking"
  { slug: "boilermaking-marking", tradeSlug: "boilermaking", nameFr: "Traçage", nameEn: "Marking" },
  { slug: "cutting-to-length", tradeSlug: "boilermaking", nameFr: "Débitage", nameEn: "Cutting to length" },
  { slug: "cutting", tradeSlug: "boilermaking", nameFr: "Découpage", nameEn: "Cutting" },
  { slug: "sheet-metal-bending", tradeSlug: "boilermaking", nameFr: "Pliage", nameEn: "Bending" },
  { slug: "rolling", tradeSlug: "boilermaking", nameFr: "Roulage", nameEn: "Rolling" },
  { slug: "forming", tradeSlug: "boilermaking", nameFr: "Formage", nameEn: "Forming" },
  { slug: "boilermaking-assembly", tradeSlug: "boilermaking", nameFr: "Assemblage", nameEn: "Assembly" },
  { slug: "boilermaking-blueprint-reading", tradeSlug: "boilermaking", nameFr: "Lecture de plans", nameEn: "Blueprint reading" },
  { slug: "pattern-development", tradeSlug: "boilermaking", nameFr: "Développement de formes", nameEn: "Pattern development" },
  { slug: "tank-fabrication", tradeSlug: "boilermaking", nameFr: "Fabrication de réservoirs", nameEn: "Tank fabrication" },
  { slug: "structure-fabrication", tradeSlug: "boilermaking", nameFr: "Fabrication de structures", nameEn: "Structure fabrication" },
  { slug: "dimensional-control", tradeSlug: "boilermaking", nameFr: "Contrôle dimensionnel", nameEn: "Dimensional control" },
];

async function seedCountries() {
  const countryIdByIsoCode = new Map<string, string>();
  for (const country of COUNTRIES) {
    const record = await prisma.country.upsert({
      where: { isoCode: country.isoCode },
      update: { nameFr: country.nameFr, nameEn: country.nameEn },
      create: country,
    });
    countryIdByIsoCode.set(country.isoCode, record.id);
  }
  return countryIdByIsoCode;
}

async function seedTrades() {
  const tradeIdBySlug = new Map<string, string>();
  for (const trade of TRADES) {
    const parentTradeId = trade.parentSlug ? tradeIdBySlug.get(trade.parentSlug) : undefined;
    const record = await prisma.trade.upsert({
      where: { slug: trade.slug },
      update: {
        nameFr: trade.nameFr,
        nameEn: trade.nameEn,
        category: trade.category,
        parentTradeId,
      },
      create: {
        slug: trade.slug,
        nameFr: trade.nameFr,
        nameEn: trade.nameEn,
        category: trade.category,
        parentTradeId,
      },
    });
    tradeIdBySlug.set(trade.slug, record.id);
  }
  return tradeIdBySlug;
}

async function seedSkills(tradeIdBySlug: Map<string, string>) {
  const skillIdBySlug = new Map<string, string>();
  for (const skill of SKILLS) {
    const tradeId = tradeIdBySlug.get(skill.tradeSlug);
    if (!tradeId) throw new Error(`Métier inconnu pour la compétence ${skill.slug}: ${skill.tradeSlug}`);
    const record = await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: { nameFr: skill.nameFr, nameEn: skill.nameEn, tradeId },
      create: { slug: skill.slug, nameFr: skill.nameFr, nameEn: skill.nameEn, tradeId },
    });
    skillIdBySlug.set(skill.slug, record.id);
  }
  return skillIdBySlug;
}

async function main() {
  const DEMO_PASSWORD_HASH = await bcrypt.hash("Demo1234!", 12);

  const countryIdByIsoCode = await seedCountries();
  const tradeIdBySlug = await seedTrades();
  const skillIdBySlug = await seedSkills(tradeIdBySlug);

  const moroccoId = countryIdByIsoCode.get("MA")!;
  const weldingGtawId = tradeIdBySlug.get("welder-gtaw")!;

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
          primaryTradeId: weldingGtawId,
          countryId: moroccoId,
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
    const technicianId = technicianUser.technicianProfile.id;

    await prisma.technicianSecondaryTrade.upsert({
      where: { technicianId_tradeId: { technicianId, tradeId: tradeIdBySlug.get("welder-stainless")! } },
      update: {},
      create: { technicianId, tradeId: tradeIdBySlug.get("welder-stainless")! },
    });

    const demoSkillSlugs = ["welding-blueprint-reading", "wps-interpretation", "visual-weld-inspection"];
    for (const slug of demoSkillSlugs) {
      const skillId = skillIdBySlug.get(slug)!;
      await prisma.technicianSkill.upsert({
        where: { technicianId_skillId: { technicianId, skillId } },
        update: {},
        create: { technicianId, skillId, selfLevel: "ADVANCED", reliabilityCoefficient: 0.4 },
      });
    }

    await prisma.technicianCertification.upsert({
      where: { id: "00000000-0000-0000-0000-000000000020" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000020",
        technicianId,
        certificationId: gtawCertification.id,
        issueDate: new Date("2022-03-01"),
        expiryDate: new Date("2026-03-01"),
        verificationStatus: "DECLARED",
        weldingProcess: "GTAW",
        materialType: "Acier inoxydable",
      },
    });

    await prisma.workExperience.upsert({
      where: { id: "00000000-0000-0000-0000-000000000040" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000040",
        technicianId,
        projectName: "Extension unité de raffinage (démonstration)",
        employer: "Industrials Demo SARL (démonstration)",
        client: "Client pétrolier (démonstration)",
        countryId: countryIdByIsoCode.get("AE")!,
        sector: "Pétrole et gaz",
        role: "Soudeur GTAW",
        startDate: new Date("2023-02-01"),
        endDate: new Date("2023-11-30"),
        description: "Soudage de tuyauteries inox sur une extension d'unité de raffinage.",
        equipmentUsed: "Poste TIG, tourets orbitaux",
        materialsWorked: "Acier inoxydable 316L",
        processesApplied: "GTAW",
        standardsUsed: "ISO 9606-1",
        verificationStatus: "DECLARED",
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
      countryId: moroccoId,
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

  console.log(`Référentiels : ${COUNTRIES.length} pays, ${TRADES.length} métiers, ${SKILLS.length} compétences.`);
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
