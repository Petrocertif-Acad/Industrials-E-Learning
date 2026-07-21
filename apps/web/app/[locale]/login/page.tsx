import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/features/auth/login-form";

export default async function LoginPage() {
  const t = await getTranslations("LoginPage");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <Card>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </Card>
        <p className="mt-4 text-center text-sm text-slate-600">
          {t("noAccount")}{" "}
          <Link href="/register" className="font-medium text-slate-900 hover:underline">
            {t("registerTechnician")}
          </Link>
        </p>
      </div>
    </div>
  );
}
