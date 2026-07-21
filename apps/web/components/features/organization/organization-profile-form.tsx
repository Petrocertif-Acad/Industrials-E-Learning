"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  updateOrganizationProfileAction,
  type OrganizationProfileFormState,
} from "@/lib/actions/organization-profile";

interface CountryOption {
  id: string;
  name: string;
}

interface OrganizationProfileFormProps {
  countries: CountryOption[];
  defaults: {
    name: string;
    countryId: string;
    description: string | null;
    website: string | null;
  };
}

const initialState: OrganizationProfileFormState = {};

export function OrganizationProfileForm({ countries, defaults }: OrganizationProfileFormProps) {
  const t = useTranslations("OrganizationProfileForm");
  const [state, formAction, pending] = useActionState(updateOrganizationProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" required defaultValue={defaults.name} />
        {state.fieldErrors?.name && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>}
      </div>

      <div>
        <Label htmlFor="countryId">{t("country")}</Label>
        <Select id="countryId" name="countryId" required defaultValue={defaults.countryId}>
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
        <Label htmlFor="website">{t("website")}</Label>
        <Input
          id="website"
          name="website"
          type="url"
          placeholder="https://"
          defaultValue={defaults.website ?? ""}
        />
        {state.fieldErrors?.website && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.website[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">{t("description")}</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaults.description ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? t("submitPending") : t("submit")}
      </Button>
    </form>
  );
}
