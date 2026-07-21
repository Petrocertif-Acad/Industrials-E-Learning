"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createTechnicianCertificationAction,
  updateTechnicianCertificationAction,
  type CertificationFormState,
} from "@/lib/actions/certification";
import { getTradeCategoryLabels } from "@/lib/trade-categories";
import type { TradeCategory } from "@/lib/generated/prisma/enums";

interface CertificationOption {
  id: string;
  name: string;
  standardRef: string | null;
  category: TradeCategory;
}

interface CertificationDefaults {
  certificationId: string;
  issueDate: string | null;
  expiryDate: string | null;
  weldingProcess: string | null;
  materialType: string | null;
  materialGroup: string | null;
  qualifiedThickness: string | null;
  qualifiedDiameter: string | null;
  weldingPosition: string | null;
  jointType: string | null;
  fillerMetal: string | null;
  shieldingGas: string | null;
}

interface CertificationFormProps {
  certifications: CertificationOption[];
  mode: "create" | "edit";
  certificationRecordId?: string;
  defaults?: CertificationDefaults;
  existingDocumentId?: string | null;
}

const initialState: CertificationFormState = {};

function groupByCategory(certifications: CertificationOption[]) {
  const groups = new Map<TradeCategory, CertificationOption[]>();
  for (const certification of certifications) {
    const list = groups.get(certification.category) ?? [];
    list.push(certification);
    groups.set(certification.category, list);
  }
  return groups;
}

export function CertificationForm({
  certifications,
  mode,
  certificationRecordId,
  defaults,
  existingDocumentId,
}: CertificationFormProps) {
  const t = useTranslations("CertificationForm");
  const locale = useLocale();
  const TRADE_CATEGORY_LABELS = getTradeCategoryLabels(locale);
  const action = mode === "edit" ? updateTechnicianCertificationAction : createTechnicianCertificationAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const grouped = groupByCategory(certifications);

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && <input type="hidden" name="id" value={certificationRecordId} />}

      <div>
        <Label htmlFor="certificationId">{t("certification")}</Label>
        <Select id="certificationId" name="certificationId" required defaultValue={defaults?.certificationId ?? ""}>
          <option value="" disabled>
            {t("certificationPlaceholder")}
          </option>
          {Array.from(grouped.entries()).map(([category, options]) => (
            <optgroup key={category} label={TRADE_CATEGORY_LABELS[category]}>
              {options.map((cert) => (
                <option key={cert.id} value={cert.id}>
                  {cert.standardRef ? `${cert.standardRef} — ${cert.name}` : cert.name}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
        <p className="mt-1 text-xs text-slate-500">{t("certificationHelp")}</p>
        {state.fieldErrors?.certificationId && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.certificationId[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="issueDate">{t("issueDate")}</Label>
          <Input id="issueDate" name="issueDate" type="date" defaultValue={defaults?.issueDate ?? ""} />
        </div>
        <div>
          <Label htmlFor="expiryDate">{t("expiryDate")}</Label>
          <Input id="expiryDate" name="expiryDate" type="date" defaultValue={defaults?.expiryDate ?? ""} />
          {state.fieldErrors?.expiryDate && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.expiryDate[0]}</p>
          )}
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-900">{t("weldingLegend")}</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="weldingProcess">{t("weldingProcess")}</Label>
            <Input id="weldingProcess" name="weldingProcess" placeholder="GTAW, SMAW…" defaultValue={defaults?.weldingProcess ?? ""} />
          </div>
          <div>
            <Label htmlFor="materialType">{t("materialType")}</Label>
            <Input id="materialType" name="materialType" defaultValue={defaults?.materialType ?? ""} />
          </div>
          <div>
            <Label htmlFor="materialGroup">{t("materialGroup")}</Label>
            <Input id="materialGroup" name="materialGroup" defaultValue={defaults?.materialGroup ?? ""} />
          </div>
          <div>
            <Label htmlFor="qualifiedThickness">{t("qualifiedThickness")}</Label>
            <Input id="qualifiedThickness" name="qualifiedThickness" defaultValue={defaults?.qualifiedThickness ?? ""} />
          </div>
          <div>
            <Label htmlFor="qualifiedDiameter">{t("qualifiedDiameter")}</Label>
            <Input id="qualifiedDiameter" name="qualifiedDiameter" defaultValue={defaults?.qualifiedDiameter ?? ""} />
          </div>
          <div>
            <Label htmlFor="weldingPosition">{t("weldingPosition")}</Label>
            <Input id="weldingPosition" name="weldingPosition" defaultValue={defaults?.weldingPosition ?? ""} />
          </div>
          <div>
            <Label htmlFor="jointType">{t("jointType")}</Label>
            <Input id="jointType" name="jointType" defaultValue={defaults?.jointType ?? ""} />
          </div>
          <div>
            <Label htmlFor="fillerMetal">{t("fillerMetal")}</Label>
            <Input id="fillerMetal" name="fillerMetal" defaultValue={defaults?.fillerMetal ?? ""} />
          </div>
          <div>
            <Label htmlFor="shieldingGas">{t("shieldingGas")}</Label>
            <Input id="shieldingGas" name="shieldingGas" defaultValue={defaults?.shieldingGas ?? ""} />
          </div>
        </div>
      </fieldset>

      <div>
        <Label htmlFor="document">{existingDocumentId ? t("documentReplace") : t("documentNew")}</Label>
        {existingDocumentId && (
          <p className="mb-2 text-xs text-slate-600">
            <a
              href={`/api/documents/${existingDocumentId}/download`}
              className="text-slate-700 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {t("viewCurrentDocument")}
            </a>
          </p>
        )}
        <input
          id="document"
          name="document"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? t("submitPending") : mode === "edit" ? t("submitEdit") : t("submitCreate")}
      </Button>
    </form>
  );
}
