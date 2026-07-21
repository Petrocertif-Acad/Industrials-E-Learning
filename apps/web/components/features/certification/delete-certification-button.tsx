"use client";

import { useTranslations } from "next-intl";
import { deleteTechnicianCertificationAction } from "@/lib/actions/certification";

export function DeleteCertificationButton({ certificationRecordId }: { certificationRecordId: string }) {
  const t = useTranslations("DeleteCertificationButton");

  return (
    <form
      action={deleteTechnicianCertificationAction}
      onSubmit={(event) => {
        if (!confirm(t("confirm"))) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={certificationRecordId} />
      <button
        type="submit"
        className="rounded text-sm text-red-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
      >
        {t("delete")}
      </button>
    </form>
  );
}
