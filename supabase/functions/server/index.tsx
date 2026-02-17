import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger(console.log));

// Supabase client for admin operations
const getAdminClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Supabase client for auth verification
const getClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Helper to verify auth and get user
async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'No authorization token', user: null };
  }
  
  const token = authHeader.split(' ')[1];
  const supabase = getClient();
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    console.log('Auth verification failed:', error);
    return { error: 'Invalid token', user: null };
  }
  
  return { user: data.user, error: null };
}

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const admins = await kv.get('admins') || [];
  return admins.includes(userId);
}

// ============================================
// PUBLIC ROUTES
// ============================================

// Get site settings
app.get('/make-server-9318fa5a/settings', async (c) => {
  try {
    const settings = await kv.get('site_settings') || {
      hero_title: 'Optimisez votre retraite avec le PER Premunia',
      hero_subtitle: 'Solution d\'épargne retraite sur-mesure pour les professions libérales. Réduisez vos impôts tout en préparant votre avenir.',
      contact_email: 'contact@premunia.fr',
      contact_phone: '01 XX XX XX XX',
      contact_address: '123 Avenue des Champs-Élysées, 75008 Paris',
    };
    
    return c.json({ success: true, data: settings });
  } catch (error) {
    console.log('Error fetching settings:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create lead (public)
app.post('/make-server-9318fa5a/leads', async (c) => {
  try {
    const body = await c.req.json();
    const { first_name, last_name, email, phone, profession, message } = body;
    
    if (!first_name || !last_name || !email || !phone || !profession) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    const leadId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const lead = {
      id: leadId,
      first_name,
      last_name,
      email,
      phone,
      profession,
      message: message || '',
      status: 'new',
      notes: '',
      created_at: now,
      updated_at: now,
    };
    
    // Save to KV store
    await kv.set(`lead:${leadId}`, lead);
    
    // Add to leads index
    const leadsIndex = await kv.get('leads_index') || [];
    leadsIndex.push(leadId);
    await kv.set('leads_index', leadsIndex);
    
    console.log('Lead created successfully:', leadId);
    return c.json({ success: true, data: lead });
  } catch (error) {
    console.log('Error creating lead:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// AUTH ROUTES
// ============================================

// Sign up
app.post('/make-server-9318fa5a/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    
    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password required' }, 400);
    }
    
    const supabase = getAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      email_confirm: true, // Auto-confirm since email server not configured
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ success: false, error: error.message }, 400);
    }
    
    console.log('User created successfully:', data.user.id);
    return c.json({ success: true, data: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Promote to admin
app.post('/make-server-9318fa5a/auth/promote-admin', async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error || !user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    // Add user to admins list
    const admins = await kv.get('admins') || [];
    if (!admins.includes(user.id)) {
      admins.push(user.id);
      await kv.set('admins', admins);
    }
    
    console.log('User promoted to admin:', user.id);
    return c.json({ success: true, data: { userId: user.id, isAdmin: true } });
  } catch (error) {
    console.log('Error promoting admin:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Check admin status
app.get('/make-server-9318fa5a/auth/check-admin', async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error || !user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    const adminStatus = await isAdmin(user.id);
    return c.json({ success: true, data: { isAdmin: adminStatus, userId: user.id } });
  } catch (error) {
    console.log('Error checking admin status:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

// Get all leads
app.get('/make-server-9318fa5a/admin/leads', async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error || !user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    if (!(await isAdmin(user.id))) {
      return c.json({ success: false, error: 'Forbidden: Admin access required' }, 403);
    }
    
    const leadsIndex = await kv.get('leads_index') || [];
    const leads = [];
    
    for (const leadId of leadsIndex) {
      const lead = await kv.get(`lead:${leadId}`);
      if (lead) {
        leads.push(lead);
      }
    }
    
    // Sort by created_at descending
    leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return c.json({ success: true, data: leads });
  } catch (error) {
    console.log('Error fetching leads:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update lead
app.put('/make-server-9318fa5a/admin/leads/:id', async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error || !user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    if (!(await isAdmin(user.id))) {
      return c.json({ success: false, error: 'Forbidden: Admin access required' }, 403);
    }
    
    const leadId = c.req.param('id');
    const body = await c.req.json();
    
    const existingLead = await kv.get(`lead:${leadId}`);
    if (!existingLead) {
      return c.json({ success: false, error: 'Lead not found' }, 404);
    }
    
    const updatedLead = {
      ...existingLead,
      ...body,
      id: leadId, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`lead:${leadId}`, updatedLead);
    
    console.log('Lead updated successfully:', leadId);
    return c.json({ success: true, data: updatedLead });
  } catch (error) {
    console.log('Error updating lead:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete lead
app.delete('/make-server-9318fa5a/admin/leads/:id', async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error || !user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    if (!(await isAdmin(user.id))) {
      return c.json({ success: false, error: 'Forbidden: Admin access required' }, 403);
    }
    
    const leadId = c.req.param('id');
    
    // Remove from KV store
    await kv.del(`lead:${leadId}`);
    
    // Remove from index
    const leadsIndex = await kv.get('leads_index') || [];
    const newIndex = leadsIndex.filter((id: string) => id !== leadId);
    await kv.set('leads_index', newIndex);
    
    console.log('Lead deleted successfully:', leadId);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting lead:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get dashboard stats
app.get('/make-server-9318fa5a/admin/stats', async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error || !user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    if (!(await isAdmin(user.id))) {
      return c.json({ success: false, error: 'Forbidden: Admin access required' }, 403);
    }
    
    const leadsIndex = await kv.get('leads_index') || [];
    const leads = [];
    
    for (const leadId of leadsIndex) {
      const lead = await kv.get(`lead:${leadId}`);
      if (lead) {
        leads.push(lead);
      }
    }
    
    const totalLeads = leads.length;
    const newLeads = leads.filter((l: any) => l.status === 'new').length;
    const convertedLeads = leads.filter((l: any) => l.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';
    
    // Recent leads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLeads = leads.filter((l: any) => new Date(l.created_at) > sevenDaysAgo);
    
    return c.json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        convertedLeads,
        conversionRate,
        recentLeadsCount: recentLeads.length,
      },
    });
  } catch (error) {
    console.log('Error fetching stats:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update site settings
app.put('/make-server-9318fa5a/admin/settings', async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error || !user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    if (!(await isAdmin(user.id))) {
      return c.json({ success: false, error: 'Forbidden: Admin access required' }, 403);
    }
    
    const body = await c.req.json();
    await kv.set('site_settings', body);
    
    console.log('Site settings updated successfully');
    return c.json({ success: true, data: body });
  } catch (error) {
    console.log('Error updating settings:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get SMTP config
app.get('/make-server-9318fa5a/admin/smtp', async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error || !user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    if (!(await isAdmin(user.id))) {
      return c.json({ success: false, error: 'Forbidden: Admin access required' }, 403);
    }
    
    const smtp = await kv.get('smtp_config') || {
      host: '',
      port: '',
      username: '',
      password: '',
      from_email: '',
      from_name: 'Premunia',
    };
    
    // Don't send password to frontend
    return c.json({ success: true, data: { ...smtp, password: smtp.password ? '••••••••' : '' } });
  } catch (error) {
    console.log('Error fetching SMTP config:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update SMTP config
app.put('/make-server-9318fa5a/admin/smtp', async (c) => {
  try {
    const { user, error } = await verifyAuth(c.req.raw);
    if (error || !user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    if (!(await isAdmin(user.id))) {
      return c.json({ success: false, error: 'Forbidden: Admin access required' }, 403);
    }
    
    const body = await c.req.json();
    
    // If password is masked, keep existing password
    if (body.password === '••••••••') {
      const existing = await kv.get('smtp_config') || {};
      body.password = existing.password || '';
    }
    
    await kv.set('smtp_config', body);
    
    console.log('SMTP config updated successfully');
    return c.json({ success: true, data: { ...body, password: body.password ? '••••••••' : '' } });
  } catch (error) {
    console.log('Error updating SMTP config:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Health check
app.get('/make-server-9318fa5a/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
