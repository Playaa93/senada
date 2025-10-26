# 🚀 Guide de Démarrage Rapide - Senada

Application de gestion de stock pour parfums avec Next.js 16, Cloudflare Workers et PWA.

## 📋 Prérequis

- Node.js >= 20.0.0
- npm >= 10.0.0
- Compte Cloudflare (gratuit)

## 🎯 Installation en 5 Minutes

### 1. Installer les dépendances

```bash
# Frontend
cd "C:\Users\hzuki\OneDrive\Bureau\Applications\Senada"
npm install

# Backend
cd workers
npm install
```

### 2. Configurer l'environnement

```bash
# Copier les fichiers d'environnement
cp .env.example .env.local
cd workers
cp .dev.vars.example .dev.vars
```

Éditer `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```

### 3. Configurer Cloudflare D1

```bash
cd workers

# Créer la base de données D1
npx wrangler d1 create senada-db

# Copier le database_id dans wrangler.toml
# Il sera affiché dans la sortie de la commande précédente
```

Éditer `workers/wrangler.toml` et remplacer `YOUR_DATABASE_ID` :
```toml
[[d1_databases]]
binding = "DB"
database_name = "senada-db"
database_id = "COPIER_L_ID_ICI"
```

### 4. Créer les tables de la base de données

```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:migrate
```

### 5. (Optionnel) Générer les icônes PWA

```bash
cd ..
npm run generate-icons
```

Suivre les instructions pour créer une icône 512x512px et la placer dans `/public/icons/icon.png`.

## 🏃 Lancement

### Mode Développement

**Terminal 1 - Backend (Cloudflare Workers):**
```bash
cd workers
npm run dev
# API disponible sur http://localhost:8787
```

**Terminal 2 - Frontend (Next.js):**
```bash
npm run dev
# App disponible sur http://localhost:3000
```

### Vérifications

1. **Backend**: Ouvrir http://localhost:8787/api/products (devrait retourner `[]`)
2. **Frontend**: Ouvrir http://localhost:3000 (devrait afficher le dashboard)
3. **Drizzle Studio**: `cd workers && npm run db:studio` (UI visuelle pour la DB)

## 📊 Structure de l'Application

```
Senada/
├── app/                    # Next.js 16 App Router
│   ├── (dashboard)/       # Pages du dashboard
│   ├── layout.tsx         # Layout principal
│   └── sw.ts             # Service Worker PWA
├── components/
│   ├── ui/               # shadcn/ui components
│   └── features/         # Composants métier
├── lib/
│   ├── api/              # API client + hooks
│   ├── offline/          # Sync queue PWA
│   └── providers/        # React providers
├── workers/              # Cloudflare Workers
│   └── src/
│       ├── routes/       # API routes (Hono)
│       ├── db/           # Drizzle schema
│       └── ml/           # Algorithmes de prédiction
└── docs/                 # Documentation
```

## 🎨 Fonctionnalités Disponibles

### ✅ Déjà Implémenté

- **Dashboard**: Vue d'ensemble des stocks
- **Gestion des Produits**: CRUD complet avec filtres
- **Gestion des Fournisseurs**: Base de données fournisseurs
- **Mouvements de Stock**: Entrées/sorties avec historique
- **Prédictions de Réappro**: Algorithmes ML pour suggestions
- **PWA**: Mode offline, installable, notifications

### 📦 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/products` | GET | Liste des produits |
| `/api/products/:id` | GET | Détails d'un produit |
| `/api/products` | POST | Créer un produit |
| `/api/stock/movements` | GET | Historique des mouvements |
| `/api/stock/movements` | POST | Enregistrer un mouvement |
| `/api/suppliers` | GET | Liste des fournisseurs |
| `/api/analytics/dashboard` | GET | Données du dashboard |
| `/api/analytics/predictions` | GET | Prédictions de réappro |

Voir `docs/API.md` pour la documentation complète.

## 🔧 Scripts Utiles

