-- ========================================
-- MIGRATION 005: Correction RLS + Politiques complètes
-- ========================================

-- ========================================
-- 1. CORRECTION RLS : email_templates
-- ========================================
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_templates_admin_access" ON public.email_templates;
CREATE POLICY "email_templates_admin_access" ON public.email_templates
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- ========================================
-- 2. CORRECTION RLS : smtp_config
-- ========================================
ALTER TABLE public.smtp_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "smtp_config_admin_access" ON public.smtp_config;
CREATE POLICY "smtp_config_admin_access" ON public.smtp_config
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- ========================================
-- 3. CORRECTION RLS : lead_interactions
-- ========================================
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lead_interactions_admin_access" ON public.lead_interactions;
CREATE POLICY "lead_interactions_admin_access" ON public.lead_interactions
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- ========================================
-- 4. CORRECTION RLS : automations
-- ========================================
DROP POLICY IF EXISTS "automations_admin_access" ON public.automations;
CREATE POLICY "automations_admin_access" ON public.automations
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- ========================================
-- 5. CORRECTION RLS : leads (public insert pour le formulaire)
-- ========================================
DROP POLICY IF EXISTS "leads_admin_access" ON public.leads;
DROP POLICY IF EXISTS "leads_assigned_access" ON public.leads;
DROP POLICY IF EXISTS "leads_public_insert" ON public.leads;

-- Admins peuvent tout faire
CREATE POLICY "leads_admin_access" ON public.leads
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- Tout le monde peut créer un lead (formulaire public)
CREATE POLICY "leads_public_insert" ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- ========================================
-- 6. CORRECTION RLS : site_settings
-- ========================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_admin_write" ON public.site_settings;

CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "site_settings_admin_write" ON public.site_settings
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- ========================================
-- 7. CORRECTION RLS : admins
-- ========================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_self_read" ON public.admins;
CREATE POLICY "admins_self_read" ON public.admins
  FOR SELECT
  USING (true);

-- ========================================
-- 8. CORRECTION RLS : audit_logs
-- ========================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_admin_access" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_access" ON public.audit_logs
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- ========================================
-- 9. Fonction pour enregistrer une interaction email
-- ========================================
CREATE OR REPLACE FUNCTION public.log_email_interaction(
  p_lead_id uuid,
  p_subject text,
  p_body text,
  p_automation_id uuid DEFAULT NULL,
  p_status text DEFAULT 'completed'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_interaction_id uuid;
BEGIN
  INSERT INTO public.lead_interactions (
    lead_id,
    type,
    direction,
    subject,
    body,
    automation_id,
    status
  ) VALUES (
    p_lead_id,
    'email',
    'outbound',
    p_subject,
    p_body,
    p_automation_id,
    p_status
  )
  RETURNING id INTO v_interaction_id;

  -- Mettre à jour last_contacted_at
  UPDATE public.leads
  SET last_contacted_at = now(), updated_at = now()
  WHERE id = p_lead_id;

  RETURN v_interaction_id;
END;
$$;
