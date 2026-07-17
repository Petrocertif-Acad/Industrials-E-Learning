"use client";

import { deleteWorkExperienceAction } from "@/lib/actions/work-experience";

export function DeleteExperienceButton({ experienceId }: { experienceId: string }) {
  return (
    <form
      action={deleteWorkExperienceAction}
      onSubmit={(event) => {
        if (!confirm("Supprimer cette expérience professionnelle ?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={experienceId} />
      <button type="submit" className="text-sm text-red-600 hover:underline">
        Supprimer
      </button>
    </form>
  );
}
