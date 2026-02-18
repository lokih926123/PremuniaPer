# 🔧 Commandes Rapides de Migration

## 🚀 Démarrer la migration

### Windows (PowerShell)
```powershell
# Exécuter le script de migration interactif
.\migrate.ps1

# Ou directement avec Supabase CLI
supabase db push
```

### Mac/Linux (Bash)
```bash
# Exécuter le script de migration interactif
chmod +x migrate.sh
./migrate.sh

# Ou directement avec Supabase CLI
supabase db push
```

---

## 📋 Solution 1: SQL Editor (Plus simple)

```bash
# 1. Se connecter à Supabase Dashboard
# https://app.supabase.com/

# 2. Sélectionner le projet → SQL Editor → New Query

# 3. Copier le fichier de migration
cat supabase/migrations/001_reset_and_create_crm_schema.sql

# 4. Coller dans SQL Editor et exécuter
```

---

## ⚙️ Solution 2: CLI Supabase (Professionnel)

### Installation
```bash
npm install -g supabase
supabase login
```

### Migration
```bash
# Vérifier l'état
supabase status

# Pousser les migrations
supabase db push

# Voir l'historique
supabase migration list
```

---

## ✅ Vérifications Post-Migration

### Via Terminal
```bash
# Voir les tables créées
supabase db list

# Voir taille des tables
supabase db remote list_sizes

# Voir les migrations appliquées
supabase migration list
```

### Via SQL Editor (Supabase Dashboard)
```sql
-- Compter les tables
SELECT count(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Lister les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les index
SELECT * FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Vérifier les triggers
SELECT * FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

---

## 🚨 Troubleshooting

### Erreur: "Permission denied"
```bash
# Solution: Utiliser le compte owner du projet
supabase link --project-ref YOUR_PROJECT_ID
```

### Erreur: "Table doesn't exist"
```bash
# Solution: Vérifier qu'aucune migration n'est partielle
supabase migration list
# Si une migration est en erreur, corriger et re-pousser
```

### Erreur: "Foreign key constraint fails"
```sql
-- Désactiver les triggers temporairement
ALTER TABLE lead_interactions DISABLE TRIGGER ALL;
-- Puis réactiver
ALTER TABLE lead_interactions ENABLE TRIGGER ALL;
```

### Erreur: "Connection refused"
```bash
# Solution: Vous connecter d'abord
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

---

## 🔄 Rollback d'Urgence

### Via Supabase Backups
1. Supabase Dashboard → Database → Backups
2. Cliquer sur "Restore" pour un backup antérieur
3. Confirmer (attendez 10 min)

### Via Terminal
```bash
# Récupérer l'état du serveur
supabase db pull

# Cela va créer une nouvelle migration avec l'état actuel
```

---

## 📊 Commandes Utiles

### Voir la structure de la base
```sql
-- Voir tous les types de colonnes
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### Voir les RLS policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public';
```

### Voir les fonctions
```sql
SELECT 
  routine_schema,
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public';
```

### Voir les triggers
```sql
SELECT 
  trigger_schema,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

## 🧹 Nettoyage Optionnel

### Supprimer les anciennes migrations (si rollback effectué)
```bash
# Lister
supabase migration list

# Supprimer les fichiers avec numéros décimaux/inutiles
rm supabase/migrations/002_*.sql
```

### Réinitialiser complètement (DANGEREUX!)
```bash
# Ne faire que si vraiment nécessaire
supabase db reset

# Puis repousser
supabase db push
```

---

## 📞 Besoin d'aide?

- **Guide complet**: Dérivé du fichier `MIGRATION_GUIDE.md`
- **File de migration SQL**: `supabase/migrations/001_reset_and_create_crm_schema.sql`
- **Script PowerShell**: `migrate.ps1`
- **Script Bash**: `migrate.sh`
- **Docs Supabase**: https://supabase.com/docs
- **Docs CLI**: https://supabase.com/docs/reference/cli

---

## ✨ Après la migration

### Créer le premier admin
```sql
-- À exécuter en SQL Editor
-- Remplacez USER_UID par l'ID d'un utilisateur auth existant
INSERT INTO public.admins (user_id, role) 
VALUES ('YOUR_USER_UID', 'super_admin')
ON CONFLICT DO NOTHING;
```

### Ajouter quelques leads de test
```sql
INSERT INTO public.leads (first_name, last_name, email, profession, company) 
VALUES 
  ('Jean', 'Dupont', 'jean@example.com', 'Consultant', 'EY'),
  ('Marie', 'Martin', 'marie@example.com', 'Manager', 'Accenture'),
  ('Pierre', 'Bernard', 'pierre@example.com', 'Directeur', 'Deloitte');
```

### Créer une automation de test
```sql
INSERT INTO public.automations (name, trigger_type, created_by) 
VALUES (
  'Bienvenue Lead',
  'new_lead',
  (SELECT id FROM public.admins LIMIT 1)
);
```

---

Bonne migration! 🎉
