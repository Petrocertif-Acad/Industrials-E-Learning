"use client";

import { deleteTechnicianCertificationAction } from "@/lib/actions/certification";

export function DeleteCertificationButton({ certificationRecordId }: { certificationRecordId: string }) {
  return (
    <form
      action={deleteTechnicianCertificationAction}
      onSubmit={(event) => {
        if (!confirm("Supprimer cette certification et son justificatif éventuel ?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={certificationRecordId} />
      <button type="submit" className="text-sm text-red-600 hover:underline">
        Supprimer
      </button>
    </form>
  );
}
