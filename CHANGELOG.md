# 📝 Changelog - Premunia CRM

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [2.0.0] - 2026-02-18

### 🎉 Version Production - Refactorisation Majeure

#### ✨ Nouveautés

- **Architecture complètement refactorisée**
  - Suppression du KV Store Figma Make
  - Connexion directe à Supabase PostgreSQL
  - Suppression des Edge Functions inutiles
  - API CRUD native via Supabase Client

- **Base de données PostgreSQL**
  - 4 tables : `leads`, `site_settings`, `smtp_config`, `admins`
  - Row Level Security (RLS) pour sécurité maximale
  - Indexes pour optimisation des performances
  - Triggers automatiques pour `updated_at`
  - Policies granulaires par rôle

- **Déploiement Netlify**
  - Configuration `netlify.toml`
  - Build automatique depuis GitHub
  - Redirections SPA configurées
  - SSL automatique

- **Documentation complète**
  - `README.md` : Vue d'ensemble
  - `QUICKSTART.md` : Démarrage rapide (15 min)
  - `DEPLOYMENT.md` : Guide complet de déploiement
  - `ARCHITECTURE.md` : Documentation technique
  - `database.sql` : Schéma SQL complet
  - `.gitignore` : Configuration Git
  - `.env.example` : Variables d'environnement

#### 🔧 Améliorations

**Frontend**
- ✅ Client Supabase unifié dans `/src/lib/supabase-client.ts`
- ✅ Toutes les pages refactorisées pour utiliser le nouveau client
- ✅ Types TypeScript pour toutes les entités
- ✅ React Query pour cache et optimisation
- ✅ Gestion d'erreur améliorée

**Sécurité**
- ✅ RLS activé sur toutes les tables
- ✅ Policies PostgreSQL pour autorisation granulaire
- ✅ JWT tokens via Supabase Auth
- ✅ Protection des routes côté frontend
- ✅ Validation côté serveur via RLS

**Performance**
- ✅ Indexes DB pour recherches rapides
- ✅ Cache React Query (5 min par défaut)
- ✅ Code splitting automatique
- ✅ Build optimisé Vite
- ✅ CDN Netlify global

#### 🗑️ Suppressions

- ❌ `/supabase/functions/server/index.tsx` (Edge Function inutile)
- ❌ `/src/lib/supabase.ts` (ancien client)
- ❌ Logique KV Store
- ❌ Routes API intermédiaires

#### 📊 Statistiques

- **Lignes de code** : ~3,500
- **Composants React** : 15
- **Tables DB** : 4
- **Routes** : 8
- **Temps de build** : ~30s
- **Bundle size** : ~500KB (gzipped)

---

## [1.0.0] - 2026-02-17

### 🎯 Version Initiale

#### ✨ Fonctionnalités

**Landing Page Publique** (`/`)
- Design moderne aux couleurs Premunia
- Formulaire de contact avec validation
- Simulation fiscale interactive avec Recharts
- Sections : Hero, Avantages, Cibles, Simulation, Contact
- 100% responsive

**Authentification**
- Inscription via Supabase Auth
- Connexion Email/Password
- Protection des routes admin
- Page de promotion admin

**Dashboard Admin** (`/admin`)
- Statistiques en temps réel
- Tableau des derniers leads
- Accès rapide aux fonctionnalités

**Gestion des Leads** (`/admin/leads`)
- Liste complète avec recherche
- Filtres par statut
- CRUD complet
- Modal d'édition

**Paramètres** (`/admin/settings`)
- Personnalisation des textes
- Aperçu en temps réel
- Sauvegarde instantanée

**Automatisation** (`/admin/automation`)
- Configuration SMTP
- Exemples pour principaux providers
- Stockage sécurisé

#### 🛠️ Stack Technique

- React 18.3.1 + TypeScript
- React Router 7
- TanStack React Query
- Tailwind CSS v4
- Recharts
- Supabase (Auth + Functions + KV Store)
- Hono (Edge Functions)

#### 🔧 Architecture v1

- Frontend React → Edge Functions Hono → KV Store
- Authentification Supabase
- CORS configuré
- JWT tokens

---

## 🔮 Roadmap Future

### Version 2.1 (À venir)

- [ ] Tests automatisés (Vitest + React Testing Library)
- [ ] CI/CD avec GitHub Actions
- [ ] Monitoring avec Sentry
- [ ] Analytics avec Plausible
- [ ] Domaine personnalisé
- [ ] Export CSV des leads
- [ ] Pagination avancée

### Version 2.2

- [ ] Templates d'emails personnalisables
- [ ] Envoi d'emails manuels depuis UI
- [ ] Webhooks pour intégrations externes
- [ ] API REST publique documentée
- [ ] Real-time avec Supabase subscriptions

### Version 3.0

- [ ] Multi-tenant (plusieurs entreprises)
- [ ] Rôles granulaires (admin, manager, agent)
- [ ] Workflows d'automatisation
- [ ] Calendrier intégré pour RDV
- [ ] Mobile app (React Native)
- [ ] GDPR compliance tools

---

## 📊 Comparaison des Versions

| Fonctionnalité | v1.0 | v2.0 |
|----------------|------|------|
| **Architecture** | Edge Functions + KV Store | Direct Supabase |
| **Tables DB** | KV Store (clé-valeur) | PostgreSQL (relationnel) |
| **Sécurité** | Backend validation | RLS + JWT |
| **Performance** | Bon | Excellent |
| **Scalabilité** | Limitée | Illimitée |
| **Maintenance** | Moyenne | Faible |
| **Requêtes complexes** | ❌ | ✅ |
| **Real-time** | ❌ | ✅ Prêt |
| **Indexes** | ❌ | ✅ |
| **Relations** | ❌ | ✅ |
| **Coût** | Moyen | Faible |

---

## 🏆 Contributions

### Auteurs

- **Architecture v1** : Initial implementation
- **Architecture v2** : Production refactor avec Supabase direct

### Remerciements

- Supabase pour la plateforme incroyable
- Netlify pour l'hébergement gratuit
- React team pour l'excellent framework
- TanStack pour React Query
- Tailwind CSS pour le styling rapide

---

## 📄 Licence

Ce projet est développé pour Premunia. Tous droits réservés © 2026.

---

**Note** : Ce changelog suit le format [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) et adhère au [Semantic Versioning](https://semver.org/lang/fr/).

**Légende** :
- ✨ Nouveauté
- 🔧 Amélioration
- 🐛 Correction de bug
- 🗑️ Suppression
- 🔒 Sécurité
- 📖 Documentation
