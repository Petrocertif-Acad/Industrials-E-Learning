"use client";

import { useActionState } from "react";
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
  nameFr: string;
}

interface RegisterOrganizationFormProps {
  countries: CountryOption[];
}

const initialState: RegisterOrganizationFormState = {};

export function RegisterOrganizationForm({ countries }: RegisterOrganizationFormProps) {
  const [state, formAction, pending] = useActionState(registerOrganizationAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom de l&apos;entreprise</Label>
        <Input id="name" name="name" required autoComplete="organization" />
        {state.fieldErrors?.name && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>}
      </div>

      <div>
        <Label htmlFor="countryId">Pays</Label>
        <Select id="countryId" name="countryId" required defaultValue="">
          <option value="" disabled>
            Sélectionnez un pays
          </option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.nameFr}
            </option>
          ))}
        </Select>
        {state.fieldErrors?.countryId && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.countryId[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Adresse email professionnelle</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        {state.fieldErrors?.email && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>}
      </div>

      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Création en cours…" : "Créer mon compte entreprise"}
      </Button>
    </form>
  );
}
