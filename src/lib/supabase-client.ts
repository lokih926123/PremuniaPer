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
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false; // Not found
    throw error;
  }

  return !!data;
}

// ==================== LEADS ====================

export async function createLead(lead: Omit<Lead, 'id' | 'status' | 'notes' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      ...lead,
      status: 'new',
      notes: '',
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

  // Update existing
  const { data, error } = await supabase
    .from('smtp_config')
    .update(config)
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  return { ...data, password: data.password ? '••••••••' : '' } as SmtpConfig;
}
