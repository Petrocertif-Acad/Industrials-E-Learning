"use client";

import { useTranslations } from "next-intl";
import { deleteTrainingAction } from "@/lib/actions/training";

export function DeleteTrainingButton({ trainingId }: { trainingId: string }) {
  const t = useTranslations("DeleteTrainingButton");

  return (
    <form
      action={deleteTrainingAction}
      onSubmit={(event) => {
        if (!confirm(t("confirm"))) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={trainingId} />
      <button
        type="submit"
        className="rounded text-sm text-red-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
      >
        {t("delete")}
      </button>
    </form>
  );
}
