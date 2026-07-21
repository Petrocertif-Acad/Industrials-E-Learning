"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  submitEmployerReviewAction,
  deleteEmployerReviewAction,
  type EmployerReviewFormState,
} from "@/lib/actions/employer-review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface EmployerReviewFormProps {
  technicianId: string;
  defaults?: {
    rating: number;
    context: string | null;
    comment: string | null;
  };
}

const initialState: EmployerReviewFormState = {};

export function EmployerReviewForm({ technicianId, defaults }: EmployerReviewFormProps) {
  const t = useTranslations("EmployerReviewForm");
  const [state, formAction, pending] = useActionState(submitEmployerReviewAction, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="technicianId" value={technicianId} />

        <div>
          <Label htmlFor="rating">{t("rating")}</Label>
          <Select id="rating" name="rating" required defaultValue={defaults?.rating ?? ""}>
            <option value="" disabled>
              {t("ratingPlaceholder")}
            </option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {t("ratingOption", { value })}
              </option>
            ))}
          </Select>
          {state.fieldErrors?.rating && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.rating[0]}</p>}
        </div>

        <div>
          <Label htmlFor="context">{t("context")}</Label>
          <Input id="context" name="context" defaultValue={defaults?.context ?? ""} placeholder={t("contextPlaceholder")} />
        </div>

        <div>
          <Label htmlFor="comment">{t("comment")}</Label>
          <textarea
            id="comment"
            name="comment"
            rows={3}
            defaultValue={defaults?.comment ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? t("submitPending") : defaults ? t("submitEdit") : t("submitCreate")}
          </Button>
          {defaults && (
            <span className="text-xs text-slate-500">{t("editHint")}</span>
          )}
        </div>
      </form>

      {defaults && (
        <form
          action={deleteEmployerReviewAction}
          onSubmit={(event) => {
            if (!confirm(t("deleteConfirm"))) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="technicianId" value={technicianId} />
          <button type="submit" className="text-xs text-red-600 hover:underline">
            {t("delete")}
          </button>
        </form>
      )}
    </div>
  );
}
