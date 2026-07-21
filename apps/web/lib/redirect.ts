import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

// Le `redirect` localisé (@/i18n/navigation) exige explicitement la langue
// courante — il ne l'infère pas automatiquement côté serveur. Ce wrapper la
// récupère via getLocale() pour que les appelants continuent d'écrire des
// chemins simples, sans préfixe de langue (ex. "/login").
export async function redirectLocalized(href: string): Promise<never> {
  const locale = await getLocale();
  return redirect({ href, locale });
}
