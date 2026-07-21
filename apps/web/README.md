# ATTI — African Technical Talent Index

Registre professionnel vérifiable des techniciens industriels africains (soudage,
chaudronnerie, tuyauterie, structures métalliques, maintenance industrielle, contrôle
qualité, CND, supervision). Voir le cadrage produit complet pour la vision, le périmètre
MVP et la feuille de route détaillée.

## Stack technique

- **Frontend/Backend** : Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Style** : Tailwind CSS v4
- **Base de données** : PostgreSQL, via Prisma ORM 7 (générateur `prisma-client` +
  adaptateur `@prisma/adapter-pg`, sans moteur de requête binaire natif)
- **Authentification** : Auth.js (next-auth v5), stratégie JWT, fournisseur Credentials
  (email/mot de passe), RBAC applicatif
- **Conteneurisation** : Docker (image de production `Dockerfile`, Postgres local via
  `docker/docker-compose.yml`)

### Décisions notables

- **Pas de middleware/proxy pour l'auth.** Next.js 16 a renommé `middleware.ts` en
  `proxy.ts` et interdit le runtime `edge` pour `proxy` — or Prisma ne fonctionne pas en
  edge runtime. Le contrôle d'accès est donc fait **côté serveur dans chaque layout**
  (`app/technician/layout.tsx`, `app/organization/layout.tsx`, `app/admin/layout.tsx`)
  via `requireRole()` (`lib/permissions/index.ts`), jamais uniquement côté client.
- **Prisma 7** exige un adaptateur de pilote explicite (plus de connexion implicite via
  `DATABASE_URL` dans le client) : voir `lib/db/prisma.ts`. L'URL de connexion elle-même
  vit dans `prisma.config.ts`, plus dans `schema.prisma`.
- **Pas d'adaptateur Prisma pour Auth.js.** Le MVP n'utilise que le fournisseur
  Credentials avec une stratégie de session JWT ; les modèles `Account`/`Session` du
  schéma d'adaptateur standard Auth.js ne sont donc pas nécessaires et n'ont pas été
  ajoutés. Ils seront introduits si une connexion OAuth (Google, LinkedIn, etc.) est
  ajoutée plus tard.
- **`TechnicianProfile.primaryTradeId` et `countryId` sont nullables** : l'inscription
  crée un compte minimal, le métier et le pays sont renseignés lors de l'onboarding (page
  à venir), pas à la création du compte.

## Prérequis

- Node.js 22+
- npm 10+
- Docker (pour PostgreSQL en local ; voir `docker/docker-compose.yml`)

## Démarrage local

```bash
# 1. Copier le fichier d'environnement et ajuster si besoin
cp .env.example .env

# 2. Démarrer PostgreSQL et le stockage documentaire MinIO en local (depuis la racine du dépôt)
docker compose -f docker/docker-compose.yml up -d postgres minio minio-init

# 3. Installer les dépendances
npm install

# 4. Appliquer les migrations
npm run db:migrate

# 5. Charger les données de démonstration (voir comptes ci-dessous)
npm run db:seed

# 6. Lancer le serveur de développement
npm run dev
```

L'application est accessible sur http://localhost:3000.

### Comptes de démonstration (données fictives, voir `prisma/seed.ts`)

Mot de passe pour tous les comptes : `Demo1234!`

| Rôle | Email |
|---|---|
| Administrateur | `demo.admin@atti.example` |
| Technicien | `demo.technicien@atti.example` |
| Entreprise | `demo.entreprise@atti.example` |

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production |
| `npm run start` | Démarre le build de production |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Applique les migrations Prisma (`prisma migrate dev`) |
| `npm run db:seed` | Charge les données de démonstration |
| `npm run db:studio` | Ouvre Prisma Studio |

## Déploiement avec Docker

```bash
# Depuis la racine du dépôt : Postgres + application conteneurisée
AUTH_SECRET=$(openssl rand -base64 33) docker compose -f docker/docker-compose.yml --profile full up -d --build
```

Par défaut (sans `--profile full`), `docker compose up` ne démarre que PostgreSQL — le
workflow recommandé en développement est de faire tourner `npm run dev` sur la machine
hôte (rechargement à chaud) contre ce Postgres conteneurisé, et de ne construire l'image
applicative complète (`Dockerfile`) que pour tester un déploiement ou en CI/CD.

## Structure du projet

```
apps/web/
├── app/                        # Routes App Router
│   ├── (page d'accueil, login, register — publiques)
│   ├── dashboard/               # Routeur générique : redirige selon le rôle
│   ├── technician/               # Espace technicien (protégé, rôle TECHNICIAN)
│   ├── organization/             # Espace entreprise (protégé, rôle ORGANIZATION)
│   ├── admin/                    # Administration (protégé, rôle ADMIN)
│   ├── api/auth/[...nextauth]/   # Route handler Auth.js
│   └── api/documents/[id]/download/ # Accès contrôlé aux documents (lien signé S3)
├── auth.ts                      # Configuration Auth.js (Credentials + callbacks RBAC)
├── components/
│   ├── ui/                      # Design system minimal (Button, Input, Badge, Card…)
│   └── features/                # Composants métier (formulaires d'auth, etc.)
├── lib/
│   ├── db/prisma.ts             # Client Prisma singleton (adaptateur pg)
│   ├── actions/                 # Server Actions (mutations)
│   ├── permissions/              # RBAC — vérifications d'accès côté serveur
│   ├── storage/s3.ts              # Client S3/MinIO, upload, liens signés
│   ├── validation/                # Schémas Zod
│   └── generated/prisma/          # Client Prisma généré (ignoré par git)
├── prisma/
│   ├── schema.prisma              # Modèle de données (noyau MVP)
│   ├── migrations/                # Historique des migrations versionnées
│   └── seed.ts                    # Données de démonstration (fictives)
├── Dockerfile                     # Image de production (build multi-stage, standalone)
└── .dockerignore
```

