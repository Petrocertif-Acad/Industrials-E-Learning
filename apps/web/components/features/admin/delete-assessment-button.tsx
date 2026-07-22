"use client";

import { useTranslations } from "next-intl";
import { deleteAssessmentAction } from "@/lib/actions/assessment";

export function DeleteAssessmentButton({ assessmentId }: { assessmentId: string }) {
  const t = useTranslations("DeleteAssessmentButton");

  return (
    <form
      action={deleteAssessmentAction}
      onSubmit={(event) => {
        if (!confirm(t("confirm"))) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={assessmentId} />
      <button type="submit" className="text-xs text-red-600 hover:underline">
        {t("delete")}
      </button>
    </form>
  );
}
