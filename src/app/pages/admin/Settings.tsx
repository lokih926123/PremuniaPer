import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSiteSettings, updateSiteSettings, getSmtpConfig, updateSmtpConfig } from '../../../lib/supabase-client';
import { toast } from 'sonner';
import { Save, RefreshCw, Mail, Lock } from 'lucide-react';

export default function Settings() {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSiteSettings,
  });

  const { data: smtpConfig, isLoading: smtpLoading } = useQuery({
    queryKey: ['smtpConfig'],
    queryFn: getSmtpConfig,
  });

  const [siteFormData, setSiteFormData] = useState({
    hero_title: '',
    hero_subtitle: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
  });

  const [smtpFormData, setSmtpFormData] = useState({
    host: 'mail.premunia.fr',
    port: '465',
    username: 'per.mia@premunia.fr',
    password: 'Sb*%3_D-FM}Kt4b{',
    from_email: 'per.mia@premunia.fr',
    from_name: 'Premunia',
  });

  // Update site form when settings load
  useEffect(() => {
    if (settings) {
      setSiteFormData({
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        contact_address: settings.contact_address,
      });
    }
  }, [settings]);

  // Update SMTP form when config loads
  useEffect(() => {
    if (smtpConfig) {
      setSmtpFormData({
        host: smtpConfig.host || '',
        port: smtpConfig.port || '587',
        username: smtpConfig.username || '',
        password: smtpConfig.password || '',
        from_email: smtpConfig.from_email || '',
        from_name: smtpConfig.from_name || 'Premunia',
      });
    }
  }, [smtpConfig]);

  const updateSettingsMutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Paramètres du site mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const updateSmtpMutation = useMutation({
    mutationFn: updateSmtpConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtpConfig'] });
      toast.success('Configuration SMTP enregistrée avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur SMTP : ${error.message}`);
    },
  });

  const handleSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(siteFormData);
  };

  const handleSmtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert port to string if needed
    const configData = {
      ...smtpFormData,
      port: String(smtpFormData.port),
    };
    updateSmtpMutation.mutate(configData);
  };

  const handleSiteReset = () => {
    if (settings) {
      setSiteFormData({
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        contact_address: settings.contact_address,
      });
      toast.info('Formulaire réinitialisé');
    }
  };

  const handleSmtpReset = () => {
    if (smtpConfig) {
      setSmtpFormData({
        host: smtpConfig.host || '',
        port: smtpConfig.port || '587',
        username: smtpConfig.username || '',
        password: smtpConfig.password || '',
        from_email: smtpConfig.from_email || '',
        from_name: smtpConfig.from_name || 'Premunia',
      });
      toast.info('Formulaire SMTP réinitialisé');
    }
  };

  const isLoading = settingsLoading || smtpLoading;

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
        <h1 className="text-3xl font-bold text-gray-900">Paramètres Administrateur</h1>
        <p className="text-gray-600 mt-1">Gérez vos paramètres de site et de messagerie électronique</p>
      </div>

      {/* ========== SITE SETTINGS SECTION ========== */}
      <form onSubmit={handleSiteSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Paramètres du Site</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre principal
              </label>
              <input
                type="text"
                value={siteFormData.hero_title}
                onChange={(e) => setSiteFormData({ ...siteFormData, hero_title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="Optimisez votre retraite avec le PER Premunia"
              />
              <p className="mt-1 text-sm text-gray-500">
                Le titre principal affiché en haut de la page d'accueil
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-titre
              </label>
              <textarea
                rows={3}
                value={siteFormData.hero_subtitle}
                onChange={(e) => setSiteFormData({ ...siteFormData, hero_subtitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="Solution d'épargne retraite sur-mesure pour les professions libérales..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Description affichée sous le titre principal
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Informations de Contact</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de contact
              </label>
              <input
                type="email"
                value={siteFormData.contact_email}
                onChange={(e) => setSiteFormData({ ...siteFormData, contact_email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="contact@premunia.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={siteFormData.contact_phone}
                onChange={(e) => setSiteFormData({ ...siteFormData, contact_phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="01 XX XX XX XX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={siteFormData.contact_address}
                onChange={(e) => setSiteFormData({ ...siteFormData, contact_address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="123 Avenue des Champs-Élysées, 75008 Paris"
              />
            </div>
          </div>
        </div>

        {/* Site Settings Actions */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleSiteReset}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réinitialiser
          </button>

          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="px-8 py-3 bg-[#EE3B33] text-white rounded-lg hover:bg-[#d63329] transition font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {updateSettingsMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* ========== SMTP CONFIGURATION SECTION ========== */}
      <form onSubmit={handleSmtpSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-6 h-6 text-[#EE3B33]" />
            <h2 className="text-xl font-bold text-gray-900">Configuration SMTP</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Configurez vos paramètres de serveur de courrier électronique pour activer l'envoi d'emails
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serveur SMTP (Host)
              </label>
              <input
                type="text"
                value={smtpFormData.host}
                onChange={(e) => setSmtpFormData({ ...smtpFormData, host: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="mail.premunia.fr"
              />
              <p className="mt-1 text-sm text-gray-500">Exemple: mail.example.com</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port
              </label>
              <input
                type="number"
                value={smtpFormData.port}
                onChange={(e) => setSmtpFormData({ ...smtpFormData, port: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="587"
              />
              <p className="mt-1 text-sm text-gray-500">Généralement: 587 (TLS), 465 (SSL), 25 (non sécurisé)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={smtpFormData.username}
                onChange={(e) => setSmtpFormData({ ...smtpFormData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="per.mia@premunia.fr"
              />
              <p className="mt-1 text-sm text-gray-500">Email ou identifiant de connexion SMTP</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={smtpFormData.password}
                  onChange={(e) => setSmtpFormData({ ...smtpFormData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-4 top-3.5 w-4 h-4 text-gray-400" />
              </div>
              <p className="mt-1 text-sm text-gray-500">Mot de passe SMTP sécurisé</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email d'envoi
              </label>
              <input
                type="email"
                value={smtpFormData.from_email}
                onChange={(e) => setSmtpFormData({ ...smtpFormData, from_email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="contact@premunia.fr"
              />
              <p className="mt-1 text-sm text-gray-500">Adresse email utilisée comme expéditeur</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'expéditeur
              </label>
              <input
                type="text"
                value={smtpFormData.from_name}
                onChange={(e) => setSmtpFormData({ ...smtpFormData, from_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="Premunia"
              />
              <p className="mt-1 text-sm text-gray-500">Nom affiché comme expéditeur dans les emails</p>
            </div>
          </div>
        </div>

        {/* SMTP Actions */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleSmtpReset}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réinitialiser
          </button>

          <button
            type="submit"
            disabled={updateSmtpMutation.isPending}
            className="px-8 py-3 bg-[#EE3B33] text-white rounded-lg hover:bg-[#d63329] transition font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {updateSmtpMutation.isPending ? 'Enregistrement...' : 'Enregistrer la configuration SMTP'}
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
        <p className="text-blue-800 text-sm">
          Une fois la configuration SMTP enregistrée, vous pourrez tester la connexion et envoyer des emails via le module d'Automatisation.
        </p>
      </div>
    </div>
  );
}
