import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

// Toutes les routes vivent maintenant sous un préfixe de langue (/fr/, /en/) :
// `revalidatePath` doit recevoir le chemin réellement rendu, sinon
// l'invalidation de cache ne cible pas la bonne route.
export async function revalidateLocalizedPath(pathname: string): Promise<void> {
  const locale = await getLocale();
  revalidatePath(`/${locale}${pathname}`);
}
