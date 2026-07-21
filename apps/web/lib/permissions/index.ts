import { UserRole } from "@/lib/generated/prisma/enums";
import { auth } from "@/auth";
import { redirectLocalized } from "@/lib/redirect";

/**
 * Vérification d'accès côté serveur. Chaque page/layout protégé doit appeler
 * l'une de ces fonctions — le contrôle d'accès ne doit jamais reposer
 * uniquement sur le masquage d'éléments d'UI côté client.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    return redirectLocalized("/login");
  }
  return session.user;
}

export async function requireRole(...allowedRoles: UserRole[]) {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    return redirectLocalized("/");
  }
  return user;
}

export function isAdmin(role: UserRole) {
  return role === UserRole.ADMIN;
}

export function canManageTechnicianProfile(actorId: string, actorRole: UserRole, profileOwnerId: string) {
  return isAdmin(actorRole) || actorId === profileOwnerId;
}
