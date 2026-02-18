import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSiteSettings, updateSiteSettings } from '../../../lib/supabase-client';
import { toast } from 'sonner';
import { Save, RefreshCw } from 'lucide-react';

export default function Settings() {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSiteSettings,
  });

  const [formData, setFormData] = useState({
    hero_title: '',
    hero_subtitle: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        contact_address: settings.contact_address,
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Paramètres mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        contact_address: settings.contact_address,
      });
      toast.info('Formulaire réinitialisé');
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Paramètres du Site</h1>
        <p className="text-gray-600 mt-1">Personnalisez les textes de votre landing page</p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Section Hero</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre principal
              </label>
              <input
                type="text"
                value={formData.hero_title}
                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
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
                value={formData.hero_subtitle}
                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
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
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
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
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
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
                value={formData.contact_address}
                onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                placeholder="123 Avenue des Champs-Élysées, 75008 Paris"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Aperçu</h2>
          
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {formData.hero_title || 'Titre principal'}
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              {formData.hero_subtitle || 'Sous-titre / Description'}
            </p>
            
            <div className="border-t border-gray-200 pt-6 mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-semibold">Email:</span>
                <span>{formData.contact_email || 'contact@example.com'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-semibold">Téléphone:</span>
                <span>{formData.contact_phone || '01 XX XX XX XX'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-semibold">Adresse:</span>
                <span>{formData.contact_address || 'Adresse complète'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleReset}
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

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Information</h3>
        <p className="text-blue-800 text-sm">
          Les modifications seront visibles immédiatement sur la page d'accueil. 
          Les visiteurs verront les nouveaux textes lors de leur prochaine visite.
        </p>
      </div>
    </div>
  );
}