```bash
# Frontend
npm run dev              # Dev avec Turbopack
npm run build           # Build production
npm run lint            # Linter
npm run typecheck       # Vérifier les types
npm run format          # Formater le code

# Backend (workers/)
npm run dev             # Dev local
npm run deploy          # Déployer sur Cloudflare
npm run db:generate     # Générer migrations
npm run db:migrate      # Appliquer migrations
npm run db:studio       # Drizzle Studio UI
```

## 🚀 Premier Ajout de Produit

1. Lancer le backend et frontend
2. Aller sur http://localhost:3000/products
3. Cliquer sur "Add Product"
4. Remplir le formulaire :
   - **Name**: Chanel No. 5 EDP 100ml
   - **SKU**: CHANEL-005-100
   - **Category**: Women's Perfume
   - **Buy Price**: 75
   - **Sell Price**: 120
   - **Current Stock**: 50
   - **Min Stock**: 10
5. Sauvegarder

## 🧪 Tester les Prédictions

```bash
# Via l'API directement
curl http://localhost:8787/api/analytics/predictions

# Ou via l'interface
# Aller sur http://localhost:3000/restock
```

## 🔍 Debugger

### Drizzle Studio (Base de données)
```bash
cd workers
npm run db:studio
# Ouvre http://localhost:4983
```

### React Query DevTools
- Automatiquement affiché en mode dev dans le navigateur
- Voir les requêtes, cache, mutations en temps réel

### Cloudflare Workers Logs
```bash
cd workers
npx wrangler tail
```

## 📱 Tester le PWA

1. Build l'application : `npm run build`
2. Lancer en production : `npm start`
3. Ouvrir Chrome DevTools → Application → Manifest
4. Cliquer sur "Install" pour installer l'app
5. Tester le mode offline (DevTools → Network → Offline)

## 🌐 Déploiement Production

### Backend (Cloudflare Workers)
```bash
cd workers
npm run deploy
# Note l'URL : https://senada.YOUR_SUBDOMAIN.workers.dev
```

### Frontend (Cloudflare Pages)
```bash
# Connecter le repo GitHub
npx wrangler pages project create senada

# Ou déployer directement
npm run build
npx wrangler pages deploy .next
```

Voir `docs/DEPLOYMENT.md` pour les détails complets.

## 🆘 Problèmes Courants

### Erreur "Database not found"
- Vérifier que `database_id` dans `wrangler.toml` est correct
- Relancer `npm run db:migrate`

### Erreur CORS
- Vérifier que `NEXT_PUBLIC_API_URL` dans `.env.local` est correct
- Le backend autorise `localhost:3000` par défaut

### PWA ne s'installe pas
- Utiliser HTTPS en production (HTTP ne marche qu'en local)
- Vérifier que `manifest.json` est accessible
- Build l'app (`npm run build`)

### Types TypeScript incorrects
- Relancer `npm run typecheck`
- S'assurer que les types dans `/workers/src/db/schema.ts` et `/lib/api/types.ts` sont synchronisés

## 📚 Documentation Complète

- **Architecture**: `docs/ARCHITECTURE.md`
- **API**: `docs/API.md`
- **Base de données**: `docs/DATABASE.md`
- **Déploiement**: `docs/DEPLOYMENT.md`
- **Développement**: `docs/DEVELOPMENT.md`
- **PWA**: `docs/PWA_SETUP.md`

## 🎯 Prochaines Étapes Suggérées

1. ✅ Ajouter des produits de test
2. ✅ Tester les mouvements de stock
3. ✅ Vérifier les prédictions de réappro
4. 📸 Uploader des photos de produits (future feature)
5. 🔐 Ajouter l'authentification (si multi-utilisateurs)
6. 📊 Exporter les rapports en PDF/Excel
7. 🌍 Déployer en production

## 💡 Conseils

- Utiliser Drizzle Studio pour explorer la base de données visuellement
- Les prédictions s'améliorent avec plus de données de ventes
- Tester le mode offline pour voir la sync queue en action
- Les icônes PWA peuvent être générées avec https://realfavicongenerator.net/

---

**Besoin d'aide ?** Consulter la documentation dans `/docs` ou vérifier les exemples dans le code.

Bon développement ! 🚀
