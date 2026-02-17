import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { supabase, apiCall } from '../../lib/supabase';
import { Shield, AlertTriangle } from 'lucide-react';

export default function PromoteAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/signin');
      return;
    }
    setUser(session.user);
  };

  const handlePromote = async () => {
    setLoading(true);
    try {
      await apiCall('/auth/promote-admin', {
        method: 'POST',
      });

      toast.success('Vous êtes maintenant administrateur !');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    navigate('/signin');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE3B33] mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#EE3B33] to-[#F79E1B] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">Premunia</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration initiale</h1>
          <p className="text-gray-600">Devenez administrateur du système</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <strong>SÉCURITÉ :</strong> Cette page doit être supprimée après la première utilisation !
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Connecté en tant que :</div>
              <div className="font-semibold text-gray-900">{user.email}</div>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Cliquez sur le bouton ci-dessous pour vous accorder les droits d'administrateur. 
            Vous pourrez ensuite accéder au dashboard et gérer les leads.
          </p>

          <button
            onClick={handlePromote}
            disabled={loading}
            className="w-full px-6 py-3 bg-[#EE3B33] text-white rounded-lg hover:bg-[#d63329] transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mb-4"
          >
            {loading ? (
              'Promotion en cours...'
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Me promouvoir en Admin
              </>
            )}
          </button>

          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800 space-y-2">
              <p className="font-semibold">⚠️ Instructions de sécurité :</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Cliquez sur "Me promouvoir en Admin"</li>
                <li>Supprimez le fichier <code className="bg-red-100 px-1 rounded">/src/app/pages/PromoteAdmin.tsx</code></li>
                <li>Retirez la route dans <code className="bg-red-100 px-1 rounded">/src/app/routes.tsx</code></li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={handleSignIn}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ← Déjà admin ? Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
