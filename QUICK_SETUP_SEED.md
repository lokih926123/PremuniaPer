# 🚀 Instructions Rapides - Remplir la Base de Données

## Étape 1: Vérifier l'état actuel (OPTIONNEL)

1. Allez sur https://app.supabase.com/project/axtczypotrjjzvgqdqlw/sql/new
2. Copiez le contenu de `VERIFY_SCHEMA.sql` (fichier dans la racine du projet)
3. Cliquez "Run" pour exécuter
4. Si les comptages sont tous à 0, allez à l'Étape 2

## Étape 2: Exécuter le Seed Data

### Option A: Migration Robuste (Recommandée - Pas de configuration requise) ⭐

1. Allez sur https://app.supabase.com/project/axtczypotrjjzvgqdqlw/sql/new
2. Ouvrez le fichier: `/supabase/migrations/003_seed_initial_data_robust.sql`
3. **Sélectionnez tout le contenu** (Ctrl+A)
4. **Copiez-le** (Ctrl+C)
5. **Allez dans le SQL Editor Supabase** (déjà ouvert dans votre navigateur)
6. **Collez-le** dans l'éditeur (Ctrl+V)
7. **Cliquez sur "Run"** (ou Shift+Enter)
8. Attendez le message de confirmation ✅

### Option B: Migration Originale (Si vous ne voulez pas utiliser l'admin fictif)

Si vous avez votre vraiment user_id Supabase:
1. Ouvrez `/supabase/migrations/002_seed_initial_data.sql`
2. Remplacez `'YOUR_USER_ID_HERE'` par votre UUID réel (ex: `'a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c'`)
3. Puis suivez les mêmes étapes que l'Option A

---

## Étape 3: Vérifier le Succès

1. Allez dans **Table Editor** (à gauche du dashboard Supabase)
2. Regardez les compteurs dans la liste des tables:
   - ✅ `automations`: 4 rows
   - ✅ `email_templates`: 5 rows
   - ✅ `leads`: 10 rows
   - ✅ `tags`: 7 rows
   - ✅ `site_settings`: 1 row
   - ✅ `smtp_config`: 1 row

Si tous les nombres sont corrects → **Parfait!** ✅

---

## Étape 4: Tester dans le Frontend

1. Allez sur **http://localhost:5175/admin/automation**
2. Vous devriez voir:
   - ✅ Liste de 4 workflows automatisés à gauche
   - ✅ Éditeur d'email à droite
   - ✅ Aperçu avec substitution des variables

---

## 🆘 Si ça ne marche pas

### "Syntax error" au au SQL Editor
→ Vérifiez que vous avez copié TOUT le fichier (jusqu'à la fin)

### "Permission denied" ou "Access denied"
→ Vous devez être le propriétaire du projet Supabase
→ Essayez depuis le compte qui a créé le projet

### Les données ne s'affichent pas dans le frontend
→ Allez dans la **Console du navigateur** (F12 → Console)
→ Regardez les erreurs (il y a une erreur réseau?)

### "Column does not exist"
→ La migration 001 (schéma) n'a pas été appliquée
→ Contactez-moi pour appliquer la migration 001 d'abord

---

## 💡 Points Importants

- ✅ Vous pouvez exécuter la migration 003 même si 002 a échoué
- ✅ L'admin fictif ne sera utilisé que pour les tests locaux
- ✅ Les données disparaîtront si vous réinitialisez la base (`supabase db reset`)
- ✅ Dans le vrai code, les interactions avec les data viennent via des appels API sécurisés

---

## 🎯 Résumé des Prochaines Étapes

1. ✅ Ouvrir SQL Editor Supabase
2. ✅ Copier/coller le contenu de `003_seed_initial_data_robust.sql`
3. ✅ Exécuter
4. ✅ Vérifier dans Table Editor
5. ✅ Rafraîchir le navigateur http://localhost:5175/admin/automation
6. ✅ Voir les 4 workflows affichés!

**10 minutes maximum pour avoir les données en place** ⏱️
