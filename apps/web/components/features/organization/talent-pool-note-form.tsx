"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { updateTalentPoolNoteAction, type TalentPoolNoteFormState } from "@/lib/actions/talent-pool";

interface TalentPoolNoteFormProps {
  entryId: string;
  defaultNote: string;
}

const initialState: TalentPoolNoteFormState = {};

export function TalentPoolNoteForm({ entryId, defaultNote }: TalentPoolNoteFormProps) {
  const t = useTranslations("TalentPoolNoteForm");
  const [state, formAction, pending] = useActionState(updateTalentPoolNoteAction, initialState);

  return (
    <form action={formAction} className="mt-4 border-t border-slate-100 pt-4">
      <input type="hidden" name="entryId" value={entryId} />
      <label htmlFor={`note-${entryId}`} className="mb-1 block text-xs font-medium text-slate-500">
        {t("label")}
      </label>
      <textarea
        id={`note-${entryId}`}
        name="note"
        rows={2}
        defaultValue={defaultNote}
        placeholder={t("placeholder")}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />
      <div className="mt-2 flex items-center gap-3">
        <Button type="submit" variant="secondary" disabled={pending} className="px-3 py-1.5 text-xs">
          {pending ? t("submitPending") : t("submit")}
        </Button>
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
