# 🏗️ Architecture Technique - Premunia CRM

## Vue d'ensemble

Premunia CRM est une application web moderne basée sur une architecture **JAMstack** (JavaScript, APIs, Markup) avec connexion directe à Supabase pour la base de données et l'authentification.

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │  Landing   │  │   Auth     │  │   Admin Dashboard  │   │
│  │   Page     │  │  Sign In   │  │   - Dashboard      │   │
│  │            │  │  Sign Up   │  │   - Leads          │   │
│  │            │  │  Promote   │  │   - Settings       │   │
│  │            │  │            │  │   - Automation     │   │
│  └─────┬──────┘  └──────┬─────┘  └─────────┬──────────┘   │
│        │                │                   │               │
│        └────────────────┴───────────────────┘               │
│                         │                                   │
│                   React Router v7                           │
│                   TanStack Query                            │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                    Supabase Client
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    SUPABASE BACKEND                         │
│  ┌────────────────┐    │    ┌──────────────────────────┐   │
│  │  PostgreSQL    │◄───┴───►│   Supabase Auth          │   │
│  │                │          │   - JWT Tokens           │   │
│  │  Tables:       │          │   - Email/Password       │   │
│  │  - leads       │          │   - Sessions             │   │
│  │  - settings    │          │                          │   │
│  │  - smtp_config │          │                          │   │
│  │  - admins      │          │                          │   │
│  │                │          │                          │   │
│  │  Row Level     │          │                          │   │
│  │  Security (RLS)│          │                          │   │
│  └────────────────┘          └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                    HTTPS / SSL
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    NETLIFY CDN                              │
│  - Global CDN                                               │
│  - SSL Automatique                                          │
│  - Continuous Deployment                                    │
│  - Redirections SPA                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Choix d'Architecture

### 1. Frontend SPA (Single Page Application)

**Choix** : React 18.3.1 avec TypeScript
**Raisons** :
- Performance optimale avec Virtual DOM
- Écosystème riche et mature
- Type safety avec TypeScript
- React Query pour la gestion du cache
- React Router pour le routing client-side

### 2. Connexion Directe à Supabase

**Architecture** : Client → Supabase (sans serveur intermédiaire)
**Avantages** :
- ✅ Simplicité : Pas de serveur backend à maintenir
- ✅ Performance : Connexion directe = moins de latence
- ✅ Sécurité : Row Level Security (RLS) au niveau base de données
- ✅ Scalabilité : Supabase gère automatiquement la montée en charge
- ✅ Coût : Pas de serveur backend à héberger
- ✅ Real-time : Prêt pour subscriptions temps réel (future)

**VS** Architecture précédente (KV Store + Edge Functions) :
- ❌ KV Store : Limitatif pour requêtes complexes
- ❌ Edge Functions : Couche supplémentaire inutile
- ❌ Maintenance : Plus de code à maintenir
- ✅ Direct DB : Requêtes SQL optimisées, relations, indexes

### 3. Row Level Security (RLS)

**Sécurité au niveau base de données** :
```sql
-- Exemple : Les admins seuls peuvent modifier les leads
CREATE POLICY "Allow admin update on leads" ON leads FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));
```

**Avantages** :
- Sécurité côté serveur (impossible de contourner)
- Validation automatique de toutes les requêtes
- Pas de code backend nécessaire
- Audit trail via Supabase

## 📁 Structure du Projet

```
premunia-crm/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx
│   │   │   └── ui/                     # Shadcn UI components
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.tsx     # Layout avec sidebar
│   │   │   │   ├── Dashboard.tsx       # Stats + recent leads
│   │   │   │   ├── Leads.tsx           # CRUD leads complet
│   │   │   │   ├── Settings.tsx        # Personnalisation site
│   │   │   │   └── Automation.tsx      # Config SMTP
│   │   │   ├── LandingPage.tsx         # Page publique
│   │   │   ├── SignIn.tsx              # Connexion
│   │   │   ├── SignUp.tsx              # Inscription
│   │   │   └── PromoteAdmin.tsx        # ⚠️ À supprimer après setup
│   │   ├── App.tsx                     # Root component
│   │   └── routes.tsx                  # React Router config
│   ├── lib/
│   │   └── supabase-client.ts          # ⭐ Client Supabase + API functions
│   └── styles/
│       ├── index.css
│       ├── tailwind.css
│       └── theme.css
├── utils/
│   └── supabase/
│       └── info.tsx                    # Credentials Supabase (auto-generated)
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx               # ⚠️ Non utilisé (legacy)
│           └── kv_store.tsx            # ⚠️ Non utilisé (legacy)
├── public/                             # Assets statiques
├── netlify.toml                        # Configuration Netlify
├── vite.config.ts                      # Configuration Vite
├── package.json
├── README.md                           # Documentation principale
├── DEPLOYMENT.md                       # Guide de déploiement
└── ARCHITECTURE.md                     # Ce fichier
```

## 🔄 Flux de Données

### 1. Création d'un Lead (Public)

```
User fills form on Landing Page
         ↓
React component calls createLead()
         ↓
supabase-client.ts → supabase.from('leads').insert()
         ↓
Supabase validates RLS policy (public insert allowed)
         ↓
Lead inserted in PostgreSQL
         ↓
React Query invalidates cache
         ↓
UI updated automatically
```

### 2. Authentification Admin

