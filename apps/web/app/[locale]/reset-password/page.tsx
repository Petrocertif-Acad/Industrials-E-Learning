import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const t = await getTranslations("ResetPasswordPage");
  const { token } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mb-6 text-center text-sm text-slate-600">{t("subtitle")}</p>
        <Card>{token ? <ResetPasswordForm token={token} /> : <p className="text-sm text-red-600">{t("missingToken")}</p>}</Card>
      </div>
    </div>
  );
}
