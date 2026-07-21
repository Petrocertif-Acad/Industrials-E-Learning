import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/features/auth/register-form";

export default async function RegisterPage() {
  const t = await getTranslations("RegisterPage");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mb-6 text-center text-sm text-slate-600">{t("subtitle")}</p>
        <Card>
          <RegisterForm />
        </Card>
        <p className="mt-4 text-center text-sm text-slate-600">
          {t("alreadyRegistered")}{" "}
          <Link href="/login" className="font-medium text-slate-900 hover:underline">
            {t("login")}
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-600">
          {t("isOrganization")}{" "}
          <Link href="/register/organization" className="font-medium text-slate-900 hover:underline">
            {t("registerOrganization")}
          </Link>
        </p>
      </div>
    </div>
  );
}
