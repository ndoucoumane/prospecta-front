import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Bot,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { prospectsApi, campaignsApi, aiApi } from '../../../api';
import { useToast } from '../../../app/providers/ToastProvider';
import type { Channel, CampaignStep } from '../../../types';

export const CampaignBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Info
  const [name, setName] = useState('Hôtels Dakar — Événements Corporate');
  const [objective, setObjective] = useState('Obtenir des rendez-vous de démonstration');
  const [icp, setIcp] = useState('Hôtels 3 à 5 étoiles et résidences hôtelières à Dakar');

  // Step 2: Audience (Prospects selected)
  const [selectedProspectIds, setSelectedProspectIds] = useState<string[]>([]);

  // Step 3: Séquence configuration
  const [steps, setSteps] = useState<CampaignStep[]>([
    {
      stepNumber: 1,
      channel: 'email',
      delayDays: 0,
      subject: 'Développement de vos réservations d\'affaires — {{companyName}}',
      content: 'Bonjour {{firstName}},\n\nJ\'ai remarqué l\'activité de {{companyName}} sur le marché hôtelier à {{city}}.\n\nNous aidons les directeurs commerciaux à centraliser leurs prospects et à doubler le taux de réponse de leurs approches d\'entreprises partenaires.\n\nSeriez-vous ouvert à un rapide échange de 15 minutes ce jeudi ?\n\nBien à vous,\nMor Keblink',
    },
    {
      stepNumber: 2,
      channel: 'whatsapp',
      delayDays: 2,
      content: 'Bonjour {{firstName}}, c\'est Mor de Prospecta. Je fais suite à mon email concernant la prospection commerciale de {{companyName}}. Avez-vous eu l\'occasion de le consulter ? Bien cordialement.',
    },
    {
      stepNumber: 3,
      channel: 'email',
      delayDays: 4,
      subject: 'Relance suite à mon message — {{firstName}}',
      content: 'Bonjour {{firstName}},\n\nJe me permets une brève relance pour savoir si l\'optimisation de vos réservations corporate est un sujet d\'actualité pour {{companyName}} ce trimestre.\n\nRestant à votre entière disposition,\nMor Keblink',
    },
  ]);

  // Step 4: Active message being edited
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [aiGeneratedPreview, setAiGeneratedPreview] = useState<{
    subject?: string;
    content: string;
  } | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Fetch prospects for audience selection
  const { data: prospects } = useQuery({
    queryKey: ['prospects-all'],
    queryFn: () => prospectsApi.getProspects(),
  });

  // Select all prospects initially when loaded
  React.useEffect(() => {
    if (prospects && prospects.length > 0 && selectedProspectIds.length === 0) {
      setSelectedProspectIds(prospects.map((p) => p.id));
    }
  }, [prospects, selectedProspectIds.length]);

  const stepsMeta = [
    { number: 1, label: 'Informations' },
    { number: 2, label: 'Audience' },
    { number: 3, label: 'Séquence' },
    { number: 4, label: 'Messages' },
    { number: 5, label: 'Vérification' },
    { number: 6, label: 'Lancement' },
  ];

  // 39. Insert Variable helper
  const insertVariable = (variable: string) => {
    const current = steps[activeStepIdx];
    const newContent = `${current.content} {{${variable}}}`;
    const updated = [...steps];
    updated[activeStepIdx] = { ...current, content: newContent };
    setSteps(updated);
  };

  // 40. AI Generation handler
  const handleGenerateWithAI = async () => {
    setIsGeneratingAI(true);
    try {
      const active = steps[activeStepIdx];
      const result = await aiApi.generateCampaignMessage({
        channel: active.channel,
        objective,
        icp,
        stepNumber: active.stepNumber,
      });
      setAiGeneratedPreview(result);
      showToast('Nouveau message proposé par l\'IA.');
    } catch {
      showToast('Erreur lors de la génération.', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyAIGenerated = () => {
    if (!aiGeneratedPreview) return;
    const current = steps[activeStepIdx];
    const updated = [...steps];
    updated[activeStepIdx] = {
      ...current,
      subject: aiGeneratedPreview.subject || current.subject,
      content: aiGeneratedPreview.content,
    };
    setSteps(updated);
    setAiGeneratedPreview(null);
    showToast('Message appliqué à l\'étape.');
  };

  // Step 6: Launch
  const handleLaunchCampaign = async () => {
    try {
      const distinctChannels = Array.from(new Set(steps.map((s) => s.channel))) as Channel[];
      await campaignsApi.createCampaign({
        name,
        objective,
        icp,
        channels: distinctChannels,
        totalProspects: selectedProspectIds.length,
        steps,
        status: 'active',
      });
      showToast('Campagne lancée avec succès.');
      navigate('/app/campaigns');
    } catch {
      showToast('Erreur lors du lancement de la campagne.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          to="/app/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour aux campagnes</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Créer une nouvelle campagne
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configurez votre séquence de prospection étape par étape.
          </p>
        </div>
      </div>

      {/* 37. Indicateur de progression simple (Pas de stepper flashy) */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="grid grid-cols-6 gap-2">
          {stepsMeta.map((s) => (
            <div
              key={s.number}
              className={`text-center py-1.5 px-1 border-b-2 transition-colors ${
                currentStep === s.number
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : currentStep > s.number
                  ? 'border-green-600 text-gray-700'
                  : 'border-transparent text-gray-400'
              }`}
            >
              <span className="text-[11px] block font-mono">Étape {s.number}</span>
              <span className="text-xs truncate hidden sm:block">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Content Containers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Étape 1 : Informations */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                1. Informations sur la campagne
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Définissez les objectifs commerciaux et le profil client ciblé (ICP).
              </p>
            </div>

            <Input
              label="Nom de la campagne"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Hôtels Dakar"
              required
            />

            <Input
              label="Objectif commercial"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="ex: Obtenir des rendez-vous de démonstration"
              required
            />

            <Input
              label="Profil client idéal (ICP)"
              value={icp}
              onChange={(e) => setIcp(e.target.value)}
              placeholder="ex: Hôtels 3 à 5 étoiles à Dakar et Saly"
              required
            />
          </div>
        )}

        {/* Étape 2 : Audience */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  2. Sélection de l'audience
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choisissez les prospects à inclure dans cette séquence ({selectedProspectIds.length} sélectionnés).
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (selectedProspectIds.length === (prospects?.length || 0)) {
                    setSelectedProspectIds([]);
                  } else {
                    setSelectedProspectIds((prospects || []).map((p) => p.id));
                  }
                }}
              >
                {selectedProspectIds.length === (prospects?.length || 0)
                  ? 'Tout désélectionner'
                  : 'Tout sélectionner'}
              </Button>
            </div>

            <div className="border border-gray-200 rounded-md divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {prospects?.map((p) => {
                const isSelected = selectedProspectIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedProspectIds(selectedProspectIds.filter((id) => id !== p.id));
                      } else {
                        setSelectedProspectIds([...selectedProspectIds, p.id]);
                      }
                    }}
                    className={`p-3 flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                      />
                      <div>
                        <span className="font-semibold text-gray-900">
                          {p.firstName} {p.lastName}
                        </span>
                        <span className="text-gray-500 block">
                          {p.jobTitle} • {p.companyName} ({p.city})
                        </span>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-blue-600">
                      Score : {p.score.score}/100
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Étape 3 : Séquence */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  3. Structure de la séquence
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Organisez l'enchaînement de vos canaux (Email, WhatsApp) et les délais entre chaque étape.
                </p>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const nextNum = steps.length + 1;
                  setSteps([
                    ...steps,
                    {
                      stepNumber: nextNum,
                      channel: 'email',
                      delayDays: 3,
                      subject: `Relance étape ${nextNum} — {{firstName}}`,
                      content: `Bonjour {{firstName}},\n\nJe reviens vers vous suite à mes précédents messages...`,
                    },
                  ]);
                }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Ajouter une étape
              </Button>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={step.stepNumber}
                  className="bg-gray-50 border border-gray-200 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {step.stepNumber}
                    </span>
                    <div>
                      <span className="font-semibold text-gray-900 block">
                        Étape {step.stepNumber} : {step.channel === 'email' ? 'Email professionnel' : 'Message WhatsApp'}
                      </span>
                      <span className="text-gray-500">
                        {step.delayDays === 0
                          ? 'Envoi immédiat au lancement'
                          : `Attendre ${step.delayDays} jours après l'étape précédente`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={step.channel}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].channel = e.target.value as Channel;
                        setSteps(updated);
                      }}
                      className="h-8 px-2 bg-white border border-gray-300 rounded text-xs"
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                    </select>

                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={step.delayDays}
                      onChange={(e) => {
                        const updated = [...steps];
                        updated[idx].delayDays = parseInt(e.target.value) || 0;
                        setSteps(updated);
                      }}
                      className="w-16 h-8 px-2 bg-white border border-gray-300 rounded text-xs text-center"
                      title="Délai en jours"
                    />
                    <span className="text-gray-500">j</span>

                    {steps.length > 1 && (
                      <button
                        onClick={() => {
                          const updated = steps
                            .filter((_, i) => i !== idx)
                            .map((s, i) => ({ ...s, stepNumber: i + 1 }));
                          setSteps(updated);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                        title="Supprimer cette étape"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Étape 4 : Messages Builder & 40. AI Generation */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  4. Rédaction des messages
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Personnalisez le contenu de chaque étape avec variables et assistance IA sobre.
                </p>
              </div>

              {/* 40. AI Message Generation button */}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleGenerateWithAI}
                isLoading={isGeneratingAI}
                leftIcon={<Bot className="w-3.5 h-3.5 text-blue-600" />}
              >
                Générer avec l'IA
              </Button>
            </div>

            {/* Steps tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              {steps.map((s, idx) => (
                <button
                  key={s.stepNumber}
                  onClick={() => {
                    setActiveStepIdx(idx);
                    setAiGeneratedPreview(null);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeStepIdx === idx
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Étape {s.stepNumber} ({s.channel.toUpperCase()})
                </button>
              ))}
            </div>

            {/* 40. AI Generated Preview Modal / Box if active */}
            {aiGeneratedPreview && (
              <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-900">Message généré par l'IA</span>
                  </div>
                  <span className="text-[11px] text-gray-500">Contrôle humain requis</span>
                </div>

                {aiGeneratedPreview.subject && (
                  <div>
                    <span className="text-[11px] font-semibold text-gray-700 block mb-0.5">Objet suggéré :</span>
                    <p className="text-xs text-gray-900 bg-white p-2 rounded border border-blue-100 font-medium">
                      {aiGeneratedPreview.subject}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-semibold text-gray-700 block mb-0.5">Contenu suggéré :</span>
                  <p className="text-xs text-gray-800 bg-white p-3 rounded border border-blue-100 whitespace-pre-wrap leading-relaxed">
                    {aiGeneratedPreview.content}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button size="sm" variant="ghost" onClick={() => setAiGeneratedPreview(null)}>
                    Ignorer
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleGenerateWithAI}
                    isLoading={isGeneratingAI}
                  >
                    Régénérer
                  </Button>
                  <Button size="sm" onClick={handleApplyAIGenerated}>
                    Utiliser ce message
                  </Button>
                </div>
              </div>
            )}

            {/* Message editor */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Canal sélectionné : <strong className="text-gray-900 uppercase">{steps[activeStepIdx].channel}</strong></span>
              </div>

              {steps[activeStepIdx].channel === 'email' && (
                <Input
                  label="Objet de l'email"
                  value={steps[activeStepIdx].subject || ''}
                  onChange={(e) => {
                    const updated = [...steps];
                    updated[activeStepIdx].subject = e.target.value;
                    setSteps(updated);
                  }}
                  placeholder="Objet du message..."
                />
              )}

              {/* 39. Variable injection buttons */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Insérer une variable dans le texte :
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {['firstName', 'lastName', 'companyName', 'jobTitle', 'city'].map((varName) => (
                    <button
                      key={varName}
                      type="button"
                      onClick={() => insertVariable(varName)}
                      className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded text-[11px] font-mono cursor-pointer transition-colors"
                    >
                      +{`{{${varName}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Corps du message</label>
                <textarea
                  rows={8}
                  value={steps[activeStepIdx].content}
                  onChange={(e) => {
                    const updated = [...steps];
                    updated[activeStepIdx].content = e.target.value;
                    setSteps(updated);
                  }}
                  className="w-full bg-white text-gray-900 text-xs rounded-md border border-gray-300 p-3 font-sans focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Étape 5 : Vérification */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                5. Vérification avant lancement
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Passez en revue les paramètres complets de la campagne.
              </p>
            </div>

            <div className="border border-gray-200 rounded-md divide-y divide-gray-100 text-xs">
              <div className="p-3.5 flex justify-between bg-gray-50/50">
                <span className="font-semibold text-gray-600">Nom de la campagne</span>
                <span className="font-bold text-gray-900">{name}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="font-semibold text-gray-600">Objectif</span>
                <span className="text-gray-900">{objective}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="font-semibold text-gray-600">Audience cible</span>
                <span className="text-gray-900">{selectedProspectIds.length} prospects sélectionnés</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="font-semibold text-gray-600">Séquence</span>
                <span className="text-gray-900">{steps.length} étapes ({steps.map(s => s.channel).join(' → ')})</span>
              </div>
            </div>
          </div>
        )}

        {/* Étape 6 : Lancement */}
        {currentStep === 6 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Votre campagne est prête à être lancée !
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
                Les {selectedProspectIds.length} prospects recevront le premier message selon les canaux programmés. Vous pourrez suivre les réponses en direct dans la boîte de réception.
              </p>
            </div>
            <div className="pt-2">
              <Button size="lg" onClick={handleLaunchCampaign}>
                Lancer la campagne immédiatement
              </Button>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
          {currentStep > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentStep(currentStep - 1)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Étape précédente
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 6 && (
            <Button
              size="sm"
              onClick={() => setCurrentStep(currentStep + 1)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Étape suivante
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
