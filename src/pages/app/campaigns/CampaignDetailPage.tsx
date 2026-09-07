import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { campaignsApi } from '../../../api';

export const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.getCampaignById(id || ''),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingState message="Chargement de la campagne..." type="skeleton" rows={5} />;
  }

  if (error || !campaign) {
    return (
      <ErrorState
        title="Campagne introuvable"
        message="Cette campagne n'existe pas ou a été retirée."
        onRetry={() => navigate('/app/campaigns')}
      />
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <Badge variant={campaign.status === 'active' ? 'success' : 'gray'} size="md" dot>
              {campaign.status === 'active' ? 'Active' : 'Brouillon'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold text-gray-800">Objectif :</span> {campaign.objective}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')} • Cible : {campaign.icp}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/app/conversations">
            <Button size="sm">Voir les réponses</Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs text-gray-500 font-medium">Prospects ciblés</span>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-1">{campaign.totalProspects}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs text-gray-500 font-medium">Messages envoyés</span>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-1">{campaign.sentCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs text-gray-500 font-medium">Réponses reçues</span>
          <p className="text-2xl font-bold font-mono text-blue-600 mt-1">{campaign.replyCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs text-gray-500 font-medium">Rendez-vous obtenus</span>
          <p className="text-2xl font-bold font-mono text-green-600 mt-1">{campaign.meetingCount}</p>
        </div>
      </div>

      {/* Steps breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
          Séquence programmée ({campaign.steps.length} étapes)
        </h2>

        <div className="space-y-4">
          {campaign.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="border border-gray-200 rounded-md p-4 bg-gray-50/50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                    {step.stepNumber}
                  </span>
                  <span className="font-bold text-gray-900 uppercase">
                    Canal : {step.channel}
                  </span>
                </div>
                <span className="text-gray-500">
                  {step.delayDays === 0 ? 'Immédiat' : `+${step.delayDays} jours`}
                </span>
              </div>

              {step.subject && (
                <p className="text-gray-700">
                  <strong className="text-gray-900">Objet :</strong> {step.subject}
                </p>
              )}

              <p className="text-gray-600 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
                {step.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
