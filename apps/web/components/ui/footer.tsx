import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row">
        <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        <nav className="flex items-center gap-4">
          <Link href="/legal/privacy" className="hover:text-slate-700 hover:underline">
            {t("privacy")}
          </Link>
          <Link href="/legal/terms" className="hover:text-slate-700 hover:underline">
            {t("terms")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
