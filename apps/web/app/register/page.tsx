import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/features/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">
          Créer mon profil technicien
        </h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Gratuit. Vous complèterez votre métier, vos compétences et vos certifications à
          l&apos;étape suivante.
        </p>
        <Card>
          <RegisterForm />
        </Card>
        <p className="mt-4 text-center text-sm text-slate-600">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-medium text-slate-900 hover:underline">
            Se connecter
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-600">
          Vous êtes une entreprise ?{" "}
          <Link href="/register/organization" className="font-medium text-slate-900 hover:underline">
            Créer un compte entreprise
          </Link>
        </p>
      </div>
    </div>
  );
}
