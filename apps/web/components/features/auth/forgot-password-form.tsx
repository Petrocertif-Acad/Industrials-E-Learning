"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction, type RequestPasswordResetFormState } from "@/lib/actions/password-reset";

const initialState: RequestPasswordResetFormState = {};

export function ForgotPasswordForm() {
  const t = useTranslations("ForgotPasswordForm");
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  if (state.submitted) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-700">{t("submittedMessage")}</p>
        {state.devResetUrl && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">{t("devModeLabel")}</p>
            <p className="mt-1 break-all text-xs">
              <a href={state.devResetUrl} className="text-amber-900 underline">
                {state.devResetUrl}
              </a>
            </p>
          </div>
        )}
        <Link href="/login" className="inline-block text-sm font-medium text-slate-900 hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        {state.fieldErrors?.email && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("submitPending") : t("submit")}
      </Button>
    </form>
  );
}
