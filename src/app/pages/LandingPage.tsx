import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowRight, Shield, TrendingUp, Users, ChevronRight, Mail, Phone, MapPin, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../../lib/supabase';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profession: '',
    message: '',
  });

  const [income, setIncome] = useState(80000);

  // Fetch site settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/settings`);
      const data = await response.json();
      return data.data;
    },
  });

  // Create lead mutation
  const createLead = useMutation({
    mutationFn: async (leadData: typeof formData) => {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Demande envoyée avec succès ! Nous vous contacterons rapidement.');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        profession: '',
        message: '',
      });
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLead.mutate(formData);
  };

  // Tax savings calculation
  const taxRate = income > 70000 ? 0.41 : income > 50000 ? 0.30 : 0.11;
  const contribution = Math.min(income * 0.10, 32909); // 10% of income, max deductible amount
  const taxSavings = contribution * taxRate;

  const chartData = [
    { name: '0%', savings: 0 },
    { name: '5%', savings: (income * 0.05 * taxRate) },
    { name: '10%', savings: (income * 0.10 * taxRate) },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#EE3B33] to-[#F79E1B] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Premunia</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#avantages" className="text-gray-600 hover:text-[#EE3B33] transition">Avantages</a>
              <a href="#simulation" className="text-gray-600 hover:text-[#EE3B33] transition">Simulation</a>
              <a href="#contact" className="text-gray-600 hover:text-[#EE3B33] transition">Contact</a>
              <a href="/signin" className="px-4 py-2 bg-[#EE3B33] text-white rounded-lg hover:bg-[#d63329] transition">
                Connexion
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {settings?.hero_title || 'Optimisez votre retraite avec le PER Premunia'}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {settings?.hero_subtitle || 'Solution d\'épargne retraite sur-mesure pour les professions libérales. Réduisez vos impôts tout en préparant votre avenir.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#contact" 
                  className="px-8 py-4 bg-[#EE3B33] text-white rounded-lg hover:bg-[#d63329] transition flex items-center justify-center gap-2 text-lg font-semibold"
                >
                  Demander un devis
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a 
                  href="#simulation" 
                  className="px-8 py-4 border-2 border-[#EE3B33] text-[#EE3B33] rounded-lg hover:bg-[#EE3B33] hover:text-white transition flex items-center justify-center gap-2 text-lg font-semibold"
                >
                  Calculer mes économies
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#EE3B33] to-[#F79E1B] rounded-2xl p-8 text-white shadow-2xl">
                <div className="mb-6">
                  <div className="text-sm uppercase tracking-wider mb-2">Économie d'impôt estimée</div>
                  <div className="text-5xl font-bold mb-2">{Math.round(taxSavings).toLocaleString('fr-FR')} €</div>
                  <div className="text-sm opacity-90">par an avec un versement de {Math.round(contribution).toLocaleString('fr-FR')} €</div>
                </div>
                <div className="border-t border-white/20 pt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>Déduction fiscale jusqu'à 41%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>Gestion pilotée personnalisée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>Sortie en capital ou rente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages Section */}
      <section id="avantages" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pourquoi choisir Premunia ?</h2>
            <p className="text-xl text-gray-600">Une solution pensée pour les professions libérales</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100">
              <div className="w-14 h-14 bg-[#EE3B33]/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-[#EE3B33]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sécurité maximale</h3>
              <p className="text-gray-600 mb-4">
                Votre épargne est protégée et garantie par les plus grandes compagnies d'assurance françaises.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-[#F79E1B] mt-0.5 flex-shrink-0" />
                  <span>Fonds euro garantis</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-[#F79E1B] mt-0.5 flex-shrink-0" />
                  <span>Protection contre les créanciers</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100">
              <div className="w-14 h-14 bg-[#F79E1B]/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-[#F79E1B]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Performance optimisée</h3>
              <p className="text-gray-600 mb-4">
                Gestion active de votre portefeuille pour maximiser vos rendements selon votre profil.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-[#EE3B33] mt-0.5 flex-shrink-0" />
                  <span>Diversification multi-supports</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-[#EE3B33] mt-0.5 flex-shrink-0" />
                  <span>Arbitrages automatiques</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100">
              <div className="w-14 h-14 bg-[#E91E63]/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-[#E91E63]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Accompagnement expert</h3>
              <p className="text-gray-600 mb-4">
                Un conseiller dédié qui comprend les enjeux spécifiques de votre profession.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-[#880E4F] mt-0.5 flex-shrink-0" />
                  <span>Conseiller personnel</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-5 h-5 text-[#880E4F] mt-0.5 flex-shrink-0" />
                  <span>Disponible 6j/7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cibles Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Spécialement conçu pour vous</h2>
            <p className="text-xl text-gray-600">Professions libérales et indépendants</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Médecins', 'Avocats', 'Architectes', 'Experts-comptables', 'Notaires', 'Pharmaciens', 'Dentistes', 'Consultants'].map((profession) => (
              <div key={profession} className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-[#EE3B33] transition text-center">
                <div className="font-semibold text-gray-900">{profession}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulation Section */}
      <section id="simulation" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simulez vos économies d'impôt</h2>
            <p className="text-xl text-gray-600">Découvrez combien vous pourriez économiser</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100">
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Votre revenu annuel : {income.toLocaleString('fr-FR')} €
                </label>
                <input
                  type="range"
                  min="30000"
                  max="200000"
                  step="5000"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EE3B33]"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>30 000 €</span>
                  <span>200 000 €</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Versement recommandé (10% du revenu)</div>
                  <div className="text-3xl font-bold text-[#EE3B33]">{Math.round(contribution).toLocaleString('fr-FR')} €</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Économie d'impôt estimée</div>
                  <div className="text-3xl font-bold text-[#F79E1B]">{Math.round(taxSavings).toLocaleString('fr-FR')} €</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Impact du taux d'épargne</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `${Math.round(value).toLocaleString('fr-FR')} €`}
                      labelFormatter={(label) => `Versement : ${label} du revenu`}
                    />
                    <Bar dataKey="savings" fill="#EE3B33" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 p-4 bg-[#EE3B33]/5 border-l-4 border-[#EE3B33] rounded">
                <p className="text-sm text-gray-700">
                  <strong>Exemple :</strong> Avec un revenu de {income.toLocaleString('fr-FR')} € et un versement de {Math.round(contribution).toLocaleString('fr-FR')} €, 
                  votre coût réel après déduction fiscale serait de seulement {Math.round(contribution - taxSavings).toLocaleString('fr-FR')} €.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Demandez votre étude personnalisée</h2>
              <p className="text-xl text-gray-600">Un expert vous rappelle sous 24h</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profession *</label>
                    <select
                      required
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="Médecin">Médecin</option>
                      <option value="Avocat">Avocat</option>
                      <option value="Architecte">Architecte</option>
                      <option value="Expert-comptable">Expert-comptable</option>
                      <option value="Notaire">Notaire</option>
                      <option value="Pharmacien">Pharmacien</option>
                      <option value="Dentiste">Dentiste</option>
                      <option value="Consultant">Consultant</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message (optionnel)</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE3B33] focus:border-transparent"
                      placeholder="Dites-nous en plus sur votre projet..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={createLead.isPending}
                    className="w-full px-6 py-4 bg-[#EE3B33] text-white rounded-lg hover:bg-[#d63329] transition font-semibold text-lg disabled:opacity-50"
                  >
                    {createLead.isPending ? 'Envoi en cours...' : 'Demander mon étude gratuite'}
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#EE3B33] to-[#F79E1B] p-8 rounded-2xl text-white">
                  <h3 className="text-2xl font-bold mb-6">Nos coordonnées</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm opacity-90">Email</div>
                        <div className="font-semibold">{settings?.contact_email || 'contact@premunia.fr'}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm opacity-90">Téléphone</div>
                        <div className="font-semibold">{settings?.contact_phone || '01 XX XX XX XX'}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm opacity-90">Adresse</div>
                        <div className="font-semibold">{settings?.contact_address || '123 Avenue des Champs-Élysées, 75008 Paris'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-100">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Horaires d'ouverture</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Lundi - Vendredi</span>
                      <span className="font-semibold">9h - 19h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi</span>
                      <span className="font-semibold">9h - 13h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche</span>
                      <span className="font-semibold">Fermé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#EE3B33] to-[#F79E1B] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-2xl font-bold">Premunia</span>
              </div>
              <p className="text-gray-400">
                Votre partenaire épargne retraite pour professions libérales
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Liens rapides</h4>
              <div className="space-y-2 text-gray-400">
                <div><a href="#avantages" className="hover:text-white transition">Avantages</a></div>
                <div><a href="#simulation" className="hover:text-white transition">Simulation</a></div>
                <div><a href="#contact" className="hover:text-white transition">Contact</a></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Informations légales</h4>
              <div className="space-y-2 text-gray-400">
                <div>Mentions légales</div>
                <div>Politique de confidentialité</div>
                <div>CGU</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Premunia. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
