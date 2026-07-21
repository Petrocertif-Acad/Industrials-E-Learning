import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Wrapper localisé de Link/redirect/usePathname/useRouter : le reste de
// l'application continue d'écrire des chemins sans préfixe de langue
// (ex. "/technician/dashboard"), ce module ajoute/retire le préfixe
// (/fr/, /en/) automatiquement.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
