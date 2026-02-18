# 🚀 Guide de Déploiement - Premunia CRM

## 📋 Prérequis

1. **Compte Supabase** : https://supabase.com
2. **Compte Netlify** : https://netlify.com
3. **Git** installé localement

## 🗄️ Étape 1 : Configuration de la Base de Données Supabase

### 1.1 Créez votre projet Supabase
- Allez sur https://supabase.com/dashboard
- Votre projet ID : `axtczypotrjjzvgqdqlw`
- URL : `https://axtczypotrjjzvgqdqlw.supabase.co`

### 1.2 Créez les tables
1. Allez dans **SQL Editor** : https://supabase.com/dashboard/project/axtczypotrjjzvgqdqlw/sql/new
2. Copiez et exécutez le SQL suivant :

```sql
-- Table des leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  profession TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des paramètres du site
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_address TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table de configuration SMTP
CREATE TABLE smtp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL,
  port TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT 'Premunia',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des admins
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insérer les paramètres par défaut
INSERT INTO site_settings (hero_title, hero_subtitle, contact_email, contact_phone, contact_address)
VALUES (
  'Optimisez votre retraite avec le PER Premunia',
  'Solution d''épargne retraite sur-mesure pour les professions libérales. Réduisez vos impôts tout en préparant votre avenir.',
  'contact@premunia.fr',
  '01 XX XX XX XX',
  '123 Avenue des Champs-Élysées, 75008 Paris'
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smtp_config_updated_at BEFORE UPDATE ON smtp_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE smtp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Politique pour les leads (lecture publique, écriture publique pour création)
CREATE POLICY "Allow public read on leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert on leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update on leads" ON leads FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));
CREATE POLICY "Allow admin delete on leads" ON leads FOR DELETE 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- Politique pour site_settings (lecture publique, écriture admin)
CREATE POLICY "Allow public read on site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin update on site_settings" ON site_settings FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- Politique pour smtp_config (admin seulement)
CREATE POLICY "Allow admin all on smtp_config" ON smtp_config FOR ALL 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- Politique pour admins (admin seulement)
CREATE POLICY "Allow admin read on admins" ON admins FOR SELECT 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));
CREATE POLICY "Allow admin insert on admins" ON admins FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));
```

### 1.3 Activez l'authentification Email
1. Allez dans **Authentication** > **Providers**
2. Activez **Email** provider
3. Désactivez "Confirm email" pour les tests (ou configurez un serveur SMTP)

## 🌐 Étape 2 : Déploiement sur Netlify

### Option A : Déploiement depuis GitHub

1. **Poussez votre code sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Premunia CRM"
   git branch -M main
   git remote add origin https://github.com/VOTRE-USERNAME/premunia-crm.git
   git push -u origin main
   ```

2. **Connectez Netlify à GitHub**
   - Allez sur https://app.netlify.com
   - Cliquez sur **Add new site** > **Import an existing project**
   - Choisissez **GitHub**
   - Sélectionnez votre repository `premunia-crm`

3. **Configurez le build**
   - Build command : `npm run build`
   - Publish directory : `dist`
   - Cliquez sur **Deploy site**

### Option B : Déploiement Manuel (Drag & Drop)

1. **Buildez localement**
   ```bash
   npm install
   npm run build
   ```

2. **Déployez sur Netlify**
   - Allez sur https://app.netlify.com
   - Glissez-déposez le dossier `dist` sur Netlify

## 👤 Étape 3 : Créer votre compte Admin

1. Allez sur votre site Netlify : `https://votre-site.netlify.app`
2. Cliquez sur **S'inscrire** (`/signup`)
3. Créez votre compte avec email et mot de passe
4. Vous serez redirigé vers `/promote-admin`
5. Cliquez sur **Me promouvoir en Admin**
6. Vous êtes maintenant admin !

## 🔒 Étape 4 : Sécurité - IMPORTANT !

### **⚠️ SUPPRIMEZ LA PAGE DE PROMOTION APRÈS UTILISATION**

Une fois que vous êtes admin, supprimez immédiatement :

1. Le fichier : `/src/app/pages/PromoteAdmin.tsx`
2. La route dans `/src/app/routes.tsx` :
   ```tsx
   // SUPPRIMEZ CES LIGNES :
   {
     path: '/promote-admin',
     Component: PromoteAdmin,
   },
   ```

3. Redéployez l'application :
   ```bash
   git add .
   git commit -m "Remove promote-admin page for security"
   git push
   ```

   Ou rebuildez et redéployez manuellement sur Netlify.

## ✅ Étape 5 : Vérification

### Testez toutes les fonctionnalités :

1. **Landing Page** (`/`)
   - ✅ Formulaire de contact fonctionne
   - ✅ Simulation fiscale interactive
   - ✅ Textes personnalisables depuis admin

2. **Authentification**
   - ✅ Connexion (`/signin`)
   - ✅ Déconnexion
   - ✅ Protection des routes admin

3. **Dashboard Admin** (`/admin`)
   - ✅ Statistiques en temps réel
   - ✅ Derniers leads affichés

4. **Gestion des Leads** (`/admin/leads`)
   - ✅ Liste complète
   - ✅ Recherche et filtres
   - ✅ Modification statut et notes
   - ✅ Suppression

5. **Paramètres** (`/admin/settings`)
   - ✅ Modification des textes
   - ✅ Aperçu en temps réel
   - ✅ Sauvegarde immédiate

6. **Automatisation** (`/admin/automation`)
   - ✅ Configuration SMTP
   - ✅ Sauvegarde sécurisée

## 🛠️ Commandes Utiles

```bash
# Développement local
npm install
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

## 🔍 Debugging

### Si le site ne charge pas :
1. Vérifiez que Netlify a bien buildé (pas d'erreurs dans les logs)
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez que les tables Supabase sont bien créées

### Si l'authentification ne fonctionne pas :
1. Vérifiez que l'Email provider est activé dans Supabase
2. Vérifiez les RLS policies dans Supabase
3. Vérifiez que la table `admins` existe

### Si les leads ne s'affichent pas :
1. Vérifiez la table `leads` dans Supabase
2. Vérifiez les RLS policies
3. Testez la création d'un lead depuis la landing page

## 📊 Accès aux Données

### Dashboard Supabase
- Tables : https://supabase.com/dashboard/project/axtczypotrjjzvgqdqlw/editor
- Auth : https://supabase.com/dashboard/project/axtczypotrjjzvgqdqlw/auth/users
- SQL Editor : https://supabase.com/dashboard/project/axtczypotrjjzvgqdqlw/sql

## 🎉 Félicitations !

Votre plateforme Premunia CRM est maintenant en production !

**URL de production** : https://votre-site.netlify.app
**Panel Admin** : https://votre-site.netlify.app/admin

---

## 📝 Notes Importantes

1. **Sécurité** : N'oubliez pas de supprimer `/promote-admin` après avoir créé votre compte
2. **SMTP** : Configurez votre serveur SMTP pour recevoir les notifications par email
3. **Backup** : Supabase fait des backups automatiques, mais exportez régulièrement vos données
4. **Domaine personnalisé** : Configurez un domaine custom dans les paramètres Netlify
5. **SSL** : Netlify fournit automatiquement un certificat SSL gratuit

## 🆘 Support

- Documentation Supabase : https://supabase.com/docs
- Documentation Netlify : https://docs.netlify.com
- GitHub Issues : Créez une issue sur votre repository
