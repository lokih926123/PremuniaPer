-- =====================================================
-- PREMUNIA CRM - DATABASE SCHEMA
-- =====================================================
-- À exécuter dans Supabase SQL Editor
-- https://supabase.com/dashboard/project/axtczypotrjjzvgqdqlw/sql/new
-- =====================================================

-- =====================================================
-- 1. TABLES
-- =====================================================

-- Table des leads (prospects)
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

-- Table des administrateurs
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES (Pour améliorer les performances)
-- =====================================================

-- Index sur les leads pour recherche et tri
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_name ON leads(last_name, first_name);

-- Index sur admins pour vérification rapide
CREATE INDEX idx_admins_user_id ON admins(user_id);

-- =====================================================
-- 3. DONNÉES INITIALES
-- =====================================================

-- Insérer les paramètres par défaut du site
INSERT INTO site_settings (hero_title, hero_subtitle, contact_email, contact_phone, contact_address)
VALUES (
  'Optimisez votre retraite avec le PER Premunia',
  'Solution d''épargne retraite sur-mesure pour les professions libérales. Réduisez vos impôts tout en préparant votre avenir.',
  'contact@premunia.fr',
  '01 XX XX XX XX',
  '123 Avenue des Champs-Élysées, 75008 Paris'
);

-- =====================================================
-- 4. TRIGGERS (Mise à jour automatique de updated_at)
-- =====================================================

-- Fonction trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables avec updated_at
CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON leads
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at 
  BEFORE UPDATE ON site_settings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smtp_config_updated_at 
  BEFORE UPDATE ON smtp_config
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE smtp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. POLICIES - LEADS
-- =====================================================

-- Permet à tout le monde de lire les leads (pour statistiques publiques si besoin)
-- Note: Vous pouvez restreindre cela si nécessaire
CREATE POLICY "Allow public read on leads" 
  ON leads FOR SELECT 
  USING (true);

-- Permet à tout le monde de créer un lead (formulaire public)
CREATE POLICY "Allow public insert on leads" 
  ON leads FOR INSERT 
  WITH CHECK (true);

-- Seuls les admins peuvent modifier un lead
CREATE POLICY "Allow admin update on leads" 
  ON leads FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- Seuls les admins peuvent supprimer un lead
CREATE POLICY "Allow admin delete on leads" 
  ON leads FOR DELETE 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- =====================================================
-- 7. POLICIES - SITE SETTINGS
-- =====================================================

-- Tout le monde peut lire les paramètres du site (pour landing page)
CREATE POLICY "Allow public read on site_settings" 
  ON site_settings FOR SELECT 
  USING (true);

-- Seuls les admins peuvent modifier les paramètres
CREATE POLICY "Allow admin update on site_settings" 
  ON site_settings FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- =====================================================
-- 8. POLICIES - SMTP CONFIG
-- =====================================================

-- Seuls les admins peuvent faire toutes les opérations sur SMTP config
CREATE POLICY "Allow admin all on smtp_config" 
  ON smtp_config FOR ALL 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- =====================================================
-- 9. POLICIES - ADMINS
-- =====================================================

-- Seuls les admins existants peuvent voir la liste des admins
CREATE POLICY "Allow admin read on admins" 
  ON admins FOR SELECT 
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- Permet l'auto-promotion (première fois seulement)
-- ATTENTION : Désactivez cette policy après avoir créé votre premier admin !
CREATE POLICY "Allow self promote to admin" 
  ON admins FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Alternative plus sécurisée (décommentez et utilisez après premier admin):
-- CREATE POLICY "Allow admin insert on admins" 
--   ON admins FOR INSERT 
--   WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- =====================================================
-- 10. FONCTIONS UTILES (Optionnel)
-- =====================================================

-- Fonction pour obtenir les statistiques des leads
CREATE OR REPLACE FUNCTION get_lead_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_leads', COUNT(*),
    'new_leads', COUNT(*) FILTER (WHERE status = 'new'),
    'contacted_leads', COUNT(*) FILTER (WHERE status = 'contacted'),
    'converted_leads', COUNT(*) FILTER (WHERE status = 'converted'),
    'rejected_leads', COUNT(*) FILTER (WHERE status = 'rejected'),
    'conversion_rate', 
      CASE 
        WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status = 'converted')::NUMERIC / COUNT(*)) * 100, 1)
        ELSE 0
      END
  )
  INTO result
  FROM leads;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. VÉRIFICATION
-- =====================================================

-- Vérifier que toutes les tables sont créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'site_settings', 'smtp_config', 'admins');

-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'site_settings', 'smtp_config', 'admins');

-- Vérifier les policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- 12. NETTOYAGE (Si besoin de tout supprimer)
-- =====================================================

-- ATTENTION : Ceci supprime TOUTES les données !
-- Décommentez seulement si vous voulez tout réinitialiser

-- DROP TABLE IF EXISTS leads CASCADE;
-- DROP TABLE IF EXISTS site_settings CASCADE;
-- DROP TABLE IF EXISTS smtp_config CASCADE;
-- DROP TABLE IF EXISTS admins CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
-- DROP FUNCTION IF EXISTS get_lead_stats CASCADE;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- Notes importantes :
-- 1. Après avoir créé votre premier admin, désactivez la policy "Allow self promote to admin"
-- 2. Les indexes améliorent les performances pour les grandes tables
-- 3. RLS garantit la sécurité même si l'API frontend est compromise
-- 4. Les triggers updated_at se mettent à jour automatiquement
-- 5. Toutes les données sensibles (SMTP password) sont protégées par RLS

-- Pour plus d'informations :
-- - Documentation Supabase : https://supabase.com/docs
-- - Row Level Security : https://supabase.com/docs/guides/auth/row-level-security
-- - PostgreSQL Triggers : https://www.postgresql.org/docs/current/sql-createtrigger.html
