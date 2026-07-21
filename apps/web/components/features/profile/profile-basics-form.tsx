"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { updateProfileBasicsAction, type ProfileBasicsFormState } from "@/lib/actions/technician-profile";
import { getTradeCategoryLabels } from "@/lib/trade-categories";
import type { TradeCategory } from "@/lib/generated/prisma/enums";

interface TradeOption {
  id: string;
  name: string;
  category: TradeCategory;
}

interface CountryOption {
  id: string;
  name: string;
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
    visibility: string;
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
  const t = useTranslations("ProfileBasicsForm");
  const locale = useLocale();
  const TRADE_CATEGORY_LABELS = getTradeCategoryLabels(locale);
  const [state, formAction, pending] = useActionState(updateProfileBasicsAction, initialState);
  const groupedTrades = groupTradesByCategory(trades);

  return (
    <form action={formAction} className="space-y-10">
      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-slate-900">{t("tradeLegend")}</legend>

        <div>
          <Label htmlFor="primaryTradeId">{t("primaryTrade")}</Label>
          <Select id="primaryTradeId" name="primaryTradeId" required defaultValue={defaults.primaryTradeId ?? ""}>
            <option value="" disabled>
              {t("primaryTradePlaceholder")}
            </option>
            {Array.from(groupedTrades.entries()).map(([category, categoryTrades]) => (
              <optgroup key={category} label={TRADE_CATEGORY_LABELS[category]}>
                {categoryTrades.map((trade) => (
                  <option key={trade.id} value={trade.id}>
                    {trade.name}
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
          <Label htmlFor="secondaryTradeIds">{t("secondaryTrades")}</Label>
          <Select
            id="secondaryTradeIds"
            name="secondaryTradeIds"
            multiple
            size={6}
            defaultValue={defaults.secondaryTradeIds}
            aria-describedby="secondaryTradeIds-help"
          >
            {Array.from(groupedTrades.entries()).map(([category, categoryTrades]) => (
              <optgroup key={category} label={TRADE_CATEGORY_LABELS[category]}>
                {categoryTrades.map((trade) => (
                  <option key={trade.id} value={trade.id}>
                    {trade.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
          <p id="secondaryTradeIds-help" className="mt-1 text-xs text-slate-500">
            {t("secondaryTradesHelp")}
          </p>
          {state.fieldErrors?.secondaryTradeIds && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.secondaryTradeIds[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="yearsExperience">{t("yearsExperience")}</Label>
          <Input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min={0}
            max={60}
            required
            className="sm:w-40"
            defaultValue={defaults.yearsExperience}
          />
          {state.fieldErrors?.yearsExperience && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.yearsExperience[0]}</p>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-slate-900">{t("locationLegend")}</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="countryId">{t("country")}</Label>
            <Select id="countryId" name="countryId" required defaultValue={defaults.countryId ?? ""}>
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
            <Label htmlFor="city">{t("city")}</Label>
            <Input id="city" name="city" defaultValue={defaults.city ?? ""} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="availability">{t("availability")}</Label>
            <Select id="availability" name="availability" defaultValue={defaults.availability}>
              <option value="AVAILABLE">{t("availabilityAvailable")}</option>
              <option value="AVAILABLE_SOON">{t("availabilitySoon")}</option>
              <option value="UNAVAILABLE">{t("availabilityUnavailable")}</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="mobilityScope">{t("mobility")}</Label>
            <Select id="mobilityScope" name="mobilityScope" defaultValue={defaults.mobilityScope}>
              <option value="LOCAL">{t("mobilityLocal")}</option>
              <option value="NATIONAL">{t("mobilityNational")}</option>
              <option value="INTERNATIONAL">{t("mobilityInternational")}</option>
            </Select>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-base font-semibold text-slate-900">{t("visibilityLegend")}</legend>
        <p className="text-sm text-slate-600">{t("visibilitySubtitle")}</p>
        <div className="space-y-2">
          <label className="flex items-start gap-3 rounded-md border border-slate-200 p-3 has-[:checked]:border-amber-600 has-[:checked]:bg-amber-50">
            <input
              type="radio"
              name="visibility"
              value="PUBLIC_LIMITED"
              defaultChecked={defaults.visibility !== "PUBLIC_FULL"}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">{t("visibilityLimitedTitle")}</span>
              <span className="block text-sm text-slate-600">{t("visibilityLimitedDescription")}</span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-md border border-slate-200 p-3 has-[:checked]:border-amber-600 has-[:checked]:bg-amber-50">
            <input
              type="radio"
              name="visibility"
              value="PUBLIC_FULL"
              defaultChecked={defaults.visibility === "PUBLIC_FULL"}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">{t("visibilityFullTitle")}</span>
              <span className="block text-sm text-slate-600">{t("visibilityFullDescription")}</span>
            </span>
          </label>
        </div>
      </fieldset>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? t("submitPending") : t("submit")}
      </Button>
    </form>
  );
}
