import { Card } from "@/components/ui/card";

export default function OrganizationDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord entreprise</h1>
      <Card>
        <p className="text-sm text-slate-600">
          L&apos;inscription et le profil entreprise (recherche de techniciens, viviers, missions)
          arrivent dans un prochain module. La structure de rôles et d&apos;autorisations est en
          place — cette page confirme que l&apos;accès est correctement restreint aux comptes
          entreprise.
        </p>
      </Card>
    </div>
  );
}
