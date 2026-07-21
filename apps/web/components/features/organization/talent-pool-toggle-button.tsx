import { Button } from "@/components/ui/button";
import { toggleTalentPoolAction } from "@/lib/actions/talent-pool";

interface TalentPoolToggleButtonProps {
  technicianId: string;
  isSaved: boolean;
  className?: string;
}

export function TalentPoolToggleButton({ technicianId, isSaved, className }: TalentPoolToggleButtonProps) {
  return (
    <form action={toggleTalentPoolAction}>
      <input type="hidden" name="technicianId" value={technicianId} />
      <Button type="submit" variant={isSaved ? "secondary" : "primary"} className={className}>
        {isSaved ? "Retirer du vivier" : "Ajouter au vivier"}
      </Button>
    </form>
  );
}
