# 🗺️ Blueprint Architecture : Le Petit Oracle

> **Document source de vérité unique.**  
> Tout développement, audit ou refactor doit se conformer à ce document.  

---

## 1. Objectif & Vision Globale

Application web responsive (mobile & desktop) festive et ludique permettant à la famille et aux proches de la tribu de faire leurs pronostics de naissance (date, heure, sexe, prénom, qui pleurera en premier, poids, taille), de visualiser le mural collectif des prédictions, et d'accéder au Sanctuaire des Parents pour saisir les données réelles du jour J, calculer automatiquement le score final et couronner le Grand Oracle de la Tribu.

**Objectif final :** Application web moderne, ultra-rapide, élégante, résiliente et parfaitement responsive, connectée à Supabase avec fallback automatique en LocalStorage.

---

## 2. Stack Technique

| Technologie | Version | Usage |
|---|---|---|
| **Vite** | 6.2.x | Build tool & dev server |
| **React** | 19.x | Framework UI (`React 19`) |
| **TypeScript** | 5.7.x | Langage et typage strict |
| **Tailwind CSS** | 4.x (`@tailwindcss/vite`) | Framework CSS utilitaire v4 |
| **Supabase Client** | 2.49.x (`@supabase/supabase-js`) | Base de données PostgreSQL Cloud, RLS et persistance |
| **canvas-confetti** | 1.9.x | Animations de célébration (soumission & victoire) |
| **Lucide React** | 0.477.x | Icônes SVG modernes |
| **Vercel** | Node 22.x | Hébergement et déploiement continu |
| **Git & GitHub** | — | Versioning (`main`) |

**Règle :** Fichiers de configuration (`vite.config.ts`, `tsconfig.json`) en TypeScript.

---

## 3. Architecture des Dossiers

```
LePetitOracle/
├── .env.local                     ← Variables d'environnement locales (Supabase, Auth Parents)
├── .gitignore
├── index.html                     ← Point d'entrée SPA (meta tags, polices Google Fonts)
├── package.json
├── package-lock.json
├── tsconfig.json                  ← Configuration TypeScript strict
├── vite.config.ts                 ← Build Vite + plugin React + plugin Tailwind v4
├── vercel.json                    ← Configuration du projet Vercel
├── blueprint.md                   ← SOURCE DE VÉRITÉ (versionné sur GitHub)
│
├── public/
│   ├── favicon.png                ← Favicon du site
│   └── assets/                    ← Illustrations PNG/SVG haute définition
│       ├── bebe.png               ← Icône section premier pleur
│       ├── coupe.png              ← Trophée du Grand Oracle
│       ├── date.png               ← Icône date & heure
│       ├── fille.png              ← Icône bouton sexe fille
│       ├── garcon.png             ← Icône bouton sexe garçon
│       ├── logo.png               ← Logo principal header "Le Petit Oracle"
│       ├── maman.png              ← Icône maman pleure
│       ├── papa-maman.png         ← Icône parents pleurent
│       ├── papa.png               ← Icône papa pleure
│       ├── poids.png              ← Icône carte poids
│       ├── profile.png            ← Icône auteur du pronostic
│       ├── taille-poids.png       ← Illustration gabarit
│       └── taille.png             ← Icône carte taille
│
├── supabase/
│   └── schema.sql                 ← Script SQL d'initialisation (tables, ENUMs, RLS & index)
│
└── src/
    ├── App.tsx                    ← Composant racine (gestion des onglets, chargement Supabase, modales)
    ├── main.tsx                   ← Point d'entrée React (ReactDOM.createRoot)
    ├── index.css                  ← Import Tailwind v4, styles globaux, sliders et masquage no-spinner
    ├── vite-env.d.ts              ← Déclarations de types Vite
    │
    ├── types/
    │   └── prediction.ts          ← Interfaces TypeScript (Prediction, ActualBirthData, ScoreBreakdown, RankedPrediction)
    │
    ├── lib/
    │   └── supabase.ts            ← Initialisation Supabase, fallback LocalStorage, CRUD (fetchPredictions, savePrediction, etc.)
    │
    ├── utils/
    │   └── scoring.ts             ← Moteur de calcul des scores (potentiel & réel), formatage des prénoms et hachage DJB2 des 20 préfixes
    │
    └── components/
        ├── Header.tsx             ← Navigation sticky responsive desktop/mobile (Pronostic, Classement, Mode parents, Partager)
        ├── PredictionForm.tsx     ← Formulaire complet des pronostics (cartes interactives, curseurs, boucle heure/minute)
        ├── StepProgress.tsx       ← Barre d'avancement dynamique du formulaire (0% à 100%)
        ├── ScoreSidebar.tsx       ← (Résiduel) Affichage récapitulatif du score
        ├── Leaderboard.tsx        ← Le mural des prédictions (grille responsive, préfixes DJB2, temps relatif dynamique)
        ├── ParentsMode.tsx        ← Le Sanctuaire des Parents (saisie des vraies données, calcul automatique du classement)
        ├── ParentsAuthModal.tsx   ← Modale d'authentification des parents (identifiants d'accès)
        ├── SuccessModal.tsx       ← Modale de félicitations avec confettis après soumission
        └── BirthResultsView.tsx   ← Vue de célébration finale de la naissance (post-publication parents avec podium et classement)
```

