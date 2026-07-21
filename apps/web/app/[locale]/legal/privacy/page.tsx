import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface Section {
  heading: string;
  paragraphs: string[];
}

const CONTENT: Record<"fr" | "en", { title: string; updated: string; intro: string; sections: Section[] }> = {
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : juillet 2026",
    intro:
      "Cette politique décrit quelles données ATTI — African Technical Talent Index collecte, pourquoi, et quels droits vous pouvez exercer. Ce document est un modèle de référence destiné au développement du produit ; il doit être revu par un juriste avant toute mise en production avec des utilisateurs réels.",
    sections: [
      {
        heading: "1. Responsable du traitement",
        paragraphs: [
          "[Raison sociale et adresse à compléter]. Pour toute question relative à vos données personnelles, contactez privacy@atti.example.",
        ],
      },
      {
        heading: "2. Données collectées",
        paragraphs: [
          "Pour les techniciens : identité (nom, prénom, email), données professionnelles déclarées (métier, compétences, expériences, langues, disponibilité, mobilité), certifications et documents justificatifs téléversés, historique de score.",
          "Pour les entreprises : identité de l'organisation (nom, pays, site web, description), coordonnées du compte, listes de techniciens enregistrées dans un vivier.",
          "Pour tous les comptes : adresse email, mot de passe (haché, jamais stocké en clair), langue préférée, journal des actions importantes (audit).",
        ],
      },
      {
        heading: "3. Finalités du traitement",
        paragraphs: [
          "Créer et afficher un profil professionnel vérifiable ; permettre aux entreprises de rechercher des techniciens correspondant à leurs besoins ; vérifier l'authenticité des documents et qualifications déclarés ; calculer un score de manière explicable ; assurer la sécurité du service et la traçabilité des actions sensibles.",
        ],
      },
      {
        heading: "4. Base légale",
        paragraphs: [
          "L'exécution du service repose sur l'exécution du contrat qui vous lie à ATTI lors de la création de votre compte, et sur votre consentement explicite pour les éléments que vous choisissez de rendre publics (visibilité de votre profil).",
        ],
      },
      {
        heading: "5. Destinataires des données",
        paragraphs: [
          "Les informations d'un profil technicien ne sont visibles par les entreprises que selon le niveau de visibilité choisi par le technicien lui-même (visibilité limitée ou complète). Vos données ne sont jamais vendues à des tiers.",
          "Les administrateurs de la plateforme peuvent consulter l'ensemble des données dans le cadre de la vérification des documents et de la modération.",
        ],
      },
      {
        heading: "6. Documents et stockage",
        paragraphs: [
          "Les justificatifs téléversés (certifications, expériences) sont stockés dans un espace compatible S3 et ne sont jamais accessibles via une URL publique permanente : chaque téléchargement se fait via un lien signé à durée de vie limitée, généré à la demande pour la personne autorisée à le consulter.",
        ],
      },
      {
        heading: "7. Durée de conservation",
        paragraphs: [
          "Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, les données personnelles sont supprimées ou anonymisées dans un délai raisonnable, sous réserve des obligations légales de conservation.",
        ],
      },
      {
        heading: "8. Vos droits",
        paragraphs: [
          "Vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition sur vos données personnelles. Vous pouvez modifier la plupart de vos informations directement depuis votre profil, ou nous contacter à privacy@atti.example pour toute autre demande.",
        ],
      },
      {
        heading: "9. Sécurité",
        paragraphs: [
          "Les mots de passe sont hachés (jamais stockés en clair). L'accès aux données est contrôlé par rôle (technicien, entreprise, administrateur). Les actions sensibles (vérifications, modifications de profil) sont journalisées dans un registre d'audit.",
        ],
      },
      {
        heading: "10. Session et cookies",
        paragraphs: [
          "La plateforme utilise un cookie de session strictement nécessaire à l'authentification (jeton signé). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: July 2026",
    intro:
      "This policy describes what data ATTI — African Technical Talent Index collects, why, and what rights you can exercise. This document is a reference template for product development; it must be reviewed by a lawyer before any production launch with real users.",
    sections: [
      {
        heading: "1. Data controller",
        paragraphs: [
          "[Legal entity name and address to be completed]. For any question about your personal data, contact privacy@atti.example.",
        ],
      },
      {
        heading: "2. Data collected",
        paragraphs: [
          "For technicians: identity (first name, last name, email), declared professional data (trade, skills, experience, languages, availability, mobility), certifications and uploaded supporting documents, score history.",
          "For companies: organization identity (name, country, website, description), account contact details, lists of technicians saved to a talent pool.",
          "For all accounts: email address, password (hashed, never stored in plain text), preferred language, log of important actions (audit trail).",
        ],
      },
      {
        heading: "3. Purpose of processing",
        paragraphs: [
          "To create and display a verifiable professional profile; to let companies search for technicians matching their needs; to verify the authenticity of declared documents and qualifications; to calculate a score in an explainable way; to ensure the security of the service and the traceability of sensitive actions.",
        ],
      },
      {
        heading: "4. Legal basis",
        paragraphs: [
          "Providing the service relies on the performance of the contract formed when you create your account, and on your explicit consent for the elements you choose to make public (your profile's visibility).",
        ],
      },
      {
        heading: "5. Data recipients",
        paragraphs: [
          "A technician's profile information is only visible to companies according to the visibility level the technician has chosen (limited or full). Your data is never sold to third parties.",
          "Platform administrators may access all data as part of document verification and moderation.",
        ],
      },
      {
        heading: "6. Documents and storage",
        paragraphs: [
          "Uploaded supporting documents (certifications, experience) are stored in S3-compatible storage and are never accessible via a permanent public URL: every download uses a time-limited signed link, generated on demand for the person authorized to view it.",
        ],
      },
      {
        heading: "7. Retention period",
        paragraphs: [
          "Your data is kept for as long as your account is active. If your account is deleted, personal data is deleted or anonymized within a reasonable period, subject to legal retention obligations.",
        ],
      },
      {
        heading: "8. Your rights",
        paragraphs: [
          "You have the right to access, rectify, erase, port, and object to the processing of your personal data. You can edit most of your information directly from your profile, or contact us at privacy@atti.example for any other request.",
        ],
      },
      {
        heading: "9. Security",
        paragraphs: [
          "Passwords are hashed (never stored in plain text). Access to data is controlled by role (technician, company, administrator). Sensitive actions (verifications, profile changes) are logged in an audit trail.",
        ],
      },
      {
        heading: "10. Session and cookies",
        paragraphs: [
          "The platform uses a session cookie strictly necessary for authentication (signed token). No advertising or third-party tracking cookies are used.",
        ],
      },
    ],
  },
};

export default async function PrivacyPolicyPage() {
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
