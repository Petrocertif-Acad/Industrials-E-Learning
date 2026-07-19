import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="ATTI — Accueil">
            <Logo />
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
              Connexion
            </Link>
            <Link href="/register">
              <Button variant="secondary">Créer un profil technicien</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          African Technical Talent Index
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Le registre professionnel vérifiable des techniciens industriels africains
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Soudage, chaudronnerie, tuyauterie, structures métalliques, maintenance industrielle.
          Compétences vérifiées, certifications tracées, score transparent.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button>Créer mon profil technicien</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Accès entreprise / administration</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
