import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Mail, Settings, Plus, CheckCircle2, AlertCircle, Send, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getAutomations, getEmailTemplates, getLeads as getLeadsData, sendBulkEmails, testSmtpConnection } from '../../../lib/supabase-client';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config?: any;
  active: boolean;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profession?: string;
  company?: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  'new_lead': '🆕 Nouveau Lead',
  'no_contact_days': '⏰ Sans contact (J+3)',
  'status_change': '📊 Changement de statut',
  'form_submission': '📝 Soumission formulaire',
  'manual': '👆 Déclenché manuellement',
  'scheduled': '🗓️ Planifié',
  'custom': '⚙️ Personnalisé'
};

export default function Automation() {
  const queryClient = useQueryClient();
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [smtpStatus, setSmtpStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');

  const mockData = {
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean@example.com',
    profession: 'Manager',
    company: 'Tech Solutions',
    today: new Date().toLocaleDateString('fr-FR')
  };

  // Queries
  const { data: automations = [], isLoading: automationsLoading } = useQuery({
    queryKey: ['admin-automations'],
    queryFn: async () => {
      try {
        const data = await getAutomations();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching automations:', error);
        toast.error('Erreur lors du chargement des automations');
        return [];
      }
    },
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      try {
        const data = await getEmailTemplates();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
      }
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      try {
        const data = await getLeadsData();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
      }
    },
  });

  // Mutations
  const testSmtpMutation = useMutation({
    mutationFn: async () => {
      if (!testEmail) throw new Error('Veuillez entrer une adresse email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
        throw new Error('Adresse email invalide');
      }
      setSmtpStatus('checking');
      // Appel réel à la Edge Function via testSmtpConnection
      const result = await testSmtpConnection(testEmail);
      setSmtpStatus('success');
      toast.success(`✅ Email de test envoyé à ${testEmail}`);
      return result;
    },
    onError: (error: any) => {
      setSmtpStatus('error');
      toast.error(`❌ Erreur SMTP : ${error.message || 'Connexion échouée'}`);
    },
    onSuccess: () => {
      setTimeout(() => setSmtpStatus('idle'), 5000);
    }
  });

  const sendBulkEmailsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAutomation || selectedLeads.length === 0) {
        throw new Error('Veuillez sélectionner une automatisation et au moins un contact');
      }
      const response = await sendBulkEmails(
        selectedAutomation.id,
        selectedLeads,
        templates?.[0]?.id || ''
      );
      return response;
    },
    onSuccess: (data: any) => {
      toast.success(`${selectedLeads.length} emails lancés!`);
      setSelectedLeads([]);
      setShowSendModal(false);
      queryClient.invalidateQueries({ queryKey: ['admin-automations'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'envoi des emails');
    }
  });

  // Helper functions
  const renderTemplate = (text: string) => {
    return text.replace(/\{\{(\w+)\}\}/g, (_: string, match: string) => {
      return (mockData as any)[match] || `{{${match}}}`;
    });
  };

  const toggleLead = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  return (
    <>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Zap className="text-[#880E4F]" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Automations & Emails</h1>
        </div>
        <p className="text-slate-500">Gérez vos séquences d'emails automatiques et testez vos connexions SMTP.</p>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT: Workflows List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Workflows actifs</h2>
            <button className="text-[#EE3B33] text-sm font-bold flex items-center gap-1 hover:underline">
              <Plus size={16} /> Nouveau
            </button>
          </div>

          {automationsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : automations && automations.length > 0 ? (
            <div className="space-y-3">
              {automations.map((item: Automation) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2 }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedAutomation?.id === item.id
                      ? 'bg-white border-[#EE3B33] shadow-md ring-1 ring-[#EE3B33]'
                      : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => setSelectedAutomation(item)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Mail size={20} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                      item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.active ? '✓ Actif' : '○ Inactif'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.name}</h3>
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <Zap size={12} /> {TRIGGER_LABELS[item.trigger_type] || item.trigger_type}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle size={20} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune automatisation trouvée</p>
            </div>
          )}
        </div>

        {/* RIGHT: Details & Actions */}
        <div className="lg:col-span-9">
          {selectedAutomation ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Automation Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedAutomation.name}</h2>
                    <p className="text-slate-500 mt-1">{selectedAutomation.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 mb-1">DÉCLENCHEUR</p>
                    <p className="text-lg font-bold text-[#EE3B33]">
                      {TRIGGER_LABELS[selectedAutomation.trigger_type] || selectedAutomation.trigger_type}
                    </p>
                  </div>
                </div>
                {selectedAutomation.trigger_config && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-blue-900 mb-2">Configuration du déclencheur</p>
                    <pre className="text-xs text-blue-800 font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedAutomation.trigger_config, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Template Preview */}
              {templates && templates.length > 0 && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Mail size={18} /> Aperçu Modèle
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-1">Sujet</p>
                      <p className="text-sm font-bold text-slate-900 bg-slate-50 p-3 rounded-lg">
                        {renderTemplate(templates[0].subject || '')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-1">Corps du message</p>
                      <pre className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap font-mono overflow-x-auto">
                        {renderTemplate(templates[0].body || '')}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* SMTP Test */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Settings size={18} /> Tester Connexion SMTP
                </h3>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Entrez une adresse email pour tester..."
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                  />
                  <button
                    onClick={() => testSmtpMutation.mutate()}
                    disabled={testSmtpMutation.isPending || !testEmail}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      smtpStatus === 'success'
                        ? 'bg-green-100 text-green-700'
                        : smtpStatus === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-[#EE3B33] text-white hover:bg-[#CC2E28]'
                    } disabled:opacity-60`}
                  >
                    {smtpStatus === 'checking' ? 'Vérification...' : 'Tester Connexion'}
                  </button>
                  {smtpStatus === 'success' && (
                    <div className="bg-green-50 p-3 rounded-lg text-green-700 text-sm flex items-center gap-2">
                      <CheckCircle2 size={16} /> Connexion SMTP valide!
                    </div>
                  )}
                  {smtpStatus === 'error' && (
                    <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm flex items-center gap-2">
                      <AlertCircle size={16} /> Erreur SMTP
                    </div>
                  )}
                </div>
              </div>

              {/* Send Bulk Emails */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Send size={18} /> Envoyer vers Contacts
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Sélectionnés: <strong>{selectedLeads.length}</strong> contact(s)
                  </p>
                  <button
                    onClick={() => setShowSendModal(true)}
                    className="w-full py-2 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all"
                  >
                    <Users size={16} className="inline mr-2" />
                    Choisir Contacts
                  </button>
                  <button
                    onClick={() => sendBulkEmailsMutation.mutate()}
                    disabled={selectedLeads.length === 0 || sendBulkEmailsMutation.isPending}
                    className={`w-full py-2 rounded-xl font-bold text-sm transition-all ${
                      selectedLeads.length > 0
                        ? 'bg-[#EE3B33] text-white hover:bg-[#CC2E28]'
                        : 'bg-slate-200 text-slate-400'
                    } disabled:opacity-60`}
                  >
                    {sendBulkEmailsMutation.isPending ? 'Envoi en cours...' : `Envoyer à ${selectedLeads.length} contacts`}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Settings size={40} className="text-slate-200" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Sélectionnez une automatisation</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Choisissez un workflow à gauche pour voir son contenu, tester la connexion SMTP et envoyer des emails individuels à vos contacts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Select Leads */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">Sélectionnez les contacts</h2>
              <p className="text-slate-600 text-sm mt-1">Choisissez les leads pour cette campagne email</p>
            </div>

            <div className="p-8 space-y-3">
              {leads && leads.length > 0 ? (
                leads.map((lead: any) => (
                  <label key={lead.id} className="flex items-center p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleLead(lead.id)}
                      className="w-5 h-5 rounded border-slate-300 text-[#EE3B33] cursor-pointer"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-bold text-slate-900">{lead.first_name} {lead.last_name}</p>
                      <p className="text-sm text-slate-600">{lead.email}</p>
                      {lead.profession && <p className="text-xs text-slate-500">{lead.profession}</p>}
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">Aucun contact disponible</p>
              )}
            </div>

            <div className="p-8 border-t border-slate-200 bg-slate-50 flex gap-3 sticky bottom-0">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-900 hover:bg-slate-100 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowSendModal(false)}
                disabled={selectedLeads.length === 0}
                className="flex-1 py-3 rounded-xl bg-[#EE3B33] text-white font-bold hover:bg-[#CC2E28] transition-all disabled:opacity-50"
              >
                Confirmer ({selectedLeads.length})
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
