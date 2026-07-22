import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { getTranslations } from "next-intl/server";
import type { TechnicianProfileForDisplay } from "@/lib/technician";
import { localizedName } from "@/lib/localized-name";
import { getProfileVerificationLabels, getDocumentVerificationLabels } from "@/lib/verification-labels";
import { getSkillLevelLabels } from "@/lib/skill-levels";
import { getAvailabilityLabels, getMobilityLabels } from "@/lib/availability-labels";
import { isCertificationCurrentlyValid } from "@/lib/certification-expiry";
import { getTradeCategoryLabels } from "@/lib/trade-categories";

// Passeport numérique de compétences — cadrage section 5. Ne reprend que des
// données réellement issues du profil : pas de classement (aucun système de
// ranking dans ce MVP), pas d'historique d'évaluations (pas de modèle
// Assessment). Le QR code renvoie vers le profil public pour vérification.
//
// Ce fichier est rendu hors de l'arbre React de l'application (renderToBuffer
// dans un route handler non préfixé par la langue) : impossible d'utiliser
// useTranslations/NextIntlClientProvider. On résout la locale explicitement
// via getTranslations({ locale, ... }), conçu par next-intl pour ce cas
// d'usage (PDF, emails). Les libellés d'énumération partagés (niveaux de
// compétence, statuts) restent en français pour l'instant, comme le reste du
// site — chantier séparé.

