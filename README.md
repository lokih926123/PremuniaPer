# 🏦 Premunia CRM - Plateforme de Gestion des Leads

> **Plateforme CRM complète pour Premunia**, spécialiste PER (Plan Épargne Retraite) pour professions libérales. Landing page publique avec formulaire de contact + Dashboard admin complet avec gestion CRUD des leads, statistiques temps réel, et personnalisation du site.

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-blue)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7)](https://www.netlify.com/)

## ✨ Fonctionnalités

### 🌐 Landing Page Publique (`/`)
- ✅ Design moderne aux couleurs Premunia (Rouge #EE3B33, Orange #F79E1B)
- ✅ **Formulaire de contact** avec validation temps réel
- ✅ **Simulation fiscale interactive** avec graphique Recharts
- ✅ Sections : Hero, Avantages, Cibles, Simulation, Contact
- ✅ **100% Responsive** (mobile, tablette, desktop)
- ✅ **Textes personnalisables** depuis le dashboard admin

### 🔐 Authentification Sécurisée
- ✅ **Inscription / Connexion** via Supabase Auth
- ✅ Protection des routes admin
- ✅ Gestion des sessions avec JWT
- ✅ Page de promotion admin (à supprimer après setup)

### 📊 Dashboard Admin (`/admin`)
- ✅ **Statistiques en temps réel**
  - Total leads
  - Nouveaux leads
  - Leads convertis
  - Taux de conversion
- ✅ Tableau des derniers prospects
- ✅ Accès rapide à toutes les sections

### 👥 Gestion des Leads (`/admin/leads`)
- ✅ **Liste complète** avec pagination
- ✅ **Recherche** par nom, email, profession
- ✅ **Filtres** par statut (Nouveau, Contacté, Converti, Rejeté)
- ✅ **CRUD complet**
  - Création via formulaire public
  - Lecture de tous les leads
  - Modification du statut + notes internes
  - Suppression sécurisée
- ✅ Modal d'édition avec informations détaillées

### ⚙️ Paramètres (`/admin/settings`)
- ✅ **Personnalisation complète** de la landing page
  - Titre Hero
  - Sous-titre
  - Email de contact
  - Téléphone
  - Adresse
- ✅ **Aperçu en temps réel** des modifications
- ✅ Sauvegarde instantanée

### 📧 Automatisation Email (`/admin/automation`)
- ✅ **Configuration SMTP** pour envoi automatique
- ✅ Exemples pour Gmail, Outlook, SendGrid
- ✅ Stockage sécurisé des credentials
- ✅ Préparé pour :
  - Notifications auto sur nouveau lead
  - Emails de confirmation
  - Relances automatiques
  - Newsletters

## 🛠️ Stack Technique

### Frontend
- **React 18.3.1** avec TypeScript
- **React Router 7** (Data mode) pour la navigation
- **TanStack React Query** pour la gestion du cache et des requêtes
- **Tailwind CSS v4** pour le styling
- **Recharts** pour les graphiques de simulation
- **Lucide React** pour les icônes
- **Sonner** pour les notifications toast
- **date-fns** pour la gestion des dates

### Backend
- **Supabase** (PostgreSQL)
  - Base de données relationnelle
  - Row Level Security (RLS)
  - Authentification intégrée
  - Real-time subscriptions (prêt pour le futur)
- **API CRUD** directe via Supabase Client

### Déploiement
- **Netlify** pour l'hébergement
- **Build automatique** depuis GitHub
- **SSL gratuit** et CDN global
- **Previews automatiques** pour les pull requests

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou pnpm
- Compte Supabase
- Compte Netlify (pour le déploiement)

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/votre-username/premunia-crm.git
cd premunia-crm

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

### Configuration Supabase

1. Créez votre projet Supabase
2. Exécutez le SQL dans `/DEPLOYMENT.md` pour créer les tables
3. Les credentials Supabase sont déjà dans `/utils/supabase/info.tsx`

## 🚀 Déploiement

Consultez le guide complet dans **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Résumé rapide :

```bash
# 1. Créer les tables Supabase (voir DEPLOYMENT.md)

# 2. Build de production
npm run build

# 3. Déployer sur Netlify
# Option A : Connecter votre repo GitHub à Netlify
# Option B : Drag & drop du dossier dist/

# 4. Créer votre compte admin
# - Allez sur /signup
# - Créez votre compte
# - Allez sur /promote-admin
# - Cliquez sur "Me promouvoir en Admin"

# 5. IMPORTANT : Supprimer /src/app/pages/PromoteAdmin.tsx
```

## 📊 Structure de la Base de Données

### Tables

#### `leads`
```sql
- id (UUID, PK)
- first_name (TEXT)
- last_name (TEXT)
- email (TEXT)
- phone (TEXT)
- profession (TEXT)
- message (TEXT, optional)
- status (TEXT) -- 'new' | 'contacted' | 'converted' | 'rejected'
- notes (TEXT, optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `site_settings`
```sql
- id (UUID, PK)
- hero_title (TEXT)
- hero_subtitle (TEXT)
- contact_email (TEXT)
- contact_phone (TEXT)
- contact_address (TEXT)
- updated_at (TIMESTAMP)
```

#### `smtp_config`
```sql
- id (UUID, PK)
- host (TEXT)
- port (TEXT)
- username (TEXT)
- password (TEXT)
- from_email (TEXT)
- from_name (TEXT)
- updated_at (TIMESTAMP)
```

#### `admins`
```sql
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- created_at (TIMESTAMP)
```

### Row Level Security (RLS)

- **leads** : Lecture publique, création publique, modification/suppression admin uniquement
- **site_settings** : Lecture publique, modification admin uniquement
- **smtp_config** : Admin uniquement (toutes opérations)
- **admins** : Admin uniquement (lecture et insertion)

## 🎨 Charte Graphique Premunia

```css
Rouge Premunia : #EE3B33
Orange        : #F79E1B
Magenta       : #E91E63
Violet        : #880E4F
```

Ces couleurs sont utilisées de manière cohérente dans tout le site pour maintenir l'identité visuelle de Premunia.

## 📱 Routes

| Route | Description | Protection |
|-------|-------------|------------|
| `/` | Landing page publique | Public |
| `/signin` | Connexion | Public |
| `/signup` | Inscription | Public |
| `/promote-admin` | Promotion admin (⚠️ À SUPPRIMER après setup) | Auth |
| `/admin` | Dashboard principal | Admin |
| `/admin/leads` | Gestion des leads | Admin |
| `/admin/settings` | Paramètres du site | Admin |
| `/admin/automation` | Configuration SMTP | Admin |

## 🔒 Sécurité

- ✅ **Row Level Security** (RLS) activé sur toutes les tables
- ✅ **Authentification JWT** via Supabase
- ✅ **Protection des routes** côté frontend
- ✅ **Validation côté serveur** pour toutes les opérations
- ✅ **Mot de passe SMTP chiffré** dans Supabase
- ✅ **CORS** configuré correctement
- ⚠️ **IMPORTANT** : Supprimez `/promote-admin` après le premier admin créé

## 📈 Améliorations Futures

### Niveau 1 (Facile)
- [ ] Export CSV des leads
- [ ] Filtres avancés par date
- [ ] Pagination pour grandes listes
- [ ] Tri des colonnes

### Niveau 2 (Moyen)
- [ ] Templates d'emails personnalisables
- [ ] Envoi d'emails manuels depuis l'interface
- [ ] Pièces jointes sur les leads
- [ ] Statistiques avancées avec graphiques

### Niveau 3 (Avancé)
- [ ] Workflows d'automatisation multi-étapes
- [ ] Multi-utilisateurs avec rôles granulaires
- [ ] Intégration calendrier (prise de RDV)
- [ ] Historique complet des actions
- [ ] Notifications push
- [ ] API REST publique

## 🆘 Support & Contact

- **Documentation** : Consultez [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues** : Ouvrez une issue sur GitHub
- **Supabase Docs** : https://supabase.com/docs
- **Netlify Docs** : https://docs.netlify.com

## 📝 Licence

Ce projet est développé pour Premunia. Tous droits réservés.

---

## ⚡ Quick Start (Résumé)

```bash
# 1. Installation
npm install

# 2. Créer tables Supabase (voir DEPLOYMENT.md)

# 3. Développement
npm run dev

# 4. Build
npm run build

# 5. Déployer sur Netlify
# - Push sur GitHub
# - Connecter à Netlify
# - Auto-deploy !

# 6. Créer admin
# - /signup
# - /promote-admin
# - Supprimer PromoteAdmin.tsx

# 7. Profiter ! 🎉
```

---

Développé avec ❤️ pour Premunia | © 2026 Tous droits réservés
