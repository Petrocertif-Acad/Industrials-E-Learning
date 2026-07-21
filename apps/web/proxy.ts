import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renomme middleware.ts en proxy.ts (voir AGENTS.md) : ce fichier
// gère uniquement la négociation/le préfixage de langue (/fr/, /en/), jamais
// l'authentification ou les rôles — ceux-ci restent vérifiés côté serveur
// dans chaque layout via requireUser()/requireRole() (lib/permissions).
export const proxy = createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
