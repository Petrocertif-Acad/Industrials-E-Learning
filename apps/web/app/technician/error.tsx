"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TechnicianError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Card className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-slate-900">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-slate-600">
          Impossible d&apos;afficher cette page pour le moment. Vérifiez votre connexion et
          réessayez.
        </p>
        <Button className="mt-4" onClick={reset}>
          Réessayer
        </Button>
      </Card>
    </div>
  );
}
