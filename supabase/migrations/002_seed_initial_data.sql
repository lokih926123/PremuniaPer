-- ========================================
-- SEED DATA - Données initiales pour le CRM Premunia
-- ========================================
-- Ce fichier remplifie la base avec des données de test
-- À exécuter APRÈS la migration du schéma

-- ========================================
-- 1. ADMIN USER (À ADAPTER avec votre user_id réel)
-- ========================================
-- IMPORTANT: Remplacez 'YOUR_USER_ID_HERE' par l'ID de votre utilisateur Supabase
-- Vous pouvez trouver cet ID dans: Supabase Dashboard → Authentication → Users

-- Créer un admin test si aucun n'existe
-- Si cette requête échoue parce que YOUR_USER_ID_HERE n'est pas valide, 
-- remplacez-le par votre vrai user_id depuis Supabase Dashboard

INSERT INTO public.admins (user_id, role) 
VALUES 
  ('YOUR_USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;

-- ALTERNATIVE si vous voulez tester sans remplacer le user_id:
-- Commentez la ligne INSERT ci-dessus et décommentez celle-ci pour utiliser un UUID fictif:
-- INSERT INTO public.admins (user_id, role) 
-- VALUES ('00000000-0000-0000-0000-000000000001', 'super_admin')
-- ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- 2. LEADS - Données de test
-- ========================================
INSERT INTO public.leads (first_name, last_name, email, phone, profession, company, country, status, score)
VALUES 
  ('Jean', 'Dupont', 'jean.dupont@exemple.com', '+33612345678', 'Consultant Financier', 'EY France', 'FR', 'new', 50),
  ('Marie', 'Martin', 'marie.martin@exemple.com', '+33623456789', 'Directrice RH', 'Accenture', 'FR', 'contacted', 75),
  ('Pierre', 'Bernard', 'pierre.bernard@exemple.com', '+33634567890', 'Entrepreneur', 'Startup Tech', 'FR', 'qualified', 85),
  ('Sophie', 'Leclerc', 'sophie.leclerc@exemple.com', '+33645678901', 'Manager IT', 'Deloitte', 'FR', 'negotiating', 90),
  ('Luc', 'Moreau', 'luc.moreau@exemple.com', '+33656789012', 'Avocat', 'Cabinet Juridique', 'FR', 'new', 40),
  ('Anne', 'Girard', 'anne.girard@exemple.com', '+33667890123', 'Médecin', 'Hopital Saint-Paul', 'FR', 'converted', 100),
  ('Marc', 'Dubois', 'marc.dubois@exemple.com', '+33678901234', 'Directeur Commercial', 'LVMH', 'FR', 'new', 60),
  ('Christine', 'Robert', 'christine.robert@exemple.com', '+33689012345', 'Directrice Générale', 'PME Services', 'FR', 'contacted', 80),
  ('Philippe', 'Laurent', 'philippe.laurent@exemple.com', '+33690123456', 'Ingénieur Senior', 'Thales', 'FR', 'qualified', 88),
  ('Isabelle', 'Petit', 'isabelle.petit@exemple.com', '+33601234567', 'Coach Professional', 'Coaching Plus', 'FR', 'new', 55);

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
  ('SOS Retraite', '#ec4899', 'Situation urgente recommandation');

-- ========================================
-- 4. LEAD TAGS - Association tags/leads
-- ========================================
INSERT INTO public.lead_tags (lead_id, tag_id)
SELECT (SELECT id FROM public.leads WHERE email = 'marie.martin@exemple.com'), (SELECT id FROM public.tags WHERE name = 'Haute Valeur')
UNION ALL
SELECT (SELECT id FROM public.leads WHERE email = 'marie.martin@exemple.com'), (SELECT id FROM public.tags WHERE name = 'Premium')
UNION ALL
SELECT (SELECT id FROM public.leads WHERE email = 'pierre.bernard@exemple.com'), (SELECT id FROM public.tags WHERE name = 'Haute Valeur')
UNION ALL
SELECT (SELECT id FROM public.leads WHERE email = 'pierre.bernard@exemple.com'), (SELECT id FROM public.tags WHERE name = 'Partenaire Potentiel')
UNION ALL
SELECT (SELECT id FROM public.leads WHERE email = 'sophie.leclerc@exemple.com'), (SELECT id FROM public.tags WHERE name = 'Premium')
UNION ALL
SELECT (SELECT id FROM public.leads WHERE email = 'anne.girard@exemple.com'), (SELECT id FROM public.tags WHERE name = 'Haute Valeur')
UNION ALL
SELECT (SELECT id FROM public.leads WHERE email = 'christine.robert@exemple.com'), (SELECT id FROM public.tags WHERE name = 'Premium')
UNION ALL
SELECT (SELECT id FROM public.leads WHERE email = 'philippe.laurent@exemple.com'), (SELECT id FROM public.tags WHERE name = 'Haute Valeur');

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
UNION ALL
SELECT
  'Suivi 3 jours',
  'Ne laissez pas votre retraite au hasard',
  'Bonjour {{first_name}},

Nous n''avons pas eu de ses nouvelles depuis quelques jours 😊

As we discussed, planning your retirement is crucial. Premunia specializes in helping professionals like you ({{profession}}) optimize their retirement strategy.

A few quick facts:
• 85% of professionals miss significant tax optimization opportunities
• The average saving is €50,000+ over retirement period
• Many strategies can be implemented quickly

Would you like to schedule a 30-minute discovery call?

Best regards,
Premunia Team',
  (SELECT id FROM public.admins LIMIT 1)
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
  (SELECT id FROM public.admins LIMIT 1);

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
UNION ALL
SELECT
  'Suivi 3 Jours',
  'Relance les leads après 3 jours sans contact',
  'no_contact_days',
  '{"days": 3}'::jsonb,
  true,
  (SELECT id FROM public.admins LIMIT 1)
UNION ALL
SELECT
  'Qualification Premium',
  'Envoi d''offre spéciale aux leads qualifiés',
  'status_change',
  '{"old_status": "new", "new_status": "qualified"}'::jsonb,
  true,
  (SELECT id FROM public.admins LIMIT 1)
UNION ALL
SELECT
  'Celebration Conversion',
  'Message de bienvenue post-conversion',
  'status_change',
  '{"old_status": "negotiating", "new_status": "converted"}'::jsonb,
  true,
  (SELECT id FROM public.admins LIMIT 1);

-- ========================================
-- 7. AUTOMATION STEPS - Étapes des workflows
-- ========================================
-- Automation 1: Bienvenue
INSERT INTO public.automation_steps (automation_id, step_order, action_type, action_config)
SELECT
  (SELECT id FROM public.automations WHERE name = 'Bienvenue Automatique'),
  1,
  'send_email',
  '{"template_name": "Bienvenue Lead"}'::jsonb
UNION ALL
-- Automation 2: Suivi 3 jours
SELECT
  (SELECT id FROM public.automations WHERE name = 'Suivi 3 Jours'),
  1,
  'send_email',
  '{"template_name": "Suivi 3 jours"}'::jsonb
UNION ALL
SELECT
  (SELECT id FROM public.automations WHERE name = 'Suivi 3 Jours'),
  2,
  'add_tag',
  '{"tag_name": "Suivi Rapide"}'::jsonb
UNION ALL
-- Automation 3: Qualification
SELECT
  (SELECT id FROM public.automations WHERE name = 'Qualification Premium'),
  1,
  'send_email',
  '{"template_name": "Offre Spéciale Premium"}'::jsonb
UNION ALL
SELECT
  (SELECT id FROM public.automations WHERE name = 'Qualification Premium'),
  2,
  'add_tag',
  '{"tag_name": "Haute Valeur"}'::jsonb
UNION ALL
-- Automation 4: Conversion
SELECT
  (SELECT id FROM public.automations WHERE name = 'Celebration Conversion'),
  1,
  'send_email',
  '{"template_name": "Merci - Post Conversion"}'::jsonb;

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
UNION ALL
SELECT
  (SELECT id FROM public.leads WHERE email = 'marie.martin@exemple.com'),
  'email',
  'outbound',
  'Email de bienvenue',
  'completed'
UNION ALL
SELECT
  (SELECT id FROM public.leads WHERE email = 'marie.martin@exemple.com'),
  'call',
  'outbound',
  'Appel découverte arrangé',
  'completed'
UNION ALL
SELECT
  (SELECT id FROM public.leads WHERE email = 'pierre.bernard@exemple.com'),
  'email',
  'inbound',
  'Intéressé par packages premium',
  'completed'
UNION ALL
SELECT
  (SELECT id FROM public.leads WHERE email = 'sophie.leclerc@exemple.com'),
  'meeting',
  'outbound',
  'Réunion stratégie retraite',
  'completed'
UNION ALL
SELECT
  (SELECT id FROM public.leads WHERE email = 'anne.girard@exemple.com'),
  'email',
  'inbound',
  'Confirmation satisfaction client',
  'completed';

-- ========================================
-- 9. SMTP CONFIG - Configuration email
-- ========================================
INSERT INTO public.smtp_config (host, port, username, password, from_email, from_name, use_tls, is_active)
VALUES 
  ('smtp.gmail.com', 587, 'votre-email@gmail.com', 'votre-mot-de-passe-app', 'contact@premunia.fr', 'Premunia', true, false)
ON CONFLICT DO NOTHING;

-- NOTE: Configurez vos vrais paramètres SMTP dans Supabase Dashboard

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
ON CONFLICT (id) DO UPDATE SET 
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  contact_address = EXCLUDED.contact_address;

-- ========================================
-- SUMMARY - Vérification des données
-- ========================================

-- Voir tous les leads créés
SELECT '📊 LEADS CRÉÉS:' as stats, COUNT(*) as count FROM public.leads;
SELECT '📝 EMAIL TEMPLATES:' as stats, COUNT(*) as count FROM public.email_templates;
SELECT '🤖 AUTOMATIONS:' as stats, COUNT(*) as count FROM public.automations;
SELECT '🏷️ TAGS:' as stats, COUNT(*) as count FROM public.tags;
SELECT '💬 INTERACTIONS:' as stats, COUNT(*) as count FROM public.lead_interactions;

-- ========================================
-- NOTES IMPORTANTES
-- ========================================

/*
✅ ÉTAPES SUIVANTES:

1. **Mettre à jour l'admin user_id**:
   - Accédez à: Supabase Dashboard → Authentication → Users
   - Trouvez votre user_id
   - Remplacez 'YOUR_USER_ID_HERE' dans ce fichier
   - Ré-exécutez la section admin

2. **Configurer SMTP**:
   - Allez dans: Settings du Dashboard
   - Entrez vos vrais paramètres SMTP Gmail ou autre
   - Les templates d'email seront alors fonctionnels

3. **Testez une automation**:
   - Créez un lead de test
   - Vérifiez que l'automation se déclenche
   - Consultez lead_interactions pour l'historique

4. **Explorateur les données**:
   - Table Editor montrera tous les leads, tags, automations
   - Les RLS policies s'appliqueront automatiquement
   - Seuls les admins peuvent accéder aux données

✨ Félicitations! Votre base est maintenant remplie et prête pour la production!
*/
