"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  registerOrganizationAction,
  type RegisterOrganizationFormState,
} from "@/lib/actions/register-organization";

interface CountryOption {
  id: string;
  name: string;
}

interface RegisterOrganizationFormProps {
  countries: CountryOption[];
}

const initialState: RegisterOrganizationFormState = {};

export function RegisterOrganizationForm({ countries }: RegisterOrganizationFormProps) {
  const t = useTranslations("RegisterOrganizationForm");
  const [state, formAction, pending] = useActionState(registerOrganizationAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" required autoComplete="organization" />
        {state.fieldErrors?.name && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>}
      </div>

      <div>
        <Label htmlFor="countryId">{t("country")}</Label>
        <Select id="countryId" name="countryId" required defaultValue="">
          <option value="" disabled>
            {t("countryPlaceholder")}
          </option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </Select>
        {state.fieldErrors?.countryId && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.countryId[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        {state.fieldErrors?.email && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>}
      </div>

      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("submitPending") : t("submit")}
      </Button>
    </form>
  );
}