---

## 4. Rôles & Accès Utilisateurs

### 4.1 Rôles

| Rôle | Accès | Fonctionnalités |
|---|---|---|
| **Visiteur / Tribu** | Vue Publique (Onglets `form` et `leaderboard`) | Soumettre un pronostic, voir le mural des prédictions, partager l'application, consulter le classement |
| **Parents** | Vue Sécurisée (Onglet `parents` déverrouillé via `ParentsAuthModal`) | Saisir les données réelles du jour J, calculer le score final, publier les résultats officiels |

### 4.2 Onglets de l'Application

- **Onglet `form` ("Faire un pronostic")** : Formulaire de saisie d'un nouveau pronostic avec calcul du score potentiel en direct.
- **Onglet `leaderboard` ("Classement")** : Le mural des prédictions enregistrées par tous les membres de la tribu.
- **Onglet `parents` ("Mode parents")** : Accessible par identifiants. Permet la publication officielle du Reveal du bébé et le couronnement du Grand Oracle.

---

## 5. Règles Métier Critiques & Barème de Scoring 🧮

### 5.1 Barème Officiel de Calcul du Score (300 Pts Max)

Le calcul du score réel final s'effectue dans `src/utils/scoring.ts` (`calculateFinalScore`) lors de la saisie des résultats par les parents :

| Critère | Points Max | Règle de Dépréciation / Calcul |
|---|---|---|
| **Sexe exact** | **50 pts** | Exactitude absolue (`pred.gender === actual.gender`) |
| **Prénom exact** | **90 pts** | Exactitude absolue insensible à la casse (`trim().toLowerCase()`) |
| **Date & Heure** | **50 pts** | **-2 pts par heure d'écart** absolue avec la date/heure de naissance |
| **Qui pleure en 1er** | **30 pts** | Exactitude absolue (`maman`, `papa`, `les_deux`) |
| **Poids (g)** | **40 pts** | **-1 pt tous les 20g d'écart** absolue avec le poids réel |
| **Taille (cm)** | **40 pts** | **-4 pts par cm d'écart** absolue avec la taille réelle |
| **TOTAL MAX** | **300 pts** | Score cumulé du participant |

### 5.2 Système de Préfixes Oracles (Algorithme DJB2)
Afin d'attribuer un préfixe mystique et amusant à chaque proche (ex: *"Astrologue Mamie Chantal"*, *"Visionnaire Tonton Lucas"*), l'application utilise l'algorithme de hachage à haute entropie **DJB2** (`src/utils/scoring.ts`) :

- **Liste de 20 préfixes unisexes/inclusifs (1 mot)** :
  `Oracle`, `Visionnaire`, `Astrologue`, `Médium`, `Devin(e)`, `Sage`, `Astronome`, `Prophète`, `Guide`, `Augure`, `Interprète`, `Clairvoyant(e)`, `Initié(e)`, `Érudit(e)`, `Tarologue`, `Mentor`, `Présage`, `Lucide`, `Savant(e)`, `Cabaliste`.