```
User enters email/password
         ↓
SignIn component calls signIn()
         ↓
supabase-client.ts → supabase.auth.signInWithPassword()
         ↓
Supabase validates credentials
         ↓
JWT token returned + session created
         ↓
Token stored in browser (localStorage)
         ↓
AdminLayout checks isAdmin()
         ↓
Query admins table via RLS
         ↓
If admin → Access granted
If not → Redirect to /promote-admin
```

### 3. Modification d'un Lead (Admin)

```
Admin clicks Edit on lead
         ↓
Modal opens with lead data
         ↓
Admin modifies status/notes
         ↓
Component calls updateLead(id, data)
         ↓
supabase-client.ts → supabase.from('leads').update()
         ↓
Supabase validates RLS policy:
  - User is authenticated?
  - User is in admins table?
         ↓
If yes → Update executed
If no → Error 403
         ↓
React Query invalidates ['leads'] and ['stats']
         ↓
UI re-renders with updated data
```

## 🔐 Sécurité en Profondeur

### Niveau 1 : Frontend (React)
- Protected routes avec React Router
- Auth check au chargement de AdminLayout
- Redirect si non-authentifié

### Niveau 2 : Supabase Auth
- JWT tokens (auto-refresh)
- Session management
- Email/Password validation

### Niveau 3 : Row Level Security (RLS)
```sql
-- Validation côté base de données
-- Impossible de contourner même avec API directe

-- Exemple : Admins seulement
CREATE POLICY "admin_only" ON smtp_config
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));
```

### Niveau 4 : Network
- HTTPS/SSL automatique via Netlify
- CORS configuré
- Credentials never exposed in code

## 📊 Gestion d'État

### React Query (TanStack Query)

**Pourquoi** : 
- Cache automatique
- Invalidation intelligente
- Loading states
- Error handling
- Retry logic
- Optimistic updates

**Exemples** :

```typescript
// Fetch leads with cache
const { data: leads } = useQuery({
  queryKey: ['leads'],
  queryFn: getLeads,  // Direct Supabase call
});

// Mutation with cache invalidation
const updateLeadMutation = useMutation({
  mutationFn: ({ id, data }) => updateLead(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  },
});
```

## 🚀 Performance

### 1. Code Splitting
- React Router charge les routes à la demande
- Vite optimise automatiquement le bundle

### 2. Caching Strategy
```typescript
// 5 minutes de cache par défaut
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 3. Database Indexes (à créer)
```sql
-- Améliorer performance recherche/filtres
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);
```

### 4. CDN (Netlify)
- Assets servis depuis edge locations
- Compression automatique
- Cache headers optimisés

## 🧪 Tests (À implémenter)

### Tests Recommandés

```typescript
// Tests unitaires (Vitest)
- Composants React (React Testing Library)
- Fonctions utilitaires
- Validation de formulaires

// Tests d'intégration
- Flux d'authentification
- CRUD operations
- Navigation entre pages

// Tests E2E (Playwright)
- Parcours utilisateur complet
- Formulaire de contact
- Admin dashboard
```

## 📈 Monitoring & Analytics (À ajouter)

### Recommandations

1. **Sentry** : Error tracking
2. **Google Analytics** ou **Plausible** : User analytics
3. **Supabase Dashboard** : Database monitoring
4. **Netlify Analytics** : Traffic & performance

## 🔄 CI/CD

### Workflow Actuel (Netlify)

```
GitHub Push
    ↓
Netlify détecte le push
    ↓
Build automatique : npm run build
    ↓
Tests (si configurés)
    ↓
Déploiement sur CDN
    ↓
Certificat SSL automatique
    ↓
Site live !
```

### Preview Deployments
- Chaque Pull Request → URL de preview unique
- Tests avant merge
- Review facile

## 🔮 Évolutions Futures

### Phase 1 : Optimisations
- [ ] Ajouter des indexes DB
- [ ] Implémenter tests
- [ ] Monitoring/Sentry
- [ ] Lighthouse score 100/100

### Phase 2 : Fonctionnalités
- [ ] Real-time avec Supabase subscriptions
- [ ] Notifications push
- [ ] Export PDF/CSV
- [ ] API publique REST

### Phase 3 : Scale
- [ ] Multi-tenant (plusieurs entreprises)
- [ ] Rôles granulaires (admin, manager, agent)
- [ ] Audit logs complets
- [ ] GDPR compliance tools

## 💡 Bonnes Pratiques Appliquées

- ✅ **TypeScript** partout (type safety)
- ✅ **ESLint** + **Prettier** (code quality)
- ✅ **Composants réutilisables** (DRY)
- ✅ **Separation of concerns** (lib/supabase-client.ts)
- ✅ **Error handling** systématique
- ✅ **Loading states** pour UX
- ✅ **Responsive design** mobile-first
- ✅ **Accessibility** (aria-labels, semantic HTML)
- ✅ **Security first** (RLS, JWT, HTTPS)

## 📚 Ressources

- **React** : https://react.dev
- **React Router** : https://reactrouter.com
- **TanStack Query** : https://tanstack.com/query
- **Supabase** : https://supabase.com/docs
- **Tailwind** : https://tailwindcss.com/docs
- **Vite** : https://vitejs.dev
- **Netlify** : https://docs.netlify.com

---

**Auteur** : Architecture refactorisée pour production  
**Date** : Février 2026  
**Version** : 2.0 (Direct Supabase)
