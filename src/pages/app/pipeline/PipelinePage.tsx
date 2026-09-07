import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { LoadingState } from '../../../components/ui/LoadingState';
import { pipelineApi } from '../../../api';
import { useToast } from '../../../app/providers/ToastProvider';
import type { PipelineStage } from '../../../types';

export const PipelinePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Opp Form State
  const [newTitle, setNewTitle] = useState('');
  const [newProspectName, setNewProspectName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newValue, setNewValue] = useState('1500000');
  const [newStage, setNewStage] = useState<PipelineStage>('new');

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => pipelineApi.getOpportunities(),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: PipelineStage }) =>
      pipelineApi.updateOpportunityStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      showToast('Étape de l\'opportunité mise à jour.');
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      pipelineApi.createOpportunity({
        title: newTitle,
        prospectId: `pros-${Date.now()}`,
        prospectName: newProspectName,
        companyName: newCompanyName,
        value: parseInt(newValue) || 0,
        stage: newStage,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      showToast('Opportunité créée.');
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewProspectName('');
      setNewCompanyName('');
      setNewValue('1500000');
    },
  });

  // 44. The 8 required stages in order
  const stages: { key: PipelineStage; label: string }[] = [
    { key: 'new', label: 'Nouveau' },
    { key: 'contacted', label: 'Contacté' },
    { key: 'qualified', label: 'Qualifié' },
    { key: 'meeting', label: 'Rendez-vous' },
    { key: 'proposal', label: 'Proposition' },
    { key: 'negotiation', label: 'Négociation' },
    { key: 'won', label: 'Gagné' },
    { key: 'lost', label: 'Perdu' },
  ];

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getNextStage = (current: PipelineStage): PipelineStage | null => {
    const idx = stages.findIndex((s) => s.key === current);
    if (idx >= 0 && idx < stages.length - 1) {
      return stages[idx + 1].key;
    }
    return null;
  };

  const getPrevStage = (current: PipelineStage): PipelineStage | null => {
    const idx = stages.findIndex((s) => s.key === current);
    if (idx > 0) {
      return stages[idx - 1].key;
    }
    return null;
  };

  if (isLoading) {
    return <LoadingState message="Chargement du pipeline commercial..." type="skeleton" rows={5} />;
  }

  // Calculate pipeline total value
  const totalPipelineValue = (opportunities || []).reduce((acc, o) => acc + o.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pipeline commercial</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700">
              Total : {formatFCFA(totalPipelineValue)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Suivi des opportunités à travers les 8 étapes de conversion.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Nouvelle opportunité
        </Button>
      </div>

      {/* 44. Kanban Board (8 Columns, Sobres, Flat, No shadows) */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3.5 min-w-[1280px]">
          {stages.map((stage) => {
            const stageOpps = (opportunities || []).filter((o) => o.stage === stage.key);
            const stageSum = stageOpps.reduce((sum, o) => sum + o.value, 0);

            return (
              <div
                key={stage.key}
                className="w-72 bg-gray-50/75 border border-gray-200 rounded-lg flex flex-col flex-shrink-0"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200 bg-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{stage.label}</span>
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 font-mono text-[11px] font-semibold flex items-center justify-center">
                      {stageOpps.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono block mt-1">
                    {formatFCFA(stageSum)}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2 space-y-2.5 flex-1 min-h-[420px] overflow-y-auto">
                  {stageOpps.length === 0 ? (
                    <div className="h-24 border border-dashed border-gray-200 rounded flex items-center justify-center text-[11px] text-gray-400">
                      Aucune affaire
                    </div>
                  ) : (
                    stageOpps.map((opp) => (
                      <div
                        key={opp.id}
                        className="bg-white border border-gray-200 rounded-md p-3 space-y-2 text-xs select-none"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-gray-900 line-clamp-1">
                            {opp.companyName}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {opp.probability}%
                          </span>
                        </div>

                        <p className="text-gray-600 text-[11px] line-clamp-1">{opp.title}</p>
                        <p className="text-gray-500 text-[11px]">Contact : {opp.prospectName}</p>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="font-bold font-mono text-blue-600">
                            {formatFCFA(opp.value)}
                          </span>

                          {/* Quick advance / retreat stage */}
                          <div className="flex items-center gap-1">
                            {getPrevStage(opp.stage) && (
                              <button
                                onClick={() =>
                                  updateStageMutation.mutate({
                                    id: opp.id,
                                    stage: getPrevStage(opp.stage)!,
                                  })
                                }
                                className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                                title="Étape précédente"
                                aria-label="Étape précédente"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {getNextStage(opp.stage) && (
                              <button
                                onClick={() =>
                                  updateStageMutation.mutate({
                                    id: opp.id,
                                    stage: getNextStage(opp.stage)!,
                                  })
                                }
                                className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100"
                                title="Étape suivante"
                                aria-label="Étape suivante"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Opportunity Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Créer une opportunité"
        description="Ajoutez une affaire commerciale à suivre dans votre entonnoir de vente."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Intitulé du deal"
            placeholder="ex: Contrat Plateforme Annuel"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Entreprise"
              placeholder="ex: Keur Hospitality"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              required
            />
            <Input
              label="Contact / Décideur"
              placeholder="ex: Fatou Diallo"
              value={newProspectName}
              onChange={(e) => setNewProspectName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Valeur estimée (FCFA)"
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              required
            />
            <Select
              label="Étape initiale"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value as PipelineStage)}
              options={stages.map((s) => ({ value: s.key, label: s.label }))}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" size="sm" isLoading={createMutation.isPending}>
              Créer l'opportunité
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