const INK = "#1e293b"; // slate-800
const MUTED = "#64748b"; // slate-500
const BORDER = "#e2e8f0"; // slate-200
const ACCENT = "#d97706"; // amber-600
const SURFACE = "#f8fafc"; // slate-50

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  headerBar: { height: 3, backgroundColor: ACCENT, marginBottom: 16 },
  brand: { fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: 700, marginTop: 2 },
  heroRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  identityBlock: { flexDirection: "row", gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: INK,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 15,
  },
  name: { fontSize: 15, fontWeight: 700 },
  subtitle: { fontSize: 11, color: MUTED, marginTop: 2 },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  badge: {
    fontSize: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    backgroundColor: SURFACE,
    color: INK,
  },
  qrBlock: { alignItems: "center", width: 90 },
  qrImage: { width: 72, height: 72 },
  qrCaption: { fontSize: 6.5, color: MUTED, marginTop: 4, textAlign: "center" },
  scoreBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: SURFACE,
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreValue: { fontSize: 24, fontWeight: 700 },
  scoreLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
  section: { marginTop: 18 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  rowLabel: { fontWeight: 700 },
  rowMeta: { color: MUTED, fontSize: 9 },
  emptyText: { color: MUTED, fontSize: 9, fontStyle: "italic" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7.5,
    color: MUTED,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function formatDate(date: Date | null, locale: string): string {
  if (!date) return "—";
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";
  return date.toLocaleDateString(dateLocale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

type PassportMessages = Awaited<ReturnType<typeof getTranslations<"Passport">>>;

interface PassportDocumentProps {
  profile: TechnicianProfileForDisplay;
  publicProfileUrl: string;
  qrCodeDataUrl: string;
  generatedAt: Date;
  locale: string;
  t: PassportMessages;
}

function PassportDocument({ profile, publicProfileUrl, qrCodeDataUrl, generatedAt, locale, t }: PassportDocumentProps) {
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  const totalScore = profile.score ? Number(profile.score.totalScore) : null;
  const validCertifications = profile.certifications.filter(isCertificationCurrentlyValid);
  const expiredOrInvalidCertifications = profile.certifications.filter((c) => !isCertificationCurrentlyValid(c));
  const PROFILE_VERIFICATION_LABELS = getProfileVerificationLabels(locale);
  const DOCUMENT_VERIFICATION_LABELS = getDocumentVerificationLabels(locale);
  const SKILL_LEVEL_LABELS = getSkillLevelLabels(locale);
  const AVAILABILITY_LABELS = getAvailabilityLabels(locale);
  const MOBILITY_LABELS = getMobilityLabels(locale);
  const TRADE_CATEGORY_LABELS = getTradeCategoryLabels(locale);

  return (
    <Document
      title={`ATTI Passport — ${profile.firstName} ${profile.lastName}`}
      author="African Technical Talent Index"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <Text style={styles.brand}>ATTI — African Technical Talent Index</Text>
        <Text style={styles.title}>{t("title")}</Text>

        <View style={styles.heroRow}>
          <View style={styles.identityBlock}>
            <Text style={styles.avatar}>{initials}</Text>
            <View>
              <Text style={styles.name}>
                {profile.firstName} {profile.lastName}
              </Text>
              <Text style={styles.subtitle}>
                {profile.primaryTrade ? localizedName(profile.primaryTrade, locale) : t("tradeMissing")}
              </Text>
              <Text style={styles.subtitle}>
                {profile.country ? localizedName(profile.country, locale) : t("countryMissing")}
                {profile.city ? ` · ${profile.city}` : ""}
              </Text>
              <View style={styles.badgeRow}>
                <Text style={styles.badge}>{PROFILE_VERIFICATION_LABELS[profile.verificationStatus]}</Text>
                <Text style={styles.badge}>{AVAILABILITY_LABELS[profile.availability]}</Text>
                <Text style={styles.badge}>{MOBILITY_LABELS[profile.mobilityScope]}</Text>
              </View>
            </View>
          </View>

          <View style={styles.qrBlock}>
            <Image src={qrCodeDataUrl} style={styles.qrImage} />
            <Text style={styles.qrCaption}>
              {t("verifyOnline")}
              {"\n"}
              {publicProfileUrl}
            </Text>
          </View>
        </View>

        <View style={styles.scoreBox}>
          <View>
            <Text style={styles.scoreLabel}>{t("scoreLabel")}</Text>
            <Text style={styles.scoreValue}>{totalScore !== null ? `${totalScore} / 100` : t("scoreNotCalculated")}</Text>
          </View>
          <Text style={styles.rowMeta}>
            {profile.score ? t("lastCalculation", { date: formatDate(profile.score.calculatedAt, locale) }) : ""}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("skillsTitle")}</Text>
          {profile.skills.length === 0 ? (
            <Text style={styles.emptyText}>{t("noSkills")}</Text>
          ) : (
            profile.skills.map((entry) => (
              <View key={entry.id} style={styles.row}>
                <Text>{localizedName(entry.skill, locale)}</Text>
                <Text style={styles.rowMeta}>
                  {SKILL_LEVEL_LABELS[entry.verifiedLevel ?? entry.selfLevel]}
                  {entry.verifiedLevel ? t("verifiedSuffix") : t("declaredSuffix")}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("assessmentsTitle")}</Text>
          {profile.assessments.length === 0 ? (
            <Text style={styles.emptyText}>{t("noAssessments")}</Text>
          ) : (
            profile.assessments.map((assessment) => (
              <View key={assessment.id} style={styles.row}>
                <View>
                  <Text style={styles.rowLabel}>{assessment.title}</Text>
                  <Text style={styles.rowMeta}>
                    {t("assessedBy", { evaluator: assessment.evaluatorName })}
                    {assessment.skill ? ` — ${localizedName(assessment.skill, locale)}` : ""}
                  </Text>
                </View>
                <Text style={styles.rowMeta}>
                  {t("assessmentScore", { score: assessment.score })}
                  {" · "}
                  {formatDate(assessment.assessedAt, locale)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("certificationsTitle", { valid: validCertifications.length, total: profile.certifications.length })}
          </Text>
          {profile.certifications.length === 0 ? (
            <Text style={styles.emptyText}>{t("noCertifications")}</Text>
          ) : (
            profile.certifications.map((entry) => (
              <View key={entry.id} style={styles.row}>
                <View>
                  <Text style={styles.rowLabel}>
                    {entry.certification.standardRef
                      ? `${entry.certification.standardRef} — ${entry.certification.name}`
                      : entry.certification.name}
                  </Text>
                  <Text style={styles.rowMeta}>{entry.certification.issuingBody}</Text>
                </View>
                <Text style={styles.rowMeta}>
                  {DOCUMENT_VERIFICATION_LABELS[entry.verificationStatus]}
                  {entry.expiryDate
                    ? isCertificationCurrentlyValid(entry)
                      ? t("expiresOn", { date: formatDate(entry.expiryDate, locale) })
                      : t("expiredOn", { date: formatDate(entry.expiryDate, locale) })
                    : ""}
                </Text>
              </View>
            ))
          )}
          {expiredOrInvalidCertifications.length > 0 && (
            <Text style={[styles.emptyText, { marginTop: 6 }]}>{t("certificationsNote")}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("experiencesTitle")}</Text>
          {profile.workExperiences.length === 0 ? (
            <Text style={styles.emptyText}>{t("noExperiences")}</Text>
          ) : (
            profile.workExperiences.map((experience) => (
              <View key={experience.id} style={styles.row}>
                <View>
                  <Text style={styles.rowLabel}>{experience.projectName}</Text>
                  <Text style={styles.rowMeta}>
                    {experience.role} — {experience.employer} ({localizedName(experience.country, locale)})
                  </Text>
                </View>
                <Text style={styles.rowMeta}>
                  {formatDate(experience.startDate, locale)} —{" "}
                  {experience.endDate ? formatDate(experience.endDate, locale) : t("ongoing")}
                  {" · "}
                  {DOCUMENT_VERIFICATION_LABELS[experience.verificationStatus]}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("trainingsTitle")}</Text>
          {profile.trainings.length === 0 ? (
            <Text style={styles.emptyText}>{t("noTrainings")}</Text>
          ) : (
            profile.trainings.map((training) => (
              <View key={training.id} style={styles.row}>
                <View>
                  <Text style={styles.rowLabel}>{training.title}</Text>
                  <Text style={styles.rowMeta}>
                    {training.provider}
                    {training.category ? ` — ${TRADE_CATEGORY_LABELS[training.category]}` : ""}
                  </Text>
                </View>
                <Text style={styles.rowMeta}>
                  {formatDate(training.completionDate, locale)}
                  {" · "}
                  {DOCUMENT_VERIFICATION_LABELS[training.verificationStatus]}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("employerReviewsTitle")}</Text>
          {profile.employerReviews.length === 0 ? (
            <Text style={styles.emptyText}>{t("noEmployerReviews")}</Text>
          ) : (
            <Text>
              {t("employerReviewsSummary", {
                average: (
                  profile.employerReviews.reduce((acc, review) => acc + review.rating, 0) /
                  profile.employerReviews.length
                ).toFixed(1),
                count: profile.employerReviews.length,
              })}
            </Text>
          )}
        </View>

        {profile.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("languagesTitle")}</Text>
            <Text>{profile.languages.map((l) => l.languageCode.toUpperCase()).join(", ")}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>{t("footerIdentifier", { id: profile.id, date: formatDate(profile.updatedAt, locale) })}</Text>
          <Text>{t("footerGenerated", { date: formatDate(generatedAt, locale) })}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateTechnicianPassportPdf(
  profile: TechnicianProfileForDisplay,
  publicProfileUrl: string,
  locale: string
): Promise<Buffer> {
  const [qrCodeDataUrl, t] = await Promise.all([
    QRCode.toDataURL(publicProfileUrl, { margin: 1, width: 200 }),
    getTranslations({ locale, namespace: "Passport" }),
  ]);

  return renderToBuffer(
    <PassportDocument
      profile={profile}
      publicProfileUrl={publicProfileUrl}
      qrCodeDataUrl={qrCodeDataUrl}
      generatedAt={new Date()}
      locale={locale}
      t={t}
    />
  );
}
