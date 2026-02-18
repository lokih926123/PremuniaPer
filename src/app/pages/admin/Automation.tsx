import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSmtpConfig, updateSmtpConfig } from '../../../lib/supabase-client';
import { toast } from 'sonner';
import { Save, Mail, AlertCircle } from 'lucide-react';

export default function Automation() {
  const queryClient = useQueryClient();
  
  const { data: smtpConfig, isLoading } = useQuery({
    queryKey: ['smtp'],
    queryFn: getSmtpConfig,
  });

  const [formData, setFormData] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    from_email: '',
    from_name: 'Premunia',
  });

  // Update form when config loads
  useEffect(() => {
    if (smtpConfig) {
      setFormData({
        host: smtpConfig.host,
        port: smtpConfig.port,
        username: smtpConfig.username,
        password: smtpConfig.password,
        from_email: smtpConfig.from_email,
        from_name: smtpConfig.from_name,
      });
    }
  }, [smtpConfig]);

  const updateSmtpMutation = useMutation({
    mutationFn: updateSmtpConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp'] });
      toast.success('Configuration SMTP enregistrée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSmtpMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE3B33] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Automatisation Email</h1>
        <p className="text-gray-600 mt-1">Configurez votre serveur SMTP pour l'envoi d'emails</p>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Configuration SMTP requise</h3>
            <p className="text-yellow-800 text-sm mb-3">
              Pour envoyer des emails automatiques, vous devez configurer un serveur SMTP. 
              Cette fonctionnalité est préparée pour une implémentation future.
            </p>
            <div className="text-sm text-yellow-800">
              <strong>Cas d'usage futurs :</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Notification automatique lors d'un nouveau lead</li>
                <li>Email de confirmation au prospect</li>
                <li>Relances automatiques</li>
                <li>Newsletters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SMTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#EE3B33]" />
            Configuration SMTP
          </h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serveur SMTP
                </label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port
                </label>
                <input
                  type="text"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                  placeholder="587"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur (email)
              </label>
              <input
                type="email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="votre-email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="mt-1 text-sm text-gray-500">
                Pour Gmail, utilisez un mot de passe d'application (pas votre mot de passe principal)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email expéditeur
                </label>
                <input
                  type="email"
                  value={formData.from_email}
                  onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                  placeholder="contact@premunia.fr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom expéditeur
                </label>
                <input
                  type="text"
                  value={formData.from_name}
                  onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                  placeholder="Premunia"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Exemples de configuration</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Gmail</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Serveur:</strong> smtp.gmail.com</div>
                <div><strong>Port:</strong> 587</div>
                <div><strong>Note:</strong> Créez un mot de passe d'application dans votre compte Google</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Outlook / Office 365</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Serveur:</strong> smtp.office365.com</div>
                <div><strong>Port:</strong> 587</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">SendGrid</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Serveur:</strong> smtp.sendgrid.net</div>
                <div><strong>Port:</strong> 587</div>
                <div><strong>Utilisateur:</strong> apikey</div>
                <div><strong>Mot de passe:</strong> Votre clé API SendGrid</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateSmtpMutation.isPending}
            className="px-8 py-3 bg-[#EE3B33] text-white rounded-lg hover:bg-[#d63329] transition font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {updateSmtpMutation.isPending ? 'Enregistrement...' : 'Enregistrer la configuration'}
          </button>
        </div>
      </form>

      {/* Security Note */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="font-semibold text-red-900 mb-2">🔒 Sécurité</h3>
        <p className="text-red-800 text-sm">
          Votre mot de passe SMTP est stocké de manière sécurisée côté serveur via Supabase Row Level Security. 
          Utilisez toujours des mots de passe d'application dédiés, jamais vos mots de passe principaux.
        </p>
      </div>
    </div>
  );
}
