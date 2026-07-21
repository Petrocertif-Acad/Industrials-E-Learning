import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("ForgotPasswordPage");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mb-6 text-center text-sm text-slate-600">{t("subtitle")}</p>
        <Card>
          <ForgotPasswordForm />
        </Card>
      </div>
    </div>
  );
}
