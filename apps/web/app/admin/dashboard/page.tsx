import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [technicianCount, organizationCount, pendingDocuments] = await Promise.all([
    prisma.technicianProfile.count(),
    prisma.organization.count(),
    prisma.document.count({ where: { verificationStatus: "UNDER_REVIEW" } }),
  ]);

  const stats = [
    { label: "Techniciens inscrits", value: technicianCount },
    { label: "Organisations", value: organizationCount },
    { label: "Documents en attente de vérification", value: pendingDocuments },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
