import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProspectaLogo } from '../../components/common/ProspectaLogo';
import { icpApi } from '../../api/icp';
import { useToast } from '../../app/providers/ToastProvider';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Objective (CDC § 5.1)
  const [selectedObjective, setSelectedObjective] = useState('trouver de nouveaux clients');

  // Step 2: Target Criteria (CDC § 5.2)
  const [targetCountry, setTargetCountry] = useState('Sénégal');
  const [targetCity, setTargetCity] = useState('Dakar');
  const [targetIndustry, setTargetIndustry] = useState('Technologies & Logiciels');
  const [targetSize, setTargetSize] = useState('10-200');

  // Step 3: ICP Profile details (CDC § 5.3)
  const [icpName, setIcpName] = useState('Entreprises technologiques Sénégal');
  const [selectedTitles, setSelectedTitles] = useState<string[]>([
    'CEO',
    'Founder',
    'Directeur Général',
    'Directeur Commercial',
  ]);

  const availableTitles = [
    'CEO',
    'Founder',
    'Directeur Général',
    'Directeur Commercial',
    'Responsable Ventes',
    'CTO',
    'Directeur Financier / CFO',
    'DRH',
  ];

  const objectives = [
    { id: 'clients', label: 'Trouver de nouveaux clients B2B', desc: 'Acquisition directe et prospection sortante' },
    { id: 'rdv', label: 'Générer des rendez-vous qualifiés', desc: 'Démonstrations et rendez-vous commerciaux' },
    { id: 'marche', label: 'Développer un nouveau marché', desc: 'Expansion géographique en Afrique de l’Ouest' },
    { id: 'partenaires', label: 'Trouver des partenaires', desc: 'Distributeurs, revendeurs, intégrateurs' },
    { id: 'export', label: "Développer l'export", desc: 'Clients régionaux UEMOA et internationaux' },
  ];

  const toggleTitle = (title: string) => {
    setSelectedTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const saveIcpMutation = useMutation({
    mutationFn: () => {
      const minEmp = targetSize.includes('-') ? parseInt(targetSize.split('-')[0]) : 10;
      const maxEmp = targetSize.includes('-') ? parseInt(targetSize.split('-')[1]) : 200;
      return icpApi.createIcp({
        name: icpName.trim(),
        description: `ICP ciblant ${targetIndustry} à ${targetCity}, ${targetCountry}`,
        targetCountries: targetCountry,
        targetCities: targetCity,
        targetIndustries: targetIndustry,
        minEmployees: minEmp,
        maxEmployees: maxEmp,
        targetJobTitles: selectedTitles.join(', '),
        keywords: `${targetIndustry}, ${selectedObjective}`,
      });
    },
    onSuccess: () => {
      showToast('Profil Client Idéal (ICP) enregistré avec succès.', 'success');
      setStep(4);
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'enregistrement", 'error');
      // Still allow proceeding in offline/demo mode
      setStep(4);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
        <ProspectaLogo size="md" />
        <div className="text-xs font-semibold text-gray-500">
          Étape {step} sur 3
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl w-full mx-auto my-8 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
        {step === 1 && (
          /* Step 1: Présentation (CDC § 5.1) */
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Étape 1 — Objectif
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                Que souhaitez-vous développer en priorité ?
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Prospecta adaptera vos recommandations de prospection et vos modèles de messages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {objectives.map((obj) => {
                const isSelected = selectedObjective === obj.label;
                return (
                  <div
                    key={obj.id}
                    onClick={() => setSelectedObjective(obj.label)}
                    className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <h3 className="text-xs font-bold text-gray-900">{obj.label}</h3>
                    <p className="text-[11px] text-gray-500 mt-1">{obj.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                size="sm"
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Continuer vers la cible
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          /* Step 2: Cible (CDC § 5.2) */
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Étape 2 — Marché & Cible
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                Qui voulez-vous contacter ?
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Définissez la zone géographique et les secteurs d'activité de vos futurs clients.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pays prioritaire
                </label>
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="Sénégal">Sénégal</option>
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                  <option value="Maroc">Maroc</option>
                  <option value="Cameroun">Cameroun</option>
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ville principale
                </label>
                <input
                  type="text"
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  placeholder="ex: Dakar, Abidjan..."
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Secteur d'activité
                </label>
                <select
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="Technologies & Logiciels">Technologies & Logiciels</option>
                  <option value="Fintech & Mobile Money">Fintech & Mobile Money</option>
                  <option value="Télécommunications">Télécommunications</option>
                  <option value="Transport & Logistique">Transport & Logistique</option>
                  <option value="Hôtellerie & Tourisme">Hôtellerie & Tourisme</option>
                  <option value="Commerce & Distribution">Commerce & Distribution</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Taille de l'entreprise (salariés)
                </label>
                <select
                  value={targetSize}
                  onChange={(e) => setTargetSize(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="1-10">1–10 employés (TPE)</option>
                  <option value="10-200">10–200 employés (PME - Recommandé)</option>
                  <option value="200-500">200–500 employés (Moyenne)</option>
                  <option value="500-5000">500+ employés (Grand Compte)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep(1)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Retour
              </Button>
              <Button
                size="sm"
                onClick={() => setStep(3)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Créer mon ICP
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          /* Step 3: ICP (CDC § 5.3) */
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Étape 3 — Profil Client Idéal (ICP)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                Configurez votre premier profil ICP
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                L'algorithme de scoring utilisera ces critères pour noter vos prospects de 0 à 100.
              </p>
            </div>

            <Input
              label="Nom de ce profil ICP"
              value={icpName}
              onChange={(e) => setIcpName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Titres & Fonctions des décideurs cibles
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTitles.map((title) => {
                  const isSelected = selectedTitles.includes(title);
                  return (
                    <button
                      key={title}
                      type="button"
                      onClick={() => toggleTitle(title)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {title} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ICP Summary Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-xs text-gray-600 space-y-1">
              <div className="font-bold text-gray-900">Résumé des critères :</div>
              <div>• Zone géographique : {targetCity}, {targetCountry}</div>
              <div>• Secteur cible : {targetIndustry}</div>
              <div>• Effectif entreprise : {targetSize} employés</div>
              <div>• Décideurs cibles : {selectedTitles.join(', ')}</div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep(2)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Retour
              </Button>
              <Button
                size="sm"
                isLoading={saveIcpMutation.isPending}
                onClick={() => saveIcpMutation.mutate()}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Activer et sauvegarder mon ICP
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          /* Step 4: Success & Next Actions */
          <div className="text-center py-6 space-y-5 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Votre ICP est activé avec succès !
              </h2>
              <p className="text-xs text-gray-600 max-w-md mx-auto mt-2">
                Prospecta est prêt à rechercher des entreprises et des décideurs correspondant exactement à votre cible à {targetCity}.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="sm"
                onClick={() => navigate('/app/discovery')}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Lancer la recherche de prospects
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/app')}
              >
                Aller au tableau de bord
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-gray-400">
        Prospecta — Plateforme africaine de prospection commerciale B2B
      </div>
    </div>
  );
};
