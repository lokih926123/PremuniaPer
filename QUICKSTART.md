# ⚡ Quick Start - Premunia CRM

> Déployez votre CRM en production en **15 minutes** !

## 📝 Checklist Rapide

- [ ] Compte Supabase créé
- [ ] Base de données configurée
- [ ] Compte Netlify créé
- [ ] Application déployée
- [ ] Compte admin créé
- [ ] Page promotion supprimée
- [ ] Tests effectués

## 🚀 Étapes (15 minutes)

### 1️⃣ Configuration Supabase (5 min)

```bash
# 1. Allez sur https://supabase.com/dashboard
# 2. Votre projet est déjà créé : axtczypotrjjzvgqdqlw
# 3. Allez dans SQL Editor
# 4. Copiez-collez le contenu de database.sql
# 5. Cliquez sur "Run"
# ✅ Tables créées !
```

**Vérification rapide** :
```sql
-- Exécutez ceci pour vérifier
SELECT COUNT(*) FROM site_settings;
-- Devrait retourner : 1
```

### 2️⃣ Activation de l'Auth Email (2 min)

```bash
# 1. Allez dans Authentication > Providers
# 2. Activez "Email"
# 3. Désactivez "Confirm email" (pour les tests)
# ✅ Auth activée !
```

### 3️⃣ Déploiement Netlify (5 min)

**Option A - Depuis GitHub** (Recommandé)

```bash
# Sur votre machine
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/votre-username/premunia-crm.git
git push -u origin main

# Sur Netlify
# 1. Allez sur https://app.netlify.com
# 2. New site from Git
# 3. Connect to GitHub
# 4. Select repository
# 5. Deploy !
# ✅ Site en ligne !
```

**Option B - Drag & Drop** (Plus rapide)

```bash
# Sur votre machine
npm install
npm run build

# Sur Netlify
# 1. Allez sur https://app.netlify.com
# 2. Drag & drop le dossier "dist/"
# ✅ Site en ligne !
```

### 4️⃣ Premier Compte Admin (2 min)

```bash
# 1. Allez sur https://votre-site.netlify.app/signup
# 2. Créez votre compte :
#    - Email: admin@premunia.fr
#    - Password: VotreMotDePasseSécurisé
#    - Nom: Votre Nom
# 3. Cliquez sur S'inscrire
# 4. Vous êtes redirigé vers /promote-admin
# 5. Cliquez sur "Me promouvoir en Admin"
# ✅ Vous êtes admin !
```

### 5️⃣ Sécurité - CRITIQUE ! (1 min)

```bash
# Sur votre machine
rm src/app/pages/PromoteAdmin.tsx

# Éditez src/app/routes.tsx
# Supprimez ces lignes :
{
  path: '/promote-admin',
  Component: PromoteAdmin,
},

# Redéployez
git add .
git commit -m "Remove promote-admin for security"
git push

# ✅ Sécurisé !
```

## ✅ Tests de Vérification

### Test 1 : Landing Page

```
✅ Va sur https://votre-site.netlify.app
✅ La page s'affiche correctement
✅ Remplis le formulaire de contact
✅ Clique sur "Demander mon étude gratuite"
✅ Message de succès apparaît
```

### Test 2 : Dashboard Admin

```
✅ Va sur /signin
✅ Connecte-toi avec ton email/password
✅ Tu arrives sur /admin
✅ Les statistiques s'affichent
✅ Tu vois les derniers leads
```

### Test 3 : Gestion des Leads

```
✅ Va sur /admin/leads
✅ Tu vois le lead que tu as créé
✅ Clique sur Edit
✅ Change le statut à "Contacted"
✅ Ajoute une note
✅ Clique sur Enregistrer
✅ Le lead est mis à jour
```

### Test 4 : Paramètres

```
✅ Va sur /admin/settings
✅ Change le titre hero
✅ Change l'email de contact
✅ Clique sur Enregistrer
✅ Va sur / (page d'accueil)
✅ Les nouveaux textes s'affichent
```

## 🎯 URLs Importantes

### Votre Application

- **Site public** : `https://votre-site.netlify.app`
- **Admin** : `https://votre-site.netlify.app/admin`
- **Connexion** : `https://votre-site.netlify.app/signin`

### Supabase Dashboard

- **Tables** : https://supabase.com/dashboard/project/axtczypotrjjzvgqdqlw/editor
- **Auth Users** : https://supabase.com/dashboard/project/axtczypotrjjzvgqdqlw/auth/users
- **SQL Editor** : https://supabase.com/dashboard/project/axtczypotrjjzvgqdqlw/sql

### Netlify Dashboard

- **Site settings** : https://app.netlify.com/sites/votre-site/settings
- **Deploy logs** : https://app.netlify.com/sites/votre-site/deploys
- **Domain settings** : https://app.netlify.com/sites/votre-site/settings/domain

## 🐛 Problèmes Fréquents

### ❌ "Cannot read properties of undefined"

**Cause** : Les tables Supabase ne sont pas créées  
**Solution** :
```sql
-- Allez dans SQL Editor et exécutez database.sql
```

### ❌ "User not authorized"

**Cause** : RLS policies pas correctement configurées  
**Solution** :
```sql
-- Vérifiez les policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### ❌ "Forbidden: Admin access required"

**Cause** : Vous n'êtes pas dans la table admins  
**Solution** :
```sql
-- Vérifiez si vous êtes admin
SELECT * FROM admins WHERE user_id = 'votre-user-id';

-- Sinon, allez sur /promote-admin et promouvez-vous
```

### ❌ Build failed sur Netlify

**Cause** : Erreur de compilation  
**Solution** :
```bash
# Testez le build localement
npm install
npm run build

# Regardez les erreurs et corrigez
```

## 📞 Commandes Utiles

### Développement Local

```bash
# Installation
npm install

# Dev server (http://localhost:5173)
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

### Git / Déploiement

```bash
# Status
git status

# Add all
git add .

# Commit
git commit -m "Description"

# Push (auto-deploy sur Netlify)
git push

# Create new branch
git checkout -b feature-name
```

### Supabase (SQL)

```sql
-- Voir tous les leads
SELECT * FROM leads ORDER BY created_at DESC;

-- Voir les stats
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'new') as new,
  COUNT(*) FILTER (WHERE status = 'converted') as converted
FROM leads;

-- Voir les admins
SELECT u.email, a.created_at 
FROM admins a 
JOIN auth.users u ON a.user_id = u.id;

-- Supprimer un lead spécifique
DELETE FROM leads WHERE email = 'test@example.com';
```

## 🎉 Bravo !

Votre CRM Premunia est maintenant en production ! 

**Prochaines étapes suggérées** :

1. ✅ Configurez un domaine personnalisé sur Netlify
2. ✅ Ajoutez Google Analytics
3. ✅ Configurez le serveur SMTP pour les emails
4. ✅ Invitez votre équipe
5. ✅ Commencez à capturer des leads !

---

**Besoin d'aide ?**  
📖 Documentation complète : [README.md](./README.md)  
🏗️ Architecture technique : [ARCHITECTURE.md](./ARCHITECTURE.md)  
🚀 Guide complet déploiement : [DEPLOYMENT.md](./DEPLOYMENT.md)

**Support** :
- GitHub Issues
- Supabase Docs : https://supabase.com/docs
- Netlify Docs : https://docs.netlify.com
