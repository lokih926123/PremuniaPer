-- ========================================
-- SEED DATA - Version Alternative Robuste
-- ========================================
-- Cette version crée un admin fictif pour éviter les erreurs de contrainte
-- À utiliser si vous n'avez pas encore remplacé YOUR_USER_ID_HERE

-- ⚠️ NE LANCEZ CETTE MIGRATION QUE SI:
-- - Vous n'avez pas pu exécuter la migration 002 précédente
-- - Ou vous voulez un admin fictif pour tester rapidement

-- ========================================
-- 1. CRÉER UN ADMIN FICTIF
-- ========================================
-- Créer d'abord un user fictif dans auth.users (optionnel mais utile)
-- Ou utiliser un UUID existant que vous avez

DO $$
DECLARE
  admin_user_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  admin_id uuid;
BEGIN
  -- Insérer un admin avec ce UUID fictif
  INSERT INTO public.admins (user_id, role)
  VALUES (admin_user_id, 'super_admin')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO admin_id;
  
  -- Si l'insert n'a pas réussi (conflit), récupérer l'ID existant
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM public.admins WHERE user_id = admin_user_id;
  END IF;
  
  -- Stocker l'admin_id dans une variable pour l'utiliser dans les INSERT suivants
  -- (Malheureusement PostgreSQL n'autorise pas directement, on va utiliser des sous-requêtes)
END $$;

-- ========================================
-- 2. LEADS - Données de test
-- ========================================
INSERT INTO public.leads (first_name, last_name, email, phone, profession, company, country, status, score)
VALUES 
  ('Jean', 'Dupont', 'jean.dupont@test.com', '+33612345678', 'Consultant Financier', 'EY France', 'FR', 'new', 50),
  ('Marie', 'Martin', 'marie.martin@test.com', '+33623456789', 'Directrice RH', 'Accenture', 'FR', 'contacted', 75),
  ('Pierre', 'Bernard', 'pierre.bernard@test.com', '+33634567890', 'Entrepreneur', 'Startup Tech', 'FR', 'qualified', 85),
  ('Sophie', 'Leclerc', 'sophie.leclerc@test.com', '+33645678901', 'Manager IT', 'Deloitte', 'FR', 'negotiating', 90),
  ('Luc', 'Moreau', 'luc.moreau@test.com', '+33656789012', 'Avocat', 'Cabinet Juridique', 'FR', 'new', 40),
  ('Anne', 'Girard', 'anne.girard@test.com', '+33667890123', 'Médecin', 'Hopital Saint-Paul', 'FR', 'converted', 100),
  ('Marc', 'Dubois', 'marc.dubois@test.com', '+33678901234', 'Directeur Commercial', 'LVMH', 'FR', 'new', 60),
  ('Christine', 'Robert', 'christine.robert@test.com', '+33689012345', 'Directrice Générale', 'PME Services', 'FR', 'contacted', 80),
  ('Philippe', 'Laurent', 'philippe.laurent@test.com', '+33690123456', 'Ingénieur Senior', 'Thales', 'FR', 'qualified', 88),
  ('Isabelle', 'Petit', 'isabelle.petit@test.com', '+33601234567', 'Coach Professional', 'Coaching Plus', 'FR', 'new', 55)
ON CONFLICT DO NOTHING;

-- ========================================
-- 3. TAGS - Catégorisation des leads
-- ========================================
INSERT INTO public.tags (name, color, description)
VALUES 
  ('Haute Valeur', '#10b981', 'Lead avec fort potentiel conversion'),
  ('Premium', '#8b5cf6', 'Client premium ou haut revenu'),
  ('Formation Complète', '#f59e0b', 'Besoins de formation avant conversion'),
  ('Suivi Rapide', '#ef4444', 'À relancer rapidement'),
  ('Partenaire Potentiel', '#3b82f6', 'Opportunité de partenariat'),
  ('Lead Froid', '#6b7280', 'Contact limité ou intérêt faible'),
  ('SOS Retraite', '#ec4899', 'Situation urgente recommandation')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 4. LEAD TAGS - Association tags/leads
-- ========================================
INSERT INTO public.lead_tags (lead_id, tag_id)
SELECT 
  COALESCE((SELECT id FROM public.leads WHERE email = 'marie.martin@test.com'), NULL::uuid),
  COALESCE((SELECT id FROM public.tags WHERE name = 'Haute Valeur'), NULL::uuid)
WHERE (SELECT COUNT(*) FROM public.leads WHERE email = 'marie.martin@test.com') > 0
  AND (SELECT COUNT(*) FROM public.tags WHERE name = 'Haute Valeur') > 0
UNION ALL
SELECT 
  COALESCE((SELECT id FROM public.leads WHERE email = 'marie.martin@test.com'), NULL::uuid),
  COALESCE((SELECT id FROM public.tags WHERE name = 'Premium'), NULL::uuid)
WHERE (SELECT COUNT(*) FROM public.leads WHERE email = 'marie.martin@test.com') > 0
  AND (SELECT COUNT(*) FROM public.tags WHERE name = 'Premium') > 0
UNION ALL
SELECT 
  COALESCE((SELECT id FROM public.leads WHERE email = 'pierre.bernard@test.com'), NULL::uuid),
  COALESCE((SELECT id FROM public.tags WHERE name = 'Haute Valeur'), NULL::uuid)
WHERE (SELECT COUNT(*) FROM public.leads WHERE email = 'pierre.bernard@test.com') > 0
  AND (SELECT COUNT(*) FROM public.tags WHERE name = 'Haute Valeur') > 0
UNION ALL
SELECT 
  COALESCE((SELECT id FROM public.leads WHERE email = 'pierre.bernard@test.com'), NULL::uuid),
  COALESCE((SELECT id FROM public.tags WHERE name = 'Partenaire Potentiel'), NULL::uuid)
WHERE (SELECT COUNT(*) FROM public.leads WHERE email = 'pierre.bernard@test.com') > 0
  AND (SELECT COUNT(*) FROM public.tags WHERE name = 'Partenaire Potentiel') > 0
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. EMAIL TEMPLATES - Modèles d'email
-- ========================================
INSERT INTO public.email_templates (name, subject, body, created_by)
SELECT 
  'Bienvenue Lead',
  'Bienvenue chez Premunia - Optimisez votre retraite',
  'Bonjour {{first_name}},

Merci de votre intérêt pour Premunia! 🎉

Nous sommes spécialisés dans l''optimisation de stratégies de retraite pour les professionnels comme vous.

En tant que {{profession}}, vous avez accès à des avantages fiscaux spécifiques que nous pourrions explorer ensemble.

Nos experts vous proposeront:
✓ Analyse personnalisée de votre situation
✓ Strategies d''optimisation sur mesure
✓ Solutions adaptées à votre secteur ({{profession}})

Voulez-vous programmer un appel de découverte? C''est gratuit et sans engagement.

Cordialement,
L''équipe Premunia',
  (SELECT id FROM public.admins LIMIT 1)
WHERE (SELECT COUNT(*) FROM public.admins) > 0
UNION ALL
SELECT
  'Suivi 3 jours',
  'Ne laissez pas votre retraite au hasard',
  'Bonjour {{first_name}},

Nous n''avons pas eu de ses nouvelles depuis quelques jours 😊

Planning your retirement is crucial. Premunia specializes in helping professionals like you optimize their retirement strategy.

A few quick facts:
• 85% of professionals miss significant tax optimization opportunities
• The average saving is €50,000+ over retirement period
• Many strategies can be implemented quickly

Would you like to schedule a 30-minute discovery call?

Best regards,
Premunia Team',
  (SELECT id FROM public.admins LIMIT 1)
WHERE (SELECT COUNT(*) FROM public.admins) > 0
UNION ALL
SELECT
  'Offre Spéciale Premium',
  'Opportunité exclusive: Audit gratuit de retraite',
  'Chère {{first_name}},

En tant que {{profession}} chez {{company}}, vous êtes éligible à notre programme d''audit premium gratuit.

Cet audit inclut:
✓ Analyse complète de votre situation actuelle
✓ Projection de retraite détaillée
✓ Plan d''action personnalisé
✓ Consultation stratégique (valeur: 2 000€)

Offre valide jusqu''au {{today}}.

Réservez votre audit →

Warm regards,
Premunia',
  (SELECT id FROM public.admins LIMIT 1)
WHERE (SELECT COUNT(*) FROM public.admins) > 0
UNION ALL
SELECT
  'Relance Conversion',
  'Dernier appel - Transformation garanti',
  'Bonjour {{first_name}},

C''est notre dernier message avant de fermer votre dossier.

Vous avez montré de l''intérêt pour optimiser votre retraite - nous croyons sincèrement que nous pouvons vous aider à économiser significativement.

Dernier créneaux disponibles cette semaine:
• Mardi 15h-16h
• Mercredi 14h-15h
• Jeudi 10h-11h

Confirmez votre préférence directement.

L''équipe Premunia',
  (SELECT id FROM public.admins LIMIT 1)
WHERE (SELECT COUNT(*) FROM public.admins) > 0
UNION ALL
SELECT
  'Merci - Post Conversion',
  'Bienvenue dans la communauté Premunia!',
  'Chère {{first_name}},

Merci d''avoir choisi Premunia! 🎊

Vous faites maintenant partie d''une communauté de {{count}} professionnels qui optimisent leur future retraite.

Vos bénéfices immédiats:
✓ Tableau de bord personnel 24/7
✓ Acces à nos webinaires exclusifs
✓ Support dédié
✓ Mises à jour stratégiques

Prochaines étapes:
1. Confirmer vos coordonnées dans votre dashboard
2. Assister à notre briefing introductif jeudi 18h

Questions? Nous sommes là pour vous.

À bientôt,
Premunia',
  (SELECT id FROM public.admins LIMIT 1)
WHERE (SELECT COUNT(*) FROM public.admins) > 0
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 6. AUTOMATIONS - Workflows automatisés
-- ========================================
INSERT INTO public.automations (name, description, trigger_type, trigger_config, active, created_by)
SELECT
  'Bienvenue Automatique',
  'Email de bienvenue envoyé automatiquement aux nouveaux leads',
  'new_lead',
  '{"delay_minutes": 5}'::jsonb,
  true,
  (SELECT id FROM public.admins LIMIT 1)
WHERE (SELECT COUNT(*) FROM public.admins) > 0
UNION ALL
SELECT
  'Suivi 3 Jours',
  'Relance les leads après 3 jours sans contact',
  'no_contact_days',
  '{"days": 3}'::jsonb,
  true,
  (SELECT id FROM public.admins LIMIT 1)
WHERE (SELECT COUNT(*) FROM public.admins) > 0
UNION ALL
SELECT
  'Qualification Premium',
  'Envoi d''offre spéciale aux leads qualifiés',
  'status_change',
  '{"old_status": "new", "new_status": "qualified"}'::jsonb,
  true,
  (SELECT id FROM public.admins LIMIT 1)
WHERE (SELECT COUNT(*) FROM public.admins) > 0
UNION ALL
SELECT
  'Celebration Conversion',
  'Message de bienvenue post-conversion',
  'status_change',
  '{"old_status": "negotiating", "new_status": "converted"}'::jsonb,
  true,
  (SELECT id FROM public.admins LIMIT 1)
WHERE (SELECT COUNT(*) FROM public.admins) > 0
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. AUTOMATION STEPS - Étapes des workflows
-- ========================================
INSERT INTO public.automation_steps (automation_id, step_order, action_type, action_config)
SELECT
  (SELECT id FROM public.automations WHERE name = 'Bienvenue Automatique' LIMIT 1),
  1,
  'send_email',
  '{"template_name": "Bienvenue Lead"}'::jsonb
WHERE (SELECT COUNT(*) FROM public.automations WHERE name = 'Bienvenue Automatique') > 0
UNION ALL
SELECT
  (SELECT id FROM public.automations WHERE name = 'Suivi 3 Jours' LIMIT 1),
  1,
  'send_email',
  '{"template_name": "Suivi 3 jours"}'::jsonb
WHERE (SELECT COUNT(*) FROM public.automations WHERE name = 'Suivi 3 Jours') > 0
UNION ALL
SELECT
  (SELECT id FROM public.automations WHERE name = 'Suivi 3 Jours' LIMIT 1),
  2,
  'add_tag',
  '{"tag_name": "Suivi Rapide"}'::jsonb
WHERE (SELECT COUNT(*) FROM public.automations WHERE name = 'Suivi 3 Jours') > 0
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. LEAD INTERACTIONS - Historique des interactions
-- ========================================
INSERT INTO public.lead_interactions (lead_id, type, direction, subject, status)
SELECT
  id,
  'form_submission',
  'inbound',
  'Soumission formulaire website',
  'completed'
FROM public.leads
ON CONFLICT DO NOTHING
UNION ALL
SELECT
  (SELECT id FROM public.leads WHERE email = 'marie.martin@test.com' LIMIT 1),
  'email',
  'outbound',
  'Email de bienvenue',
  'completed'
WHERE (SELECT COUNT(*) FROM public.leads WHERE email = 'marie.martin@test.com') > 0
ON CONFLICT DO NOTHING;

-- ========================================
-- 9. SMTP CONFIG - Configuration email
-- ========================================
INSERT INTO public.smtp_config (host, port, username, password, from_email, from_name, use_tls, is_active, created_by)
SELECT
  'smtp.gmail.com'::text,
  587::integer,
  'test@gmail.com'::text,
  'test-password'::text,
  'contact@premunia.fr'::text,
  'Premunia'::text,
  true::boolean,
  false::boolean,
  (SELECT id FROM public.admins LIMIT 1)
WHERE (SELECT COUNT(*) FROM public.admins) > 0
ON CONFLICT DO NOTHING;

-- ========================================
-- 10. SITE SETTINGS - Paramètres du site
-- ========================================
INSERT INTO public.site_settings (hero_title, hero_subtitle, contact_email, contact_phone, contact_address)
VALUES 
  ('Optimisez votre Retraite dès Maintenant', 
   'Solutions de retraite personnalisées pour les professionnels - Experts depuis 2010',
   'contact@premunia.fr',
   '+33 1 2345 6789',
   '123 Avenue des Champs, 75008 Paris, France')
ON CONFLICT DO NOTHING;

-- ========================================
-- 11. SUMMARY - Vérification des données
-- ========================================

SELECT '📊 ADMINS:' as stats, COUNT(*) as count FROM public.admins;
SELECT '📊 LEADS CRÉÉS:' as stats, COUNT(*) as count FROM public.leads;
SELECT '📝 EMAIL TEMPLATES:' as stats, COUNT(*) as count FROM public.email_templates;
SELECT '🤖 AUTOMATIONS:' as stats, COUNT(*) as count FROM public.automations;
SELECT '🏷️ TAGS:' as stats, COUNT(*) as count FROM public.tags;
SELECT '💬 INTERACTIONS:' as stats, COUNT(*) as count FROM public.lead_interactions;
SELECT '⚙️ SMTP CONFIG:' as stats, COUNT(*) as count FROM public.smtp_config;
SELECT '📄 SITE SETTINGS:' as stats, COUNT(*) as count FROM public.site_settings;

-- ========================================
-- FIN DU SEED ROBUSTE
-- ========================================
-- ✅ Cette version gère les dépendances correctement
-- ✅ Elle ne crée que les données si les prérequis existent
-- ✅ Elle fonctionne même avec un admin fictif
