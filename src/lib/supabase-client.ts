import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Types
export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profession: string;
  message?: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  updated_at: string;
}

export interface SmtpConfig {
  id: string;
  host: string;
  port: string;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  created_at: string;
}

// Create Supabase client
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// ==================== AUTH ====================

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// ==================== ADMIN ====================

export async function promoteToAdmin(userId: string) {
  const { data, error } = await supabase
    .from('admins')
    .insert([{ user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('isAdmin error:', error);
    return false; // Assume not admin if any error occurs
  }

  return !!data;
}

// ==================== LEADS ====================

export async function createLead(lead: Omit<Lead, 'id' | 'status' | 'notes' | 'created_at' | 'updated_at'> & { message?: string }) {
  // Mapper 'message' vers 'notes' car la table leads utilise 'notes'
  const { message, ...leadData } = lead as any;
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      first_name: leadData.first_name,
      last_name: leadData.last_name,
      email: leadData.email,
      phone: leadData.phone,
      profession: leadData.profession,
      status: 'new',
      notes: message || '',
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Lead[];
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function deleteLead(id: string) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getLeadStats() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('status, created_at');

  if (error) throw error;

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // Recent leads (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentLeadsCount = leads.filter(l => new Date(l.created_at) > sevenDaysAgo).length;

  return {
    totalLeads,
    newLeads,
    convertedLeads,
    conversionRate,
    recentLeadsCount,
  };
}

// ==================== SITE SETTINGS ====================

export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found, return defaults
      return {
        hero_title: 'Optimisez votre retraite avec le PER Premunia',
        hero_subtitle: 'Solution d\'épargne retraite sur-mesure pour les professions libérales. Réduisez vos impôts tout en préparant votre avenir.',
        contact_email: 'contact@premunia.fr',
        contact_phone: '01 XX XX XX XX',
        contact_address: '123 Avenue des Champs-Élysées, 75008 Paris',
      };
    }
    throw error;
  }

  return data as SiteSettings;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  // Get the first (and only) settings row
  const { data: existing, error: fetchError } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (!existing) {
    // Create if doesn't exist
    const { data, error } = await supabase
      .from('site_settings')
      .insert([settings])
      .select()
      .single();

    if (error) throw error;
    return data as SiteSettings;
  }

  // Update existing
  const { data, error } = await supabase
    .from('site_settings')
    .update(settings)
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  return data as SiteSettings;
}

// ==================== SMTP CONFIG ====================

export async function getSmtpConfig() {
  const { data, error } = await supabase
    .from('smtp_config')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No config found, return defaults
      return {
        host: '',
        port: '',
        username: '',
        password: '',
        from_email: '',
        from_name: 'Premunia',
      };
    }
    throw error;
  }

  // Don't expose password to frontend
  return {
    ...data,
    password: data.password ? '••••••••' : '',
  } as SmtpConfig;
}

// Valide qu'une chaîne est un UUID valide (format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function updateSmtpConfig(config: Partial<SmtpConfig>) {
  // If password is masked, remove it from update
  if (config.password === '••••••••') {
    delete config.password;
  }

  // Get the first (and only) config row
  const { data: existing, error: fetchError } = await supabase
    .from('smtp_config')
    .select('id')
    .limit(1)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  // Si l'enregistrement existe mais son UUID est invalide (corrompu),
  // on supprime et recrée pour corriger le problème
  if (existing && !isValidUUID(existing.id)) {
    console.warn('UUID smtp_config invalide détecté:', existing.id, '— suppression et recréation...');
    await supabase.from('smtp_config').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { data, error } = await supabase
      .from('smtp_config')
      .insert([config])
      .select()
      .single();
    if (error) throw error;
    return { ...data, password: data.password ? '••••••••' : '' } as SmtpConfig;
  }

  if (!existing) {
    // Create if doesn't exist
    const { data, error } = await supabase
      .from('smtp_config')
      .insert([config])
      .select()
      .single();

    if (error) throw error;
    return { ...data, password: data.password ? '••••••••' : '' } as SmtpConfig;
  }

  // Update existing (UUID valide)
  const { data, error } = await supabase
    .from('smtp_config')
    .update(config)
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  return { ...data, password: data.password ? '••••••••' : '' } as SmtpConfig;
}

// ==================== AUTOMATIONS ====================

export async function getAutomations() {
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getEmailTemplates() {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function sendBulkEmails(automationId: string, leadIds: string[], templateId: string) {
  try {
    // Fetch the template
    const { data: templateData, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw new Error('Template not found');

    // Fetch the leads
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds);

    if (leadsError) throw new Error('Failed to fetch leads');

    if (!leadsData || leadsData.length === 0) {
      throw new Error('No leads found');
    }

    // Send emails to all leads via Edge Function
    const sentEmails: any[] = [];
    const failedEmails: any[] = [];

    for (const lead of leadsData) {
      try {
        // Replace template variables
        let subject = templateData.subject;
        let body = templateData.body;

        const variables = {
          first_name: lead.first_name || '',
          last_name: lead.last_name || '',
          email: lead.email || '',
          profession: lead.profession || '',
          company: lead.company || '',
          today: new Date().toLocaleDateString('fr-FR')
        };

        for (const [key, value] of Object.entries(variables)) {
          subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
          body = body.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }

        // Convert newlines to <br> for HTML
        const htmlBody = body.replace(/\n/g, '<br>');

        // Send email via Supabase Edge Function
        const response = await supabase.functions.invoke('send-email', {
          body: {
            to: lead.email,
            subject: subject,
            body: body,
            htmlBody: htmlBody
          }
        });

        if (response.data?.success) {
          sentEmails.push({
            leadId: lead.id,
            email: lead.email,
            status: 'sent'
          });
        } else {
          failedEmails.push({
            leadId: lead.id,
            email: lead.email,
            error: response.data?.error || 'Unknown error'
          });
        }
      } catch (error: any) {
        failedEmails.push({
          leadId: lead.id,
          email: lead.email,
          error: error.message
        });
      }
    }

    return {
      success: true,
      sent_count: sentEmails.length,
      failed_count: failedEmails.length,
      message: `${sentEmails.length} emails sent, ${failedEmails.length} failed`,
      sentEmails,
      failedEmails
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send bulk emails');
  }
}

// Appel direct à la Edge Function avec le token de session courant
async function invokeEdgeFunction(functionName: string, body: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || publicAnonKey;

  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': publicAnonKey,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Edge Function error ${response.status}: ${text}`);
  }

  return response.json();
}

export async function testSmtpConnection(testEmail: string) {
  try {
    const data = await invokeEdgeFunction('send-email', {
      to: testEmail,
      subject: 'Test Email - Premunia CRM',
      body: 'Ceci est un email de test depuis Premunia CRM. Si vous recevez cet email, la configuration SMTP fonctionne!',
      htmlBody: `
        <h2>Test Email - Premunia CRM</h2>
        <p>Ceci est un email de test depuis Premunia CRM.</p>
        <p style="color: green; font-weight: bold;">✓ Si vous recevez cet email, la configuration SMTP fonctionne!</p>
        <hr />
        <p><small>Envoyé le ${new Date().toLocaleString('fr-FR')}</small></p>
      `
    });

    if (data?.success) {
      return { success: true, message: `Email de test envoyé à ${testEmail}` };
    } else {
      throw new Error(data?.error || 'Échec de l\'envoi de l\'email de test');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erreur lors de l\'envoi de l\'email de test');
  }
}
