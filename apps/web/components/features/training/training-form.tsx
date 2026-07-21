"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createTrainingAction, updateTrainingAction, type TrainingFormState } from "@/lib/actions/training";
import { getTradeCategoryLabels } from "@/lib/trade-categories";

interface TrainingDefaults {
  title: string;
  provider: string;
  category: string | null;
  hours: number | null;
  completionDate: string;
  description: string | null;
}

interface TrainingFormProps {
  mode: "create" | "edit";
  trainingId?: string;
  defaults?: TrainingDefaults;
  existingDocumentId?: string | null;
}

const initialState: TrainingFormState = {};

export function TrainingForm({ mode, trainingId, defaults, existingDocumentId }: TrainingFormProps) {
  const t = useTranslations("TrainingForm");
  const locale = useLocale();
  const TRADE_CATEGORY_LABELS = getTradeCategoryLabels(locale);
  const action = mode === "edit" ? updateTrainingAction : createTrainingAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && <input type="hidden" name="id" value={trainingId} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">{t("title")}</Label>
          <Input id="title" name="title" required defaultValue={defaults?.title} />
          {state.fieldErrors?.title && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.title[0]}</p>}
        </div>
        <div>
          <Label htmlFor="provider">{t("provider")}</Label>
          <Input id="provider" name="provider" required defaultValue={defaults?.provider} />
          {state.fieldErrors?.provider && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.provider[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">{t("category")}</Label>
          <Select id="category" name="category" defaultValue={defaults?.category ?? ""}>
            <option value="">{t("categoryPlaceholder")}</option>
            {Object.entries(TRADE_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="hours">{t("hours")}</Label>
          <Input id="hours" name="hours" type="number" min={1} max={2000} defaultValue={defaults?.hours ?? ""} />
          {state.fieldErrors?.hours && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.hours[0]}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="completionDate">{t("completionDate")}</Label>
        <Input
          id="completionDate"
          name="completionDate"
          type="date"
          required
          defaultValue={defaults?.completionDate}
        />
        {state.fieldErrors?.completionDate && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.completionDate[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">{t("description")}</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <Label htmlFor="document">{existingDocumentId ? t("documentReplace") : t("documentNew")}</Label>
        {existingDocumentId && (
          <p className="mb-2 text-xs text-slate-600">
            <a
              href={`/api/documents/${existingDocumentId}/download`}
              className="text-slate-700 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {t("viewCurrentDocument")}
            </a>
          </p>
        )}
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
        {pending ? t("submitPending") : mode === "edit" ? t("submitEdit") : t("submitCreate")}
      </Button>
    </form>
  );
}
