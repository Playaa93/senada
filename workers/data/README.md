# Fragrance Database Import

Ce dossier contient les données du dataset Fragrantica pour l'import dans la base de données.

## Instructions

### 1. Télécharger le dataset

1. Allez sur Kaggle: https://www.kaggle.com/datasets/olgagmiufana1/fragrantica-com-fragrance-dataset
2. Téléchargez le fichier `fra_cleaned.csv`
3. Placez-le dans ce dossier: `workers/data/fra_cleaned.csv`

### 2. Exécuter l'import

```bash
# Installer les dépendances si nécessaire
cd workers
npm install csv-parse

# Exécuter le script d'import
npx tsx scripts/import-fragrances.ts
```

Ce script va:
- Parser le fichier CSV
- Transformer les données pour correspondre au schéma DB
- Générer des fichiers SQL par batch (100 parfums par fichier)
- Créer les fichiers dans `workers/migrations/fragrance-import/`

### 3. Importer dans D1

**Base locale:**
```bash
cd workers
for %f in (migrations\fragrance-import\*.sql) do npx wrangler d1 execute senada-db --local --file="%f"
```

**Base production:**
```bash
cd workers
for %f in (migrations\fragrance-import\*.sql) do npx wrangler d1 execute senada-db --remote --file="%f"
```

## Structure du dataset

Le CSV doit contenir les colonnes suivantes (ajustez selon la structure réelle):
- `name` - Nom du parfum
- `brand` - Marque
- `gender` - Genre (for women/for men/unisex)
- `year` - Année de sortie
- `perfumer` - Nom du parfumeur
- `topNotes` - Notes de tête
- `middleNotes` - Notes de coeur
- `baseNotes` - Notes de fond
- `mainAccords` - Accords principaux
- `description` - Description
- `rating` - Note moyenne
- `votes` - Nombre de votes
- `imageUrl` - URL de l'image
- `fragrancaId` - ID Fragrantica

## Vérification

Après l'import, vérifiez le nombre de parfums:

```bash
npx wrangler d1 execute senada-db --remote --command "SELECT COUNT(*) as total FROM fragrances"
```

## Utilisation dans l'application

Une fois importé, le composant `FragranceSearch` dans le frontend utilisera automatiquement cette base de données locale pour les recherches, avec fallback sur l'API Fragella si nécessaire.
