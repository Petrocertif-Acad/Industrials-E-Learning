import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface Section {
  heading: string;
  paragraphs: string[];
}

const CONTENT: Record<"fr" | "en", { title: string; updated: string; intro: string; sections: Section[] }> = {
  fr: {
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour : juillet 2026",
    intro:
      "Les présentes conditions régissent l'utilisation de la plateforme ATTI — African Technical Talent Index. Ce document est un modèle de référence destiné au développement du produit ; il doit être revu par un juriste avant toute mise en production avec des utilisateurs réels.",
    sections: [
      {
        heading: "1. Description du service",
        paragraphs: [
          "ATTI est une plateforme de mise en relation entre techniciens industriels et entreprises. Elle permet aux techniciens de constituer un profil professionnel vérifiable et aux entreprises de rechercher des profils correspondant à leurs besoins.",
        ],
      },
      {
        heading: "2. Comptes",
        paragraphs: [
          "Deux types de comptes existent : technicien et entreprise. Chaque compte est personnel ou lié à une organisation identifiée, et son titulaire est responsable de la confidentialité de ses identifiants.",
        ],
      },
      {
        heading: "3. Exactitude des informations",
        paragraphs: [
          "Le technicien s'engage à ne déclarer que des certifications, expériences et compétences réelles et exactes. Toute déclaration frauduleuse (certification falsifiée, expérience inventée) peut entraîner la suspension ou la suppression du compte.",
        ],
      },
      {
        heading: "4. Vérification par les administrateurs",
        paragraphs: [
          "Les documents justificatifs téléversés par les techniciens peuvent être examinés par les administrateurs de la plateforme. Cette vérification vise à renforcer la fiabilité des profils mais ne constitue pas une garantie absolue de validité ; ATTI ne se substitue pas aux organismes de certification.",
        ],
      },
      {
        heading: "5. Score ATTI",
        paragraphs: [
          "Le score attribué à chaque profil est calculé selon une méthode explicable, fondée sur les compétences déclarées, les certifications vérifiées, l'expérience et d'autres critères documentés dans la plateforme. Ce score est un indicateur d'aide à la décision ; il ne garantit ni embauche ni résultat professionnel.",
        ],
      },
      {
        heading: "6. Utilisation par les entreprises",
        paragraphs: [
          "Les entreprises s'engagent à utiliser les informations des profils techniciens uniquement dans le cadre de leurs démarches de recrutement, dans le respect de la visibilité choisie par chaque technicien, et à ne pas les redistribuer à des tiers.",
        ],
      },
      {
        heading: "7. Suspension et résiliation",
        paragraphs: [
          "ATTI se réserve le droit de suspendre ou de supprimer un compte en cas de violation des présentes conditions, notamment en cas de fausse déclaration ou d'utilisation abusive de la plateforme.",
        ],
      },
      {
        heading: "8. Responsabilité",
        paragraphs: [
          "ATTI est un service de mise en relation et n'est ni employeur ni garant des techniciens référencés. ATTI ne peut être tenu responsable des décisions de recrutement prises par les entreprises ni des relations contractuelles qui en découlent.",
        ],
      },
      {
        heading: "9. Propriété intellectuelle",
        paragraphs: [
          "Le contenu et la marque ATTI sont protégés. Les documents et informations téléversés par les utilisateurs restent leur propriété ; ils accordent à ATTI le droit de les traiter dans le seul cadre du fonctionnement du service.",
        ],
      },
      {
        heading: "10. Droit applicable",
        paragraphs: ["[Droit applicable et juridiction compétente à compléter]."],
      },
      {
        heading: "11. Modification des conditions",
        paragraphs: [
          "Les présentes conditions peuvent être mises à jour. Les utilisateurs seront informés de tout changement significatif.",
        ],
      },
      {
        heading: "12. Contact",
        paragraphs: ["Pour toute question relative aux présentes conditions, contactez legal@atti.example."],
      },
    ],
  },
  en: {
    title: "Terms of Service",
    updated: "Last updated: July 2026",
    intro:
      "These terms govern the use of the ATTI — African Technical Talent Index platform. This document is a reference template for product development; it must be reviewed by a lawyer before any production launch with real users.",
    sections: [
      {
        heading: "1. Service description",
        paragraphs: [
          "ATTI is a matchmaking platform connecting industrial technicians with companies. It lets technicians build a verifiable professional profile and lets companies search for profiles matching their needs.",
        ],
      },
      {
        heading: "2. Accounts",
        paragraphs: [
          "Two account types exist: technician and company. Each account is personal or linked to an identified organization, and its holder is responsible for keeping their credentials confidential.",
        ],
      },
      {
        heading: "3. Accuracy of information",
        paragraphs: [
          "Technicians agree to declare only real and accurate certifications, experience, and skills. Any fraudulent declaration (falsified certification, invented experience) may result in account suspension or deletion.",
        ],
      },
      {
        heading: "4. Verification by administrators",
        paragraphs: [
          "Supporting documents uploaded by technicians may be reviewed by platform administrators. This review aims to strengthen profile reliability but is not an absolute guarantee of validity; ATTI does not act as a substitute for certification bodies.",
        ],
      },
      {
        heading: "5. ATTI score",
        paragraphs: [
          "The score assigned to each profile is calculated using an explainable method, based on declared skills, verified certifications, experience, and other criteria documented in the platform. This score is a decision-support indicator; it does not guarantee employment or any professional outcome.",
        ],
      },
      {
        heading: "6. Use by companies",
        paragraphs: [
          "Companies agree to use technician profile information only for their recruitment purposes, in line with the visibility each technician has chosen, and not to redistribute it to third parties.",
        ],
      },
      {
        heading: "7. Suspension and termination",
        paragraphs: [
          "ATTI reserves the right to suspend or delete an account in case of violation of these terms, including false declarations or misuse of the platform.",
        ],
      },
      {
        heading: "8. Liability",
        paragraphs: [
          "ATTI is a matchmaking service and is neither an employer nor a guarantor of the technicians listed. ATTI cannot be held liable for hiring decisions made by companies or for any resulting contractual relationships.",
        ],
      },
      {
        heading: "9. Intellectual property",
        paragraphs: [
          "The ATTI content and brand are protected. Documents and information uploaded by users remain their property; they grant ATTI the right to process them solely for the purpose of operating the service.",
        ],
      },
      {
        heading: "10. Governing law",
        paragraphs: ["[Governing law and competent jurisdiction to be completed]."],
      },
      {
        heading: "11. Changes to these terms",
        paragraphs: ["These terms may be updated over time. Users will be notified of any significant change."],
      },
      {
        heading: "12. Contact",
        paragraphs: ["For any question about these terms, contact legal@atti.example."],
      },
    ],
  },
};

export default async function TermsOfServicePage() {
  const locale = await getLocale();
  const tCommon = await getTranslations("Common");
  const content = CONTENT[locale === "en" ? "en" : "fr"];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-slate-600 hover:underline">
        ← {tCommon("homeAriaLabel")}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{content.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{content.updated}</p>
      <p className="mt-6 text-sm leading-relaxed text-slate-700">{content.intro}</p>

      <div className="mt-10 space-y-8">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-medium text-slate-900">{section.heading}</h2>
            <div className="mt-2 space-y-3">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-slate-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
