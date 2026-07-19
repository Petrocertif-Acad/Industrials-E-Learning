import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
}

// Attend le fichier apps/web/public/logo.png (voir README > Branding). Tant
// qu'il n'est pas fourni, cet élément affiche une image cassée — c'est
// volontaire plutôt que de masquer silencieusement l'absence de logo.
export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="ATTI — African Technical Talent Index"
      className={cn("h-9 w-auto", className)}
    />
  );
}
