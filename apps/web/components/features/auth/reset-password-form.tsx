"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction, type ResetPasswordFormState } from "@/lib/actions/password-reset";

const initialState: ResetPasswordFormState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("ResetPasswordForm");
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <Label htmlFor="password">{t("newPassword")}</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        {state.fieldErrors?.password && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>}
      </div>

      <div>
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
        {state.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.confirmPassword[0]}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("submitPending") : t("submit")}
      </Button>
    </form>
  );
}
