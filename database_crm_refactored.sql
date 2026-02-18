-- Modern CRM Database Schema with Workflows & Automations
-- Complete refactoring for production-ready system

-- ========================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- ========================================
CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ========================================
-- 2. LEADS MANAGEMENT (Enhanced)
-- ========================================
CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  profession text,
  company text,
  country text,
  status text NOT NULL DEFAULT 'new' CHECK (status = ANY (ARRAY['new', 'contacted', 'qualified', 'negotiating', 'converted', 'rejected'])),
  score integer DEFAULT 0,
  notes text,
  assigned_to uuid REFERENCES public.admins(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_contacted_at timestamp with time zone,
  CONSTRAINT leads_pkey PRIMARY KEY (id)
);

-- Lead interaction history
CREATE TABLE public.lead_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'message', 'form_submission')),
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject text,
  body text,
  automation_id uuid,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'scheduled')),
  scheduled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lead_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT lead_interactions_automation_fkey FOREIGN KEY (automation_id) REFERENCES public.automations(id) ON DELETE SET NULL
);

-- ========================================
-- 3. AUTOMATIONS & WORKFLOWS
-- ========================================
CREATE TABLE public.automations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN ('new_lead', 'status_change', 'no_contact_days', 'form_submission', 'manual', 'scheduled', 'custom')),
  trigger_config jsonb NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT automations_pkey PRIMARY KEY (id)
);

-- Workflow steps/actions
CREATE TABLE public.automation_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('send_email', 'send_sms', 'update_lead', 'assign_to', 'add_tag', 'wait', 'condition', 'webhook')),
  action_config jsonb NOT NULL DEFAULT '{}',
  delay_days integer DEFAULT 0,
  delay_hours integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT automation_steps_pkey PRIMARY KEY (id),
  CONSTRAINT automation_steps_unique_order UNIQUE (automation_id, step_order)
);

-- Automation execution history
CREATE TABLE public.automation_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'paused')),
  current_step integer,
  error_message text,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT automation_executions_pkey PRIMARY KEY (id),
  CONSTRAINT automation_executions_unique UNIQUE (automation_id, lead_id)
);

-- ========================================
-- 4. EMAIL TEMPLATES & SEQUENCES
-- ========================================
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  body text NOT NULL,
  html_body text,
  variables text[] DEFAULT ARRAY['{{first_name}}', '{{last_name}}', '{{email}}', '{{profession}}', '{{company}}', '{{today}}'],
  category text,
  created_by uuid NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_templates_pkey PRIMARY KEY (id)
);

-- Email sequences/campaigns
CREATE TABLE public.email_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  automation_id uuid REFERENCES public.automations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  total_leads integer DEFAULT 0,
  completed_leads integer DEFAULT 0,
  failed_leads integer DEFAULT 0,
  created_by uuid NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_campaigns_pkey PRIMARY KEY (id)
);

-- Campaign email sequences
CREATE TABLE public.campaign_emails (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email_template_id uuid NOT NULL REFERENCES public.email_templates(id) ON DELETE RESTRICT,
  sequence_order integer NOT NULL,
  delay_days integer DEFAULT 0,
  delay_hours integer DEFAULT 0,
  CONSTRAINT campaign_emails_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_emails_unique_order UNIQUE (campaign_id, sequence_order)
);

-- ========================================
-- 5. SMS MANAGEMENT
-- ========================================
CREATE TABLE public.sms_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  message text NOT NULL,
  variables text[] DEFAULT ARRAY['{{first_name}}', '{{last_name}}', '{{phone}}'],
  created_by uuid NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sms_templates_pkey PRIMARY KEY (id)
);

-- ========================================
-- 6. SMTP & EMAIL CONFIGURATION
-- ========================================
CREATE TABLE public.smtp_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  host text NOT NULL,
  port integer NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  from_email text NOT NULL,
  from_name text NOT NULL DEFAULT 'Premunia',
  use_tls boolean DEFAULT true,
  reply_to text,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT smtp_config_pkey PRIMARY KEY (id)
);

-- ========================================
-- 7. TAGS & CATEGORIZATION
-- ========================================
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text DEFAULT '#6366f1',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);

-- Lead tags
CREATE TABLE public.lead_tags (
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  CONSTRAINT lead_tags_pkey PRIMARY KEY (lead_id, tag_id)
);

-- ========================================
-- 8. FORM SUBMISSIONS & INTEGRATIONS
-- ========================================
CREATE TABLE public.forms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  form_data jsonb NOT NULL DEFAULT '{}',
  automation_id uuid REFERENCES public.automations(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT forms_pkey PRIMARY KEY (id)
);

-- Form submissions
CREATE TABLE public.form_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  submission_data jsonb NOT NULL,
  ip_address text,
  user_agent text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT form_submissions_pkey PRIMARY KEY (id)
);

-- ========================================
-- 9. WEBHOOKS & INTEGRATIONS
-- ========================================
CREATE TABLE public.webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('lead_created', 'lead_updated', 'automation_triggered', 'email_sent')),
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT webhooks_pkey PRIMARY KEY (id)
);

-- Webhook logs
CREATE TABLE public.webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  status_code integer,
  response_body text,
  error_message text,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT webhook_logs_pkey PRIMARY KEY (id)
);

-- ========================================
-- 10. SETTINGS & APPLICATION STATE
-- ========================================
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hero_title text NOT NULL,
  hero_subtitle text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  contact_address text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);

CREATE TABLE public.kv_store (
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT kv_store_pkey PRIMARY KEY (key)
);

-- ========================================
-- 11. AUDIT LOGGING
-- ========================================
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.admins(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Leads indexes
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);

-- Interactions indexes
CREATE INDEX idx_lead_interactions_lead_id ON public.lead_interactions(lead_id);
CREATE INDEX idx_lead_interactions_type ON public.lead_interactions(type);
CREATE INDEX idx_lead_interactions_automation_id ON public.lead_interactions(automation_id);

-- Automations indexes
CREATE INDEX idx_automations_active ON public.automations(active);
CREATE INDEX idx_automations_trigger_type ON public.automations(trigger_type);
CREATE INDEX idx_automation_executions_automation_id ON public.automation_executions(automation_id);
CREATE INDEX idx_automation_executions_lead_id ON public.automation_executions(lead_id);
CREATE INDEX idx_automation_executions_status ON public.automation_executions(status);

-- Email indexes
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_campaigns_automation_id ON public.email_campaigns(automation_id);

-- Tags indexes
CREATE INDEX idx_lead_tags_lead_id ON public.lead_tags(lead_id);
CREATE INDEX idx_lead_tags_tag_id ON public.lead_tags(tag_id);

-- Form indexes
CREATE INDEX idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX idx_form_submissions_lead_id ON public.form_submissions(lead_id);
CREATE INDEX idx_form_submissions_submitted_at ON public.form_submissions(submitted_at);

-- Audit indexes
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

-- Admin can access all leads
CREATE POLICY leads_admin_access ON public.leads
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- Admin can view assigned leads
CREATE POLICY leads_assigned_access ON public.leads
  FOR SELECT
  USING (assigned_to IN (SELECT id FROM public.admins WHERE user_id = auth.uid()));

-- Admin can manage automations
CREATE POLICY automations_admin_access ON public.automations
  FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Update leads timestamp on change
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Auto-log lead status changes
CREATE OR REPLACE FUNCTION log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, changes)
    VALUES ('status_change', 'lead', NEW.id, jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_lead_status
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION log_lead_status_change();
