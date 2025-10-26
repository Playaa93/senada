# 🚀 Déploiement sur Vercel (Alternative Cloudflare)

## Pourquoi Vercel ?

- ✅ Gratuit pour projets personnels
- ✅ Pas de vérification email compliquée
- ✅ Déploiement en 2 minutes
- ✅ Support Next.js natif
- ✅ HTTPS automatique
- ✅ CDN global

## Option 1: Déploiement via Dashboard (Le plus simple)

### 1. Créer un compte Vercel

Allez sur: https://vercel.com/signup

Connectez-vous avec:
- GitHub (recommandé)
- GitLab
- Bitbucket
- Email

### 2. Importer le projet

1. Cliquez sur **"Add New Project"**
2. **"Import Git Repository"**
3. Si vous n'avez pas de Git, choisissez **"Deploy from CLI"**

### 3. Configuration

**Framework Preset:** Next.js (détecté automatiquement)

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://senada-workers.VOTRE-SUBDOMAIN.workers.dev
NODE_ENV=production
```

(Pour l'instant, gardez l'URL locale: `http://localhost:8787`)

### 4. Déployer

Cliquez sur **"Deploy"**

Vous aurez une URL comme: `https://senada.vercel.app`

## Option 2: Déploiement via CLI (Plus rapide)

### 1. Installer Vercel CLI

```bash
npm install -g vercel
```

### 2. Se connecter

```bash
vercel login
```

### 3. Déployer

```bash
# Dans le dossier du projet
vercel

# Suivez les instructions:
# - Set up and deploy? Yes
# - Which scope? Votre compte
# - Link to existing project? No
# - What's your project's name? senada
# - In which directory? ./
# - Want to override settings? No
```

### 4. Production

```bash
vercel --prod
```

## 📊 Après le déploiement

Vous aurez:
- **URL de production:** `https://senada.vercel.app` (ou votre domaine custom)
- **Preview URLs:** Une URL unique pour chaque commit
- **Analytics:** Trafic et performance
- **Logs:** Logs en temps réel

## 🔄 Mises à jour

### Déploiement automatique (avec Git)

1. Connectez votre repo GitHub/GitLab
2. Chaque push sur `main` → déploiement automatique

### Déploiement manuel

```bash
vercel --prod
```

## 🌐 Configuration avec Worker Cloudflare

Une fois le Worker Cloudflare déployé:

### 1. Mettre à jour les variables d'environnement sur Vercel

Dashboard Vercel > Votre projet > Settings > Environment Variables

```
NEXT_PUBLIC_API_URL=https://senada-workers.VOTRE-SUBDOMAIN.workers.dev
```

### 2. Redéployer

Le site se redéploie automatiquement avec les nouvelles variables.

## 💰 Limites Gratuit Vercel

- **Bandwidth:** 100 GB/mois
- **Builds:** Illimités
- **Serverless Functions:** 100 GB-Hrs
- **Domaines custom:** Illimités

## 🔧 Dépannage

### Build échoue

```bash
# Tester le build localement
npm run build
```

### Variables d'environnement

- Elles doivent commencer par `NEXT_PUBLIC_` pour être accessibles côté client
- Redéployer après modification

### Performance

- Vercel optimise automatiquement Next.js
- CDN global avec edge caching
- Image optimization incluse

## ✅ Avantages Vercel vs Cloudflare Pages

| Feature | Vercel | Cloudflare Pages |
|---------|--------|------------------|
| Setup | 2 min | Nécessite email vérifié |
| Next.js Support | Natif | Bon mais moins optimisé |
| Analytics | Inclus | Basique |
| Edge Functions | Oui | Oui (Workers) |
| Gratuit | Oui | Oui |
| Domaine custom | Oui | Oui |

## 🎯 Résumé Déploiement Complet

```bash
# 1. Installer Vercel
npm install -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
vercel --prod

# 4. Votre application est en ligne !
# URL: https://senada.vercel.app
```

**Temps total:** 5 minutes ⏱️

---

**Note:** Pour le moment, l'API tourne en local. Une fois que vous aurez vérifié votre email Cloudflare, vous pourrez déployer le Worker et mettre à jour `NEXT_PUBLIC_API_URL`.
