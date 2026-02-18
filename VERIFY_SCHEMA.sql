-- ========================================
-- Vérification rapide - Données seed
-- ========================================
-- Exécutez ce script dans Supabase SQL Editor pour vérifier l'état des données

-- 1. Vérifier les admins
SELECT 'ADMINS' as table_name, COUNT(*) as count FROM public.admins;

-- 2. Vérifier les leads
SELECT 'LEADS' as table_name, COUNT(*) as count FROM public.leads;

-- 3. Vérifier les templates
SELECT 'EMAIL_TEMPLATES' as table_name, COUNT(*) as count FROM public.email_templates;

-- 4. Vérifier les automations
SELECT 'AUTOMATIONS' as table_name, COUNT(*) as count FROM public.automations;

-- 5. Vérifier les tags
SELECT 'TAGS' as table_name, COUNT(*) as count FROM public.tags;

-- 6. Vérifier les interactions
SELECT 'LEAD_INTERACTIONS' as table_name, COUNT(*) as count FROM public.lead_interactions;

-- 7. Vérifier les automations steps
SELECT 'AUTOMATION_STEPS' as table_name, COUNT(*) as count FROM public.automation_steps;

-- 8. Vérifier la config SMTP
SELECT 'SMTP_CONFIG' as table_name, COUNT(*) as count FROM public.smtp_config;

-- 9. Vérifier les settings
SELECT 'SITE_SETTINGS' as table_name, COUNT(*) as count FROM public.site_settings;

-- ========================================
-- Afficher les détails des données
-- ========================================

-- Leads détaillés
SELECT '--- LEADS ---' as info;
SELECT id, first_name, last_name, email, status, score FROM public.leads LIMIT 5;

-- Automations détaillées
SELECT '--- AUTOMATIONS ---' as info;
SELECT id, name, trigger_type, active FROM public.automations;

-- Email templates détaillées
SELECT '--- EMAIL TEMPLATES ---' as info;
SELECT id, name, subject FROM public.email_templates;
