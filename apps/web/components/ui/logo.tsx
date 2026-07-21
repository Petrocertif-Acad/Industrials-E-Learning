import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
}

// Attend le fichier apps/web/public/logo.png (voir README > Branding). Tant
// qu'il n'est pas fourni, cet élément affiche une image cassée — c'est
// volontaire plutôt que de masquer silencieusement l'absence de logo.
export function Logo({ className }: LogoProps) {
  return (
    // Conteneur à hauteur fixe et débordement masqué : tant que le fichier
    // n'existe pas, le texte alternatif de l'image cassée n'a pas de
    // dimensions intrinsèques et peut s'étendre sur plusieurs lignes,
    // écrasant le reste du header (nav) sur petit écran. Ce conteneur borne
    // l'espace occupé quel que soit l'état de l'image.
    <span className={cn("block h-9 max-w-[140px] overflow-hidden", className)}>
      <img src="/logo.png" alt="ATTI — African Technical Talent Index" className="h-9 w-auto" />
    </span>
  );
}
