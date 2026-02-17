import { useQuery } from '@tanstack/react-query';
import { apiCall } from '../../../lib/supabase';
import { Users, UserCheck, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => apiCall('/admin/stats'),
  });

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => apiCall('/admin/leads'),
  });

  const recentLeads = leads?.slice(0, 5) || [];

  const statCards = [
    {
      icon: Users,
      label: 'Total Leads',
      value: stats?.totalLeads || 0,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Clock,
      label: 'Nouveaux Leads',
      value: stats?.newLeads || 0,
      color: 'bg-[#F79E1B]',
      bgColor: 'bg-orange-50',
    },
    {
      icon: UserCheck,
      label: 'Convertis',
      value: stats?.convertedLeads || 0,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      label: 'Taux de conversion',
      value: `${stats?.conversionRate || 0}%`,
      color: 'bg-[#EE3B33]',
      bgColor: 'bg-red-50',
    },
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{statsLoading ? '...' : card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Derniers Leads</h2>
        </div>
        
        {leadsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE3B33] mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : recentLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun lead pour le moment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Nom</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Profession</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                    </td>
                    <td className="p-4 text-gray-700">{lead.email}</td>
                    <td className="p-4 text-gray-700">{lead.profession}</td>
                    <td className="p-4">{getStatusBadge(lead.status)}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      {format(new Date(lead.created_at), 'dd MMM yyyy', { locale: fr })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!leadsLoading && recentLeads.length > 0 && (
          <div className="p-4 border-t border-gray-100 text-center">
            <a href="/admin/leads" className="text-[#EE3B33] font-medium hover:underline">
              Voir tous les leads →
            </a>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#EE3B33] to-[#F79E1B] rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Gérer les Leads</h3>
          <p className="mb-4 opacity-90">Consultez, modifiez et suivez tous vos prospects</p>
          <a 
            href="/admin/leads" 
            className="inline-block px-6 py-3 bg-white text-[#EE3B33] rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Accéder aux leads
          </a>
        </div>

        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Personnaliser le Site</h3>
          <p className="mb-4 opacity-90">Modifiez les textes et informations de contact</p>
          <a 
            href="/admin/settings" 
            className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Paramètres
          </a>
        </div>
      </div>
    </div>
  );
}