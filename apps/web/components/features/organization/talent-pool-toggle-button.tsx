import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { toggleTalentPoolAction } from "@/lib/actions/talent-pool";

interface TalentPoolToggleButtonProps {
  technicianId: string;
  isSaved: boolean;
  className?: string;
}

export async function TalentPoolToggleButton({ technicianId, isSaved, className }: TalentPoolToggleButtonProps) {
  const t = await getTranslations("TalentPoolToggleButton");

  return (
    <form action={toggleTalentPoolAction}>
      <input type="hidden" name="technicianId" value={technicianId} />
      <Button type="submit" variant={isSaved ? "secondary" : "primary"} className={className}>
        {isSaved ? t("remove") : t("add")}
      </Button>
    </form>
  );
}
