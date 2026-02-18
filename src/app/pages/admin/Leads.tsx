import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeads, updateLead, deleteLead } from '../../../lib/supabase-client';
import { toast } from 'sonner';
import { Search, Edit, Trash2, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export default function Leads() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingLead, setEditingLead] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    notes: '',
  });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Lead mis à jour avec succès');
      setEditingLead(null);
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Lead supprimé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setEditForm({
      status: lead.status,
      notes: lead.notes || '',
    });
  };

  const handleSave = () => {
    if (editingLead) {
      updateLeadMutation.mutate({
        id: editingLead.id,
        data: editForm,
      });
    }
  };

  const handleDelete = (lead: any) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le lead de ${lead.first_name} ${lead.last_name} ?`)) {
      deleteLeadMutation.mutate(lead.id);
    }
  };

  const filteredLeads = leads?.filter((lead: any) => {
    const matchesSearch = 
      lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.profession.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    const badges = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      converted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    
    const labels = {
      new: 'Nouveau',
      contacted: 'Contacté',
      converted: 'Converti',
      rejected: 'Rejeté',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Leads</h1>
        <p className="text-gray-600 mt-1">Gérez tous vos prospects en un seul endroit</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, email, profession..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="new">Nouveaux</option>
              <option value="contacted">Contactés</option>
              <option value="converted">Convertis</option>
              <option value="rejected">Rejetés</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span>{filteredLeads.length} lead(s) trouvé(s)</span>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE3B33] mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aucun lead ne correspond à vos critères de recherche' 
              : 'Aucun lead pour le moment'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Profession</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Message</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                    </td>
                    <td className="p-4 text-gray-700">{lead.profession}</td>
                    <td className="p-4">{getStatusBadge(lead.status)}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </td>
                    <td className="p-4 text-gray-600 text-sm max-w-xs truncate">
                      {lead.message || '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

      {/* Edit Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Modifier le lead : {editingLead.first_name} {editingLead.last_name}
              </h2>
              <button
                onClick={() => setEditingLead(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Read-only info */}
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">{editingLead.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Téléphone</div>
                  <div className="font-medium">{editingLead.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Profession</div>
                  <div className="font-medium">{editingLead.profession}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Date de création</div>
                  <div className="font-medium">
                    {format(new Date(editingLead.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </div>
                </div>
              </div>

              {editingLead.message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message initial</label>
                  <div className="p-4 bg-gray-50 rounded-lg text-gray-700">
                    {editingLead.message}
                  </div>
                </div>
              )}

              {/* Editable fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                >
                  <option value="new">Nouveau</option>
                  <option value="contacted">Contacté</option>
                  <option value="converted">Converti</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes internes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                  placeholder="Ajoutez des notes sur ce lead..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingLead(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={updateLeadMutation.isPending}
                className="px-6 py-2 bg-[#EE3B33] text-white rounded-lg hover:bg-[#d63329] transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {updateLeadMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