## Modèle de données — périmètre actuel

Le schéma Prisma (`prisma/schema.prisma`) couvre le noyau du MVP : comptes et rôles
(`User`), profils techniciens, taxonomie métiers/compétences (`Trade`, `Skill`),
certifications (avec champs spécifiques au soudage), expériences professionnelles,
documents, score et historique de score, organisations, et journal d'audit.

Les entités listées dans le cahier des charges complet mais hors périmètre MVP
(`Assessment`, `JobOpportunity`, `TalentPool`, `Subscription`, `Payment`, `Training`,
référentiel géographique complet Country/Region/City, etc.) seront ajoutées au fil des
modules correspondants plutôt que d'être stubées par anticipation.

## Sécurité

- Mots de passe hachés avec bcrypt (12 rounds), jamais stockés en clair.
- Toute page protégée vérifie le rôle **côté serveur** (`requireRole` / `requireUser`),
  indépendamment de l'affichage conditionnel côté client.
- Aucune URL publique permanente n'est exposée pour les documents privés : le champ
  `Document.storageKey` est une clé d'objet interne, jamais une URL. Tout accès passe par
  `/api/documents/[id]/download`, qui vérifie l'autorisation (propriétaire ou admin) puis
  génère un lien signé S3 expirant après 5 minutes (voir `lib/storage/s3.ts`).
- Les fichiers téléversés sont validés côté serveur (type MIME, taille max 10 Mo) —
  jamais uniquement côté client.
- Le journal d'audit (`AuditLog`) trace les actions sensibles (ex. `user.registered`,
  `technician_certification.created`).

## Statut d'avancement (MVP)

Implémenté dans cette phase d'initialisation :
- [x] Authentification (Credentials + JWT), hachage des mots de passe
- [x] Rôles et RBAC serveur (Technicien / Entreprise / Admin)
- [x] Inscription technicien (compte minimal, onboarding à compléter)
- [x] Connexion
- [x] Tableaux de bord technicien / entreprise / admin (contenu minimal, RBAC vérifié)
- [x] Journal d'audit (amorce)
- [x] Docker (Postgres local + image de production)
- [x] Données de démonstration
- [x] Onboarding technicien : métier principal/secondaires, pays, ville, expérience,
      disponibilité, mobilité (`/technician/profile`)
- [x] Déclaration de compétences avec auto-évaluation du niveau (`/technician/skills`)
- [x] Référentiel métiers/compétences/pays (41 métiers, 30 compétences, 41 pays)
- [x] Expériences professionnelles : ajout, modification, suppression
      (`/technician/experiences`), pays normalisé via le référentiel `Country`
- [x] Qualifications, certifications et documents : catalogue de 12 certifications
      réelles (ISO 9606, ASME IX, AWS D1.1, API 1104, CSWIP 3.1, ISO 9712…),
      téléversement de justificatifs vers un stockage compatible S3 (MinIO en local),
      téléchargement exclusivement via lien signé à courte durée de vie
      (`/api/documents/[id]/download`), jamais d'URL publique permanente
- [x] Workflow de vérification administrative : file d'attente des certifications et
      expériences déclarées (`/admin/verifications`), validation ou rejet par un
      administrateur avec propagation au document lié et au journal d'audit
- [x] Profil public technicien (`/technicians/[id]`) : vue en lecture seule destinée aux
      entreprises, avec bandeau de confiance (score, taux de vérification), visibilité
      limitée/complète contrôlée par le technicien (`TechnicianProfile.visibility`)
- [x] Redesign de `/technician/profile` : sections regroupées, indicateur de complétude,
      contrôle de visibilité, navigation à onglet actif
- [x] Refonte UX/UI du tableau de bord technicien : bloc identité & confiance,
      score ATTI mis en avant, bandeau de progression du profil, grille de cartes
      cliquables (compétences, expériences, certifications avec statut vérifié/déclaré),
      navigation à défilement horizontal, états de chargement/erreur dédiés
- [x] Espace entreprise (fondations) : inscription (`/register/organization`),
      profil entreprise modifiable (`/organization/profile`), tableau de bord avec
      statut de vérification (`/organization/dashboard`), navigation dédiée
- [x] Recherche de techniciens (`/organization/search`) : filtres métier, pays,
      disponibilité, mobilité, certification, score ATTI minimum ; résultats sous
      forme de cartes cliquables vers le profil public
- [x] Vivier de candidats (`/organization/talent-pool`) : enregistrement de
      techniciens depuis la recherche ou leur profil public, notes internes par
      candidat

À développer dans les prochains modules (voir le plan de développement du cadrage) :
moteur de score, passeport PDF, i18n FR/EN.

## Branding

Le logo (`apps/web/public/logo.png`) n'est pas encore présent dans le dépôt — le composant
`components/ui/logo.tsx` le référence déjà (utilisé dans l'accueil, la navigation
technicien et le profil public) ; déposez le fichier à ce chemin pour qu'il s'affiche.
