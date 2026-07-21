import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/logo";

export default async function PublicTechniciansLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("Common");

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label={t("homeAriaLabel")}>
            <Logo />
          </Link>
          <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            {t("login")}
          </Link>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
