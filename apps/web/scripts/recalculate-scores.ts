import { prisma } from "@/lib/db/prisma";
import { recalculateTechnicianScore } from "@/lib/score";

// Recalcule le score ATTI de tous les profils techniciens existants.
// À exécuter après toute évolution de la méthode de calcul (lib/score.ts),
// ou pour initialiser les scores d'une base déjà peuplée. `npm run scores:recalculate`.
async function main() {
  const profiles = await prisma.technicianProfile.findMany({ select: { id: true, firstName: true, lastName: true } });

  console.log(`Recalcul du score de ${profiles.length} profil(s) technicien...`);

  for (const profile of profiles) {
    await recalculateTechnicianScore(profile.id);
    console.log(`  - ${profile.firstName} ${profile.lastName} (${profile.id})`);
  }

  console.log("Terminé.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
