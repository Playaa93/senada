# 🚀 Guide de Déploiement Senada

## Architecture en Production

```
┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────────────┐
│   Frontend Next.js  │────────>│  Worker Cloudflare  │────────>│  Base D1 Production │
│  Cloudflare Pages   │         │   *.workers.dev     │         │     senada-db       │
└─────────────────────┘         └─────────────────────┘         └─────────────────────┘
        HTTPS                            API                          SQLite
```

## ✅ Étapes Complétées

- [x] Base D1 créée: `senada-db`
- [x] Migrations appliquées (4 tables)
- [x] Données seed insérées (10 parfums, 3 fournisseurs)
- [x] Worker compilé et prêt

## 📋 Étape 1: Enregistrer Workers.dev (OBLIGATOIRE)

1. **Aller sur:** https://dash.cloudflare.com/ad8c573b14dd679cfd357061047acc29/workers/onboarding
2. **Choisir un nom** (ex: `senada-api`, `nihadatu-senada`)
3. **Résultat:** Vous aurez `votre-nom.workers.dev`

## 📋 Étape 2: Déployer le Worker

Une fois le sous-domaine enregistré:

```bash
cd workers
npx wrangler deploy
```

Vous obtiendrez une URL comme:
```
https://senada-workers.votre-nom.workers.dev
```

## 📋 Étape 3: Configurer le Frontend

Créer `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://senada-workers.votre-nom.workers.dev
NODE_ENV=production
```

## 📋 Étape 4: Déployer sur Cloudflare Pages

### Option A: Via Dashboard (Recommandé)

1. Aller sur: https://dash.cloudflare.com/ad8c573b14dd679cfd357061047acc29/pages
2. **Create a project** > **Connect to Git**
3. Configurer:
   - Framework preset: **Next.js**
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Root directory: `/` (racine)
   - Node version: `20.x`

4. **Environment variables:**
   ```
   NEXT_PUBLIC_API_URL=https://senada-workers.votre-nom.workers.dev
   NODE_ENV=production
   ```

### Option B: Via CLI

```bash
# Installer Wrangler Pages
npm install -g wrangler

# Déployer
npx wrangler pages deploy .next --project-name=senada
```

## 📋 Étape 5: Configurer CORS pour Production

Éditer `workers/src/index.ts`:

```typescript
cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://senada.pages.dev',  // Ajoutez votre domaine Pages
    'https://votredomaine.com'    // Ajoutez votre domaine custom si vous en avez un
  ],
  // ...
})
```

Puis re-déployer le worker:
```bash
cd workers && npx wrangler deploy
```

## 🧪 Tester la Production

### Tester le Worker API:

```bash
# Health check
curl https://senada-workers.votre-nom.workers.dev

# Produits
curl https://senada-workers.votre-nom.workers.dev/api/products
```

### Tester le Frontend:

Ouvrir: `https://senada.pages.dev`

## 📊 URLs de Production

Une fois déployé, vous aurez:

| Service | URL |
|---------|-----|
| Frontend | `https://senada.pages.dev` |
| API Worker | `https://senada-workers.votre-nom.workers.dev` |
| Base D1 | Cloudflare D1 (ID: 0a965cca-f069-4efc-a3c8-12a511a3af85) |

## 🔄 Mise à Jour Continue

### Déployer des changements Worker:

```bash
cd workers
npx wrangler deploy
```

### Déployer des changements Frontend:

Si connecté à Git:
- Push vers `main` → Déploiement automatique

Sinon:
```bash
npm run build
npx wrangler pages deploy .next
```

## 🗄️ Gestion Base de Données D1

### Voir les données:

```bash
cd workers
npx wrangler d1 execute senada-db --remote --command="SELECT * FROM products"
```

### Appliquer nouvelles migrations:

```bash
cd workers
npx wrangler d1 execute senada-db --remote --file=./drizzle/migration.sql
```

## 💰 Limites Gratuites Cloudflare

- **Workers:** 100,000 requêtes/jour
- **D1:** 5 GB stockage, 5 millions lectures/jour
- **Pages:** Builds illimités, 500 builds/mois

## 🆘 Dépannage

### Worker ne se déploie pas:
```bash
# Mettre à jour Wrangler
npm install -g wrangler@latest
```

### CORS Errors:
- Vérifier que l'URL du frontend est dans la liste CORS du worker
- Vérifier que `NEXT_PUBLIC_API_URL` pointe vers le bon Worker

### Base de données vide:
```bash
cd workers
npx wrangler d1 execute senada-db --remote --file=./drizzle/seed.sql
```

## 🔐 Sécurité

Avant la mise en production complète:

1. Ajouter authentification (JWT)
2. Activer rate limiting
3. Configurer CSP headers
4. Activer HTTPS strict

## 📱 PWA en Production

L'application fonctionne comme une PWA:
- Installable sur mobile/desktop
- Fonctionne offline (avec cache)
- Icônes et manifest configurés

## ✅ Checklist de Déploiement

- [ ] Enregistrer workers.dev subdomain
- [ ] Déployer Worker Cloudflare
- [ ] Noter l'URL du Worker
- [ ] Configurer .env.production avec URL Worker
- [ ] Build frontend Next.js
- [ ] Déployer sur Cloudflare Pages
- [ ] Mettre à jour CORS avec URL Pages
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier PWA installation
- [ ] Configurer domaine custom (optionnel)
