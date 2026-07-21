"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TechnicianError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("TechnicianError");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Card className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("description")}</p>
        <Button className="mt-4" onClick={reset}>
          {t("retry")}
        </Button>
      </Card>
    </div>
  );
}
