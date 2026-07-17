"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { updateTechnicianSkillsAction, type SkillsFormState } from "@/lib/actions/technician-profile";

interface SkillOption {
  id: string;
  nameFr: string;
  tradeNameFr: string;
}

interface SkillsFormProps {
  skills: SkillOption[];
  currentLevels: Record<string, string>;
}

const initialState: SkillsFormState = {};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
};

function groupSkillsByTrade(skills: SkillOption[]) {
  const groups = new Map<string, SkillOption[]>();
  for (const skill of skills) {
    const list = groups.get(skill.tradeNameFr) ?? [];
    list.push(skill);
    groups.set(skill.tradeNameFr, list);
  }
  return groups;
}

export function SkillsForm({ skills, currentLevels }: SkillsFormProps) {
  const [state, formAction, pending] = useActionState(updateTechnicianSkillsAction, initialState);
  const groupedSkills = groupSkillsByTrade(skills);

  return (
    <form action={formAction} className="space-y-8">
      {Array.from(groupedSkills.entries()).map(([tradeName, tradeSkills]) => (
        <fieldset key={tradeName} className="space-y-3">
          <legend className="text-sm font-semibold text-slate-900">{tradeName}</legend>
          <div className="space-y-2">
            {tradeSkills.map((skill) => {
              const isChecked = skill.id in currentLevels;
              return (
                <div
                  key={skill.id}
                  className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name={`skill-${skill.id}`}
                      defaultChecked={isChecked}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {skill.nameFr}
                  </label>
                  <Select
                    name={`level-${skill.id}`}
                    defaultValue={currentLevels[skill.id] ?? "BEGINNER"}
                    className="sm:w-48"
                  >
                    {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer mes compétences"}
      </Button>
    </form>
  );
}
