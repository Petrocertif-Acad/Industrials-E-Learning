"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createWorkExperienceAction,
  updateWorkExperienceAction,
  type WorkExperienceFormState,
} from "@/lib/actions/work-experience";
import { INDUSTRY_SECTORS } from "@/lib/sectors";

interface CountryOption {
  id: string;
  nameFr: string;
}

interface ExperienceDefaults {
  projectName: string;
  employer: string;
  client: string | null;
  countryId: string;
  sector: string | null;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  equipmentUsed: string | null;
  materialsWorked: string | null;
  processesApplied: string | null;
  standardsUsed: string | null;
  responsibilities: string | null;
  referenceContact: string | null;
}

interface ExperienceFormProps {
  countries: CountryOption[];
  mode: "create" | "edit";
  experienceId?: string;
  defaults?: ExperienceDefaults;
}

const initialState: WorkExperienceFormState = {};

export function ExperienceForm({ countries, mode, experienceId, defaults }: ExperienceFormProps) {
  const action = mode === "edit" ? updateWorkExperienceAction : createWorkExperienceAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && <input type="hidden" name="id" value={experienceId} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="projectName">Nom du projet</Label>
          <Input id="projectName" name="projectName" required defaultValue={defaults?.projectName} />
          {state.fieldErrors?.projectName && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.projectName[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="employer">Entreprise</Label>
          <Input id="employer" name="employer" required defaultValue={defaults?.employer} />
          {state.fieldErrors?.employer && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.employer[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="client">Client final (facultatif)</Label>
          <Input id="client" name="client" defaultValue={defaults?.client ?? ""} />
        </div>
        <div>
          <Label htmlFor="role">Poste occupé</Label>
          <Input id="role" name="role" required defaultValue={defaults?.role} />
          {state.fieldErrors?.role && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.role[0]}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="countryId">Pays</Label>
          <Select id="countryId" name="countryId" required defaultValue={defaults?.countryId ?? ""}>
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
          <Label htmlFor="sector">Secteur (facultatif)</Label>
          <Input id="sector" name="sector" list="industry-sectors" defaultValue={defaults?.sector ?? ""} />
          <datalist id="industry-sectors">
            {INDUSTRY_SECTORS.map((sector) => (
              <option key={sector} value={sector} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="startDate">Date de début</Label>
          <Input id="startDate" name="startDate" type="date" required defaultValue={defaults?.startDate} />
          {state.fieldErrors?.startDate && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.startDate[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="endDate">Date de fin (laisser vide si en cours)</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={defaults?.endDate ?? ""} />
          {state.fieldErrors?.endDate && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.endDate[0]}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description du scope (facultatif)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="equipmentUsed">Équipements utilisés (facultatif)</Label>
          <Input id="equipmentUsed" name="equipmentUsed" defaultValue={defaults?.equipmentUsed ?? ""} />
        </div>
        <div>
          <Label htmlFor="materialsWorked">Matériaux travaillés (facultatif)</Label>
          <Input id="materialsWorked" name="materialsWorked" defaultValue={defaults?.materialsWorked ?? ""} />
        </div>
        <div>
          <Label htmlFor="processesApplied">Procédés appliqués (facultatif)</Label>
          <Input id="processesApplied" name="processesApplied" defaultValue={defaults?.processesApplied ?? ""} />
        </div>
        <div>
          <Label htmlFor="standardsUsed">Normes utilisées (facultatif)</Label>
          <Input id="standardsUsed" name="standardsUsed" defaultValue={defaults?.standardsUsed ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="responsibilities">Responsabilités (facultatif)</Label>
        <textarea
          id="responsibilities"
          name="responsibilities"
          rows={3}
          defaultValue={defaults?.responsibilities ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <Label htmlFor="referenceContact">Référence professionnelle (facultatif)</Label>
        <Input
          id="referenceContact"
          name="referenceContact"
          placeholder="Nom, poste, moyen de contact"
          defaultValue={defaults?.referenceContact ?? ""}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : mode === "edit" ? "Mettre à jour" : "Ajouter l'expérience"}
      </Button>
    </form>
  );
}
