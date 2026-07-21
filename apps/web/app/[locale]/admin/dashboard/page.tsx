import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [technicianCount, organizationCount, pendingCertifications, pendingExperiences] = await Promise.all([
    prisma.technicianProfile.count(),
    prisma.organization.count(),
    prisma.technicianCertification.count({ where: { verificationStatus: { in: ["DECLARED", "UNDER_REVIEW"] } } }),
    prisma.workExperience.count({ where: { verificationStatus: { in: ["DECLARED", "UNDER_REVIEW"] } } }),
  ]);

  const pendingVerifications = pendingCertifications + pendingExperiences;

  const stats = [
    { label: "Techniciens inscrits", value: technicianCount, href: undefined },
    { label: "Organisations", value: organizationCount, href: undefined },
    { label: "En attente de vérification", value: pendingVerifications, href: "/admin/verifications" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const content = (
            <>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            </>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-colors hover:border-slate-400">{content}</Card>
            </Link>
          ) : (
            <Card key={stat.label}>{content}</Card>
          );
        })}
      </div>
    </div>
  );
}
