import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import {
  getTechnicianProfileForDisplay,
  canViewFullTechnicianProfile,
  isTechnicianProfilePublishable,
} from "@/lib/technician";
import { generateTechnicianPassportPdf } from "@/lib/passport-pdf";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Le passeport reprend le même niveau de détail que la page /technicians/[id]
// en accès complet : accessible au technicien lui-même, à un administrateur,
// ou publiquement si le technicien a choisi la visibilité complète.
//
// Cette route vit hors du segment [locale] (comme toute l'API) : la langue
// du PDF est passée explicitement en paramètre de requête par les pages qui
// génèrent le lien de téléchargement (?locale=fr|en), avec repli sur la
// langue par défaut si absent ou invalide.
export async function GET(request: Request, { params }: RouteContext) {
  const session = await auth();
  const { id } = await params;

  const requestedLocale = new URL(request.url).searchParams.get("locale");
  const locale = hasLocale(routing.locales, requestedLocale) ? requestedLocale : routing.defaultLocale;

  const profile = await getTechnicianProfileForDisplay(id);
  if (!profile || !isTechnicianProfilePublishable(profile)) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  if (!canViewFullTechnicianProfile(profile, session)) {
    return NextResponse.json({ error: "Ce technicien n'a pas rendu son passeport public." }, { status: 403 });
  }

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const publicProfileUrl = `${baseUrl}/${locale}/technicians/${profile.id}`;

  const pdfBuffer = await generateTechnicianPassportPdf(profile, publicProfileUrl, locale);
  const fileName = `passeport-atti-${profile.firstName}-${profile.lastName}.pdf`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.-]+/g, "-");

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
