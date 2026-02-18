import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeads, updateLead, deleteLead, getLeadInteractions, sendEmailToLead, getEmailTemplates } from '../../../lib/supabase-client';
import { toast } from 'sonner';
import { Search, Edit, Trash2, X, Save, Mail, Phone, Clock, ChevronDown, ChevronUp, Send, MessageSquare, Eye } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new:         { label: 'Nouveau',   color: 'text-blue-700',   bg: 'bg-blue-100' },
  contacted:   { label: 'Contacté',  color: 'text-yellow-700', bg: 'bg-yellow-100' },
  qualified:   { label: 'Qualifié',  color: 'text-purple-700', bg: 'bg-purple-100' },
  negotiating: { label: 'Négo.',     color: 'text-orange-700', bg: 'bg-orange-100' },
  converted:   { label: 'Converti',  color: 'text-green-700',  bg: 'bg-green-100' },
  rejected:    { label: 'Rejeté',    color: 'text-red-700',    bg: 'bg-red-100' },
};

const INTERACTION_ICONS: Record<string, string> = {
  email: '📧',
  call: '📞',
  meeting: '🤝',
  message: '💬',
  form_submission: '📝',
};

export default function Leads() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'email'>('info');
  const [editForm, setEditForm] = useState({ status: '', notes: '' });
  const [emailForm, setEmailForm] = useState({ subject: '', body: '', templateId: '' });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: getEmailTemplates,
  });

  const { data: interactions = [], isLoading: interactionsLoading } = useQuery({
    queryKey: ['lead-interactions', selectedLead?.id],
    queryFn: () => getLeadInteractions(selectedLead!.id),
    enabled: !!selectedLead?.id && activeTab === 'history',
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLead(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setSelectedLead(updated);
      toast.success('Lead mis à jour ✓');
    },
    onError: (e: Error) => toast.error(`Erreur : ${e.message}`),
  });

  const deleteLeadMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setSelectedLead(null);
      toast.success('Lead supprimé');
    },
    onError: (e: Error) => toast.error(`Erreur : ${e.message}`),
  });

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      if (!selectedLead) throw new Error('Aucun lead sélectionné');
      if (!emailForm.subject.trim()) throw new Error('Sujet requis');
      if (!emailForm.body.trim()) throw new Error('Corps du message requis');
      return sendEmailToLead(selectedLead, emailForm.subject, emailForm.body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-interactions', selectedLead?.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setEmailForm({ subject: '', body: '', templateId: '' });
      setActiveTab('history');
      toast.success(`✅ Email envoyé à ${selectedLead?.email}`);
    },
    onError: (e: Error) => toast.error(`❌ ${e.message}`),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const openLead = (lead: any) => {
    setSelectedLead(lead);
    setEditForm({ status: lead.status, notes: lead.notes || '' });
    setEmailForm({ subject: '', body: '', templateId: '' });
    setActiveTab('info');
  };

  const applyTemplate = (templateId: string) => {
    const tpl = (templates as any[]).find((t: any) => t.id === templateId);
    if (!tpl || !selectedLead) return;
    const vars: Record<string, string> = {
      first_name: selectedLead.first_name,
      last_name: selectedLead.last_name,
      email: selectedLead.email,
      profession: selectedLead.profession || '',
      company: selectedLead.company || '',
      today: new Date().toLocaleDateString('fr-FR'),
    };
    let subject = tpl.subject;
    let body = tpl.body;
    for (const [k, v] of Object.entries(vars)) {
      subject = subject.replace(new RegExp(`{{${k}}}`, 'g'), v);
      body = body.replace(new RegExp(`{{${k}}}`, 'g'), v);
    }
    setEmailForm({ subject, body, templateId });
  };

  const filteredLeads = leads.filter((lead: any) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      lead.first_name?.toLowerCase().includes(q) ||
      lead.last_name?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.profession?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-100' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full gap-6">
      {/* ── LEFT: Table ── */}
      <div className={`flex flex-col space-y-4 transition-all ${selectedLead ? 'w-1/2' : 'w-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Leads</h1>
            <p className="text-gray-500 text-sm mt-0.5">{filteredLeads.length} lead(s) trouvé(s)</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, email, profession..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 flex-1 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE3B33] mx-auto" />
              <p className="mt-3 text-gray-500 text-sm">Chargement...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun lead trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Contact</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Profession</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Créé</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLeads.map((lead: any) => (
                    <tr
                      key={lead.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-red-50 border-l-2 border-[#EE3B33]' : ''}`}
                      onClick={() => openLead(lead)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{lead.first_name} {lead.last_name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />{lead.email}
                        </div>
                        {lead.phone && (
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />{lead.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{lead.profession || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: fr })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { openLead(lead); setActiveTab('email'); }}
                            className="p-1.5 text-[#EE3B33] hover:bg-red-50 rounded-lg transition"
                            title="Envoyer un email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openLead(lead)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Voir le détail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer ${lead.first_name} ${lead.last_name} ?`)) {
                                deleteLeadMutation.mutate(lead.id);
                              }
                            }}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Lead Detail Panel ── */}
      {selectedLead && (
        <div className="w-1/2 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                {selectedLead.first_name} {selectedLead.last_name}
              </h2>
              <p className="text-sm text-gray-500">{selectedLead.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedLead.status} />
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { id: 'info', label: 'Informations', icon: '👤' },
              { id: 'history', label: 'Historique', icon: '📋' },
              { id: 'email', label: 'Envoyer Email', icon: '✉️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-[#EE3B33] text-[#EE3B33]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* ── TAB: Informations ── */}
            {activeTab === 'info' && (
              <div className="space-y-5">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-sm">{selectedLead.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                    <p className="font-medium text-sm">{selectedLead.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Profession</p>
                    <p className="font-medium text-sm">{selectedLead.profession || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Entreprise</p>
                    <p className="font-medium text-sm">{selectedLead.company || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Créé le</p>
                    <p className="font-medium text-sm">
                      {format(new Date(selectedLead.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Dernier contact</p>
                    <p className="font-medium text-sm">
                      {selectedLead.last_contacted_at
                        ? formatDistanceToNow(new Date(selectedLead.last_contacted_at), { addSuffix: true, locale: fr })
                        : 'Jamais'}
                    </p>
                  </div>
                </div>

                {/* Message initial */}
                {selectedLead.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message / Notes</p>
                    <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedLead.notes}
                    </div>
                  </div>
                )}

                {/* Edit Status & Notes */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modifier</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent resize-none"
                      placeholder="Notes sur ce lead..."
                    />
                  </div>
                  <button
                    onClick={() => updateLeadMutation.mutate({ id: selectedLead.id, data: editForm })}
                    disabled={updateLeadMutation.isPending}
                    className="w-full py-2 bg-[#EE3B33] text-white rounded-lg text-sm font-semibold hover:bg-[#d63329] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateLeadMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB: Historique ── */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Historique des interactions</p>
                  <span className="text-xs text-gray-400">{(interactions as any[]).length} interaction(s)</span>
                </div>

                {interactionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#EE3B33] mx-auto" />
                  </div>
                ) : (interactions as any[]).length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucune interaction enregistrée</p>
                    <p className="text-xs mt-1">Envoyez un email pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(interactions as any[]).map((interaction: any) => (
                      <div key={interaction.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{INTERACTION_ICONS[interaction.type] || '📌'}</span>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">
                                {interaction.subject || interaction.type}
                              </p>
                              <p className="text-xs text-gray-400">
                                {interaction.direction === 'outbound' ? '↗ Envoyé' : '↙ Reçu'} · {' '}
                                {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true, locale: fr })}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            interaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                            interaction.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {interaction.status === 'completed' ? '✓ Envoyé' :
                             interaction.status === 'failed' ? '✗ Échoué' : interaction.status}
                          </span>
                        </div>
                        {interaction.body && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 whitespace-pre-wrap line-clamp-3">
                            {interaction.body}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Envoyer Email ── */}
            {activeTab === 'email' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <strong>Destinataire :</strong> {selectedLead.first_name} {selectedLead.last_name} &lt;{selectedLead.email}&gt;
                </div>

                {/* Template selector */}
                {(templates as any[]).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Utiliser un modèle (optionnel)
                    </label>
                    <select
                      value={emailForm.templateId}
                      onChange={(e) => applyTemplate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                    >
                      <option value="">— Choisir un modèle —</option>
                      {(templates as any[]).map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                    placeholder="Objet de l'email..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    value={emailForm.body}
                    onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent resize-none"
                    placeholder="Rédigez votre message..."
                  />
                </div>

                <button
                  onClick={() => sendEmailMutation.mutate()}
                  disabled={sendEmailMutation.isPending || !emailForm.subject || !emailForm.body}
                  className="w-full py-3 bg-[#EE3B33] text-white rounded-xl font-semibold text-sm hover:bg-[#d63329] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sendEmailMutation.isPending ? 'Envoi en cours...' : `Envoyer à ${selectedLead.email}`}
                </button>

                {sendEmailMutation.isSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                    ✅ Email envoyé avec succès ! Visible dans l'onglet Historique.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
