# 🚀 Guide de Migration Supabase - Reset & Nouvelle Schéma CRM

## 📋 Prérequis
- Compte Supabase actif
- Backup de vos données actuelles (IMPORTANT!)
- Accès admin à votre projet Supabase

---

## ✅ Option 1: Via Interface Web Supabase (Recommandée pour les débutants)

### Étape 1: Backup de vos données actuelles
1. Allez sur **Supabase Dashboard** → votre projet
2. Menu **Database** → **Backups**
3. Cliquez sur **Request backup** pour créer une sauvegarde manuelle
4. Attendez que le backup soit complété

### Étape 2: Réinitialiser la base via SQL Editor
1. Allez dans **SQL Editor** (Supabase Dashboard)
2. Créez une **Nouvelle Query**
3. Copiez le contenu de `/supabase/migrations/001_reset_and_create_crm_schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** (icône ▶)
6. Attendez la confirmation de succès

### Étape 3: Vérifier la migration
1. Allez dans **Table Editor**
2. Vérifiez que vous voyez les nouvelles tables:
   - `admins`
   - `leads`
   - `automations`
   - `email_templates`
   - etc.

---

## ✅ Option 2: Via Supabase CLI (Recommandée pour les professionnels)

### Étape 1: Installer/mettre à jour la CLI
```bash
npm install -g supabase
# ou si déjà installé
supabase upgrade
```

### Étape 2: Se connecter à votre projet
```bash
supabase login
# Suivez les instructions pour générer un token d'accès
```

### Étape 3: Lier votre projet local
```bash
cd c:\Users\DM PREMUNIA\PremuniaPer-1

# Initialisez si vous n'avez pas de supabase.json
supabase init

# Ou liez un projet existant
supabase link --project-ref YOUR_PROJECT_REF
# Remplacez YOUR_PROJECT_REF par votre ID de projet Supabase
```

### Étape 4: Appliquer la migration
```bash
supabase db push
```

---

## ✅ Option 3: Étape par Étape (Plus sûr)

### Étape 1: Backup manual
```sql
-- Dans SQL Editor, exécutez:
COPY (SELECT * FROM public.leads) TO STDOUT WITH CSV;
-- Sauvegardez les résultats dans un fichier
```

### Étape 2: Suppression contrôlée
```sql
-- Exécutez d'abord en SQL Editor:
DROP TABLE IF EXISTS public.smtp_config CASCADE;
DROP TABLE IF EXISTS public.kv_store CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
-- ... etc (voir la première partie du fichier migration)
```

### Étape 3: Création du nouveau schéma
- Exécutez la seconde partie du fichier migration (création des tables)

---

## ⚠️ CHECKLIST AVANT LA MIGRATION

- [ ] Backup externe créé et testé
- [ ] URL de backup Supabase vérifiée
- [ ] Vous avez sauvegardé les données importantes
- [ ] Vous êtes connecté en tant qu'admin
- [ ] Pas d'utilisateurs actifs sur l'app pendant la migration
- [ ] Avez 15-30 minutes pour la migration

---

## 🚨 EN CAS DE PROBLÈME

### Si SQL error: Table doesn't exist
**Cause**: Les tables sont supprimées mais il y a encore des triggers ou références
**Solution**: Exécutez juste la partie "PHASE 2: CRÉATION" du fichier migration

### Si Foreign key constraint fails
**Cause**: Dépendances de clés étrangères mal gérées
**Solution**: 
```sql
-- Désactivez les contraintes temporairement
ALTER TABLE public.lead_interactions DISABLE TRIGGER ALL;
-- Puis réactivez après
ALTER TABLE public.lead_interactions ENABLE TRIGGER ALL;
```

### Si Permission denied
**Cause**: L'utilisateur n'a pas les droits suffisants
**Solution**: 
1. Utilisez le compte owner du projet Supabase
2. Allez dans **Project Settings** → **Database** → vérifiez les permissions

---

## ✨ Après la migration réussie

### 1. Vérifier les tables
```bash
# Dans Terminal
supabase db list
```

### 2. Créer un admin test
```sql
-- Exécutez en SQL Editor (remplacez UID par un utilisateur auth existant)
INSERT INTO public.admins (user_id, role) 
VALUES ('YOUR_USER_UID', 'super_admin');
```

### 3. Tester une insertion leads
```sql
INSERT INTO public.leads (first_name, last_name, email, profession)
VALUES ('Jean', 'Dupont', 'jean@example.com', 'Consultant');
```

### 4. Vérifier les index
```sql
SELECT * FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

---

## 📊 Commandes utiles après migration

### Voir la taille des tables
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Compter les lignes
```sql
SELECT 
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

### Vérifier les RLS policies
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## 🔄 Rollback en cas d'urgence

Si quelque chose tourne mal:

### Via Supabase Backups
1. **Supabase Dashboard** → **Database** → **Backups**
2. Trouvez le backup précédent
3. Cliquez sur **Restore**
4. Confirmez l'opération (attendez 5-10 min)

### Via CLI
```bash
supabase db pull
# Cela récupère le schéma du serveur (cautionné par le backup)
```

---

## 📞 Support

- **Supabase Status**: https://status.supabase.com
- **Supabase Docs**: https://supabase.com/docs
- **CLI Docs**: https://supabase.com/docs/reference/cli
