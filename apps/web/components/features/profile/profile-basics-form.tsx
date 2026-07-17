"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { updateProfileBasicsAction, type ProfileBasicsFormState } from "@/lib/actions/technician-profile";
import { TRADE_CATEGORY_LABELS_FR } from "@/lib/trade-categories";
import type { TradeCategory } from "@/lib/generated/prisma/enums";

interface TradeOption {
  id: string;
  nameFr: string;
  category: TradeCategory;
}

interface CountryOption {
  id: string;
  nameFr: string;
}

interface ProfileBasicsFormProps {
  trades: TradeOption[];
  countries: CountryOption[];
  defaults: {
    primaryTradeId: string | null;
    secondaryTradeIds: string[];
    countryId: string | null;
    city: string | null;
    yearsExperience: number;
    availability: string;
    mobilityScope: string;
  };
}

const initialState: ProfileBasicsFormState = {};

function groupTradesByCategory(trades: TradeOption[]) {
  const groups = new Map<TradeCategory, TradeOption[]>();
  for (const trade of trades) {
    const list = groups.get(trade.category) ?? [];
    list.push(trade);
    groups.set(trade.category, list);
  }
  return groups;
}

export function ProfileBasicsForm({ trades, countries, defaults }: ProfileBasicsFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileBasicsAction, initialState);
  const groupedTrades = groupTradesByCategory(trades);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="primaryTradeId">Métier principal</Label>
        <Select id="primaryTradeId" name="primaryTradeId" required defaultValue={defaults.primaryTradeId ?? ""}>
          <option value="" disabled>
            Sélectionnez votre métier principal
          </option>
          {Array.from(groupedTrades.entries()).map(([category, categoryTrades]) => (
            <optgroup key={category} label={TRADE_CATEGORY_LABELS_FR[category]}>
              {categoryTrades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.nameFr}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
        {state.fieldErrors?.primaryTradeId && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.primaryTradeId[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="secondaryTradeIds">Métiers secondaires (facultatif, 5 maximum)</Label>
        <Select
          id="secondaryTradeIds"
          name="secondaryTradeIds"
          multiple
          size={6}
          defaultValue={defaults.secondaryTradeIds}
        >
          {Array.from(groupedTrades.entries()).map(([category, categoryTrades]) => (
            <optgroup key={category} label={TRADE_CATEGORY_LABELS_FR[category]}>
              {categoryTrades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.nameFr}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
        <p className="mt-1 text-xs text-slate-500">
          Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs métiers.
        </p>
        {state.fieldErrors?.secondaryTradeIds && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.secondaryTradeIds[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="countryId">Pays</Label>
          <Select id="countryId" name="countryId" required defaultValue={defaults.countryId ?? ""}>
            <option value="" disabled>
              Sélectionnez votre pays
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
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" defaultValue={defaults.city ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="yearsExperience">Années d&apos;expérience</Label>
          <Input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min={0}
            max={60}
            required
            defaultValue={defaults.yearsExperience}
          />
          {state.fieldErrors?.yearsExperience && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.yearsExperience[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="availability">Disponibilité</Label>
          <Select id="availability" name="availability" defaultValue={defaults.availability}>
            <option value="AVAILABLE">Disponible</option>
            <option value="AVAILABLE_SOON">Disponible prochainement</option>
            <option value="UNAVAILABLE">Non disponible</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="mobilityScope">Mobilité</Label>
          <Select id="mobilityScope" name="mobilityScope" defaultValue={defaults.mobilityScope}>
            <option value="LOCAL">Locale</option>
            <option value="NATIONAL">Nationale</option>
            <option value="INTERNATIONAL">Internationale</option>
          </Select>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