- **Entropie combinée** : Le hachage combine `user_name` + `id` du pronostic pour garantir une répartition homogène et variée sans doublons successifs.
- **Propriété** : Hachage déterministe (le préfixe attribué à un pronostic reste 100% fixe et identique sur tous les appareils).

### 5.3 Sécurité, Fallback & Anti-Doublon 🛡️
- **Persistance hybride** : Les prédictions sont enregistrées dans la table Supabase `predictions`. Si Supabase est indisponible ou hors-ligne, le pronostic est automatiquement sauvegardé dans `localStorage` (`le_petit_oracle_predictions`).
- **Détection des doublons** : Avant enregistrement, `checkIfPredictionExists(userName)` vérifie si un pronostic existe déjà sous ce prénom/nom pour éviter les doublons.
- **Formatage du temps relatif** : L'affichage temporel sur le mural (*"Prophétisé il y a 15 min"*, *"Prophétisé hier"*) est calculé dynamiquement à partir de `created_at`.
- **Navigation circulaire Heure/Minute** : Les sélecteurs d'heure/minute bouclent automatiquement (23h ➔ 00h / 59m ➔ 00m) avec validation et formatage automatique à deux chiffres (`padStart(2, '0')`).

---

## 6. Schéma de la Base de Données (Supabase PostgreSQL)

### 6.1 Table `predictions`
Stocke les pronostics individuels soumis par les proches.

```sql
CREATE TABLE public.predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  gender baby_gender NOT NULL DEFAULT 'fille',
  birth_date TIMESTAMPTZ NOT NULL,
  first_name_guess TEXT DEFAULT '',
  who_cries_first who_cries_enum NOT NULL DEFAULT 'bebe',
  weight_grams INTEGER NOT NULL DEFAULT 3300,
  height_cm INTEGER NOT NULL DEFAULT 50
);
```

### 6.2 Table `birth_results`
Stocke les résultats réels saisis et publiés par les parents (ligne unique `id = 1`).

```sql
CREATE TABLE public.birth_results (
  id INT PRIMARY KEY DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  first_name TEXT NOT NULL,
  gender baby_gender NOT NULL DEFAULT 'fille',
  who_cried_first who_cries_enum NOT NULL DEFAULT 'bebe',
  birth_date TIMESTAMPTZ NOT NULL,
  weight_grams INTEGER NOT NULL DEFAULT 3350,
  height_cm INTEGER NOT NULL DEFAULT 50,
  is_published BOOLEAN DEFAULT false,
  CONSTRAINT single_row_check CHECK (id = 1)
);
```

---

## 7. Variables d'Environnement

Variables requises dans `.env.local` et sur Vercel :

```bash
# Supabase Cloud Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Authentification Mode Parents
VITE_PARENTS_USERNAME="GigiJeje"
VITE_PARENTS_PASSWORD="Leo25"
```

---

## 8. Normes de Style & Charte Graphique 🎨
- **Typographie** : Polices Serif pour les grands titres (`font-serif`), Sans-serif pour les textes de labellisation et formulaires.
- **Casse des textes** : **Majuscule en début de phrase uniquement** (casse de phrase standard française) sur tous les titres, sous-titres, boutons et cartes.
- **Palette de couleurs** :
  - Fond de page principal : `#EAF1F4` / Slate poudré
  - Carte date/heure : `#D7E7EE` / Bleu pastel
  - Carte sexe : `#FAF5EC` / Ambre pastel
  - Carte prénom : `#E8F3F0` / Vert menthe pastel
  - Carte qui pleure : `#EEF7F5`
  - Carte poids & taille : `#FAF0EF` / Rose pêche pastel
  - Badge fille : Rose poudré (`bg-pink-50 text-pink-700 border-pink-200`) avec émoticône 🌸
  - Badge garçon : Vert d'eau (`bg-teal-50 text-teal-800 border-teal-200`) avec émoticône 🚀
  - Bouton d'action principal : `#528F79` (Vert sauge) avec hover `#437A66`
