import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getSignedDocumentUrl } from "@/lib/storage/s3";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Point d'accès unique aux documents privés : aucun document n'est jamais
// exposé via une URL publique permanente. On vérifie l'autorisation ici,
// puis on génère un lien signé à courte durée de vie (voir lib/storage/s3.ts).
export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  const isOwner = document.ownerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const signedUrl = await getSignedDocumentUrl(document.storageKey);
  return NextResponse.redirect(signedUrl);
}
