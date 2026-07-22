"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createAssessmentAction, type AssessmentFormState } from "@/lib/actions/assessment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface SkillOption {
  id: string;
  name: string;
}

interface AssessmentFormProps {
  technicianId: string;
  skillOptions: SkillOption[];
}

const initialState: AssessmentFormState = {};

export function AssessmentForm({ technicianId, skillOptions }: AssessmentFormProps) {
  const t = useTranslations("AssessmentForm");
  const [state, formAction, pending] = useActionState(createAssessmentAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="technicianId" value={technicianId} />

      <div>
        <Label htmlFor="title">{t("title")}</Label>
        <Input id="title" name="title" required />
        {state.fieldErrors?.title && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.title[0]}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="skillId">{t("skill")}</Label>
          <Select id="skillId" name="skillId" defaultValue="">
            <option value="">{t("skillPlaceholder")}</option>
            {skillOptions.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="score">{t("score")}</Label>
          <Input id="score" name="score" type="number" min={0} max={100} required />
          {state.fieldErrors?.score && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.score[0]}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="evaluatorName">{t("evaluatorName")}</Label>
          <Input id="evaluatorName" name="evaluatorName" required />
          {state.fieldErrors?.evaluatorName && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.evaluatorName[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="assessedAt">{t("assessedAt")}</Label>
          <Input id="assessedAt" name="assessedAt" type="date" required />
          {state.fieldErrors?.assessedAt && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.assessedAt[0]}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">{t("notes")}</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <Label htmlFor="document">{t("document")}</Label>
        <input
          id="document"
          name="document"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? t("submitPending") : t("submitCreate")}
      </Button>
    </form>
  );
}
