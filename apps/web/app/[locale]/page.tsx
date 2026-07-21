import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/ui/footer";

export default async function Home() {
  const t = await getTranslations("HomePage");
  const tCommon = await getTranslations("Common");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label={tCommon("homeAriaLabel")}>
            <Logo />
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
              {t("login")}
            </Link>
            <Link href="/register">
              <Button variant="secondary">{t("ctaTechnicianShort")}</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{t("eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{t("title")}</h1>
        <p className="mt-6 text-lg text-slate-600">{t("subtitle")}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button>{t("ctaTechnician")}</Button>
          </Link>
          <Link href="/register/organization">
            <Button variant="secondary">{t("ctaOrganization")}</Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          {t("alreadyRegistered")}{" "}
          <Link href="/login" className="font-medium text-slate-700 hover:text-slate-900">
            {t("loginLink")}
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
