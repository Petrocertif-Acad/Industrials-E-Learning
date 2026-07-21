import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import type { TechnicianProfileForDisplay } from "@/lib/technician";
import { PROFILE_VERIFICATION_LABELS, DOCUMENT_VERIFICATION_LABELS } from "@/lib/verification-labels";
import { SKILL_LEVEL_LABELS } from "@/lib/skill-levels";
import { AVAILABILITY_LABELS, MOBILITY_LABELS } from "@/lib/availability-labels";
import { isCertificationCurrentlyValid } from "@/lib/certification-expiry";

// Passeport numérique de compétences — cadrage section 5. Ne reprend que des
// données réellement issues du profil : pas de classement (aucun système de
// ranking dans ce MVP), pas d'historique d'évaluations (pas de modèle
// Assessment). Le QR code renvoie vers le profil public pour vérification.

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

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

interface PassportDocumentProps {
  profile: TechnicianProfileForDisplay;
  publicProfileUrl: string;
  qrCodeDataUrl: string;
  generatedAt: Date;
}

function PassportDocument({ profile, publicProfileUrl, qrCodeDataUrl, generatedAt }: PassportDocumentProps) {
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  const totalScore = profile.score ? Number(profile.score.totalScore) : null;
  const validCertifications = profile.certifications.filter(isCertificationCurrentlyValid);
  const expiredOrInvalidCertifications = profile.certifications.filter((c) => !isCertificationCurrentlyValid(c));

  return (
    <Document
      title={`Passeport ATTI — ${profile.firstName} ${profile.lastName}`}
      author="African Technical Talent Index"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <Text style={styles.brand}>ATTI — African Technical Talent Index</Text>
        <Text style={styles.title}>Passeport professionnel</Text>

        <View style={styles.heroRow}>
          <View style={styles.identityBlock}>
            <Text style={styles.avatar}>{initials}</Text>
            <View>
              <Text style={styles.name}>
                {profile.firstName} {profile.lastName}
              </Text>
              <Text style={styles.subtitle}>{profile.primaryTrade?.nameFr ?? "Métier non renseigné"}</Text>
              <Text style={styles.subtitle}>
                {profile.country?.nameFr ?? "Pays non renseigné"}
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
            <Text style={styles.qrCaption}>Vérifier ce profil en ligne :{"\n"}{publicProfileUrl}</Text>
          </View>
        </View>

        <View style={styles.scoreBox}>
          <View>
            <Text style={styles.scoreLabel}>Score ATTI global</Text>
            <Text style={styles.scoreValue}>{totalScore !== null ? `${totalScore} / 100` : "Non calculé"}</Text>
          </View>
          <Text style={styles.rowMeta}>
            {profile.score ? `Dernier calcul : ${formatDate(profile.score.calculatedAt)}` : ""}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compétences déclarées</Text>
          {profile.skills.length === 0 ? (
            <Text style={styles.emptyText}>Aucune compétence déclarée.</Text>
          ) : (
            profile.skills.map((entry) => (
              <View key={entry.id} style={styles.row}>
                <Text>{entry.skill.nameFr}</Text>
                <Text style={styles.rowMeta}>
                  {SKILL_LEVEL_LABELS[entry.verifiedLevel ?? entry.selfLevel]}
                  {entry.verifiedLevel ? " (vérifiée)" : " (déclarée)"}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Certifications valides ({validCertifications.length}/{profile.certifications.length})
          </Text>
          {profile.certifications.length === 0 ? (
            <Text style={styles.emptyText}>Aucune certification ajoutée.</Text>
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
                      ? ` · expire le ${formatDate(entry.expiryDate)}`
                      : ` · expirée le ${formatDate(entry.expiryDate)}`
                    : ""}
                </Text>
              </View>
            ))
          )}
          {expiredOrInvalidCertifications.length > 0 && (
            <Text style={[styles.emptyText, { marginTop: 6 }]}>
              Les certifications expirées ou non vérifiées ne sont pas comptabilisées dans le score.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expériences professionnelles</Text>
          {profile.workExperiences.length === 0 ? (
            <Text style={styles.emptyText}>Aucune expérience ajoutée.</Text>
          ) : (
            profile.workExperiences.map((experience) => (
              <View key={experience.id} style={styles.row}>
                <View>
                  <Text style={styles.rowLabel}>{experience.projectName}</Text>
                  <Text style={styles.rowMeta}>
                    {experience.role} — {experience.employer} ({experience.country.nameFr})
                  </Text>
                </View>
                <Text style={styles.rowMeta}>
                  {formatDate(experience.startDate)} — {experience.endDate ? formatDate(experience.endDate) : "en cours"}
                  {" · "}
                  {DOCUMENT_VERIFICATION_LABELS[experience.verificationStatus]}
                </Text>
              </View>
            ))
          )}
        </View>

        {profile.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Langues</Text>
            <Text>{profile.languages.map((l) => l.languageCode.toUpperCase()).join(", ")}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>
            Identifiant technicien : {profile.id} · Dernière mise à jour du profil : {formatDate(profile.updatedAt)}
          </Text>
          <Text>Document généré le {formatDate(generatedAt)} — atti (démonstration)</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateTechnicianPassportPdf(
  profile: TechnicianProfileForDisplay,
  publicProfileUrl: string
): Promise<Buffer> {
  const qrCodeDataUrl = await QRCode.toDataURL(publicProfileUrl, { margin: 1, width: 200 });

  return renderToBuffer(
    <PassportDocument
      profile={profile}
      publicProfileUrl={publicProfileUrl}
      qrCodeDataUrl={qrCodeDataUrl}
      generatedAt={new Date()}
    />
  );
}
