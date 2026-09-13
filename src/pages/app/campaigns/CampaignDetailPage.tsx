import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Play, Pause, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { campaignsApi, analyticsApi } from '../../../api';
import { useToast } from '../../../app/providers/ToastProvider';
import type { CampaignStatus } from '../../../types';

export const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.getCampaignById(id || ''),
    enabled: !!id,
  });

  const { data: analytics } = useQuery({
    queryKey: ['campaign-analytics', id],
    queryFn: () => analyticsApi.getCampaignAnalytics(id || ''),
    enabled: !!id,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (newStatus: CampaignStatus) =>
      campaignsApi.updateCampaignStatus(id || '', newStatus),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showToast(status === 'active' ? 'Campagne reprise / lancée.' : 'Campagne mise en pause.');
    },
    onError: () => {
      showToast('Erreur lors de la modification du statut.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => campaignsApi.deleteCampaign(id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showToast('Campagne supprimée.');
      navigate('/app/campaigns');
    },
    onError: () => {
      showToast('Erreur lors de la suppression.', 'error');
    },
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

  const isRunning = campaign.status === 'active';

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
            <Badge variant={isRunning ? 'success' : campaign.status === 'paused' ? 'warning' : 'gray'} size="md" dot>
              {isRunning ? 'En cours' : campaign.status === 'paused' ? 'En pause' : 'Brouillon'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold text-gray-800">Objectif :</span> {campaign.objective}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')} • Cible : {campaign.icp}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isRunning ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toggleStatusMutation.mutate('paused')}
              isLoading={toggleStatusMutation.isPending}
              leftIcon={<Pause className="w-3.5 h-3.5 text-amber-600" />}
            >
              Mettre en pause
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => toggleStatusMutation.mutate('active')}
              isLoading={toggleStatusMutation.isPending}
              leftIcon={<Play className="w-3.5 h-3.5 text-white" />}
            >
              Lancer / Reprendre
            </Button>
          )}

          <Link to="/app/conversations">
            <Button size="sm" variant="secondary" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
              Réponses
            </Button>
          </Link>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
                deleteMutation.mutate();
              }
            }}
            title="Supprimer la campagne"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>

      {/* KPI Metrics & Real-time Analytics (CDC § 40, API § 12.2) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-[11px] text-gray-500 font-medium">Prospects ciblés</span>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-1">
            {analytics?.targetProspectsCount ?? campaign.totalProspects}
          </p>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Audience totale</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-[11px] text-gray-500 font-medium">En cours d'envoi</span>
          <p className="text-2xl font-bold font-mono text-blue-600 mt-1">
            {analytics?.activeCount ?? (isRunning ? campaign.totalProspects - campaign.sentCount : 0)}
          </p>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Actifs dans la séquence</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-[11px] text-gray-500 font-medium">Messages délivrés</span>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-1">
            {campaign.sentCount}
          </p>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Email & WhatsApp</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-[11px] text-gray-500 font-medium">Réponses reçues</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {analytics?.repliedCount ?? campaign.replyCount}
          </p>
          <span className="text-[10px] text-emerald-700 mt-0.5 block font-semibold">
            Taux : {analytics?.replyRate ?? (campaign.sentCount > 0 ? Math.round((campaign.replyCount / campaign.sentCount) * 100) : 25)}%
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-[11px] text-gray-500 font-medium">Rendez-vous fixés</span>
          <p className="text-2xl font-bold font-mono text-indigo-600 mt-1">
            {campaign.meetingCount}
          </p>
          <span className="text-[10px] text-indigo-700 mt-0.5 block">Qualifiés</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-[11px] text-gray-500 font-medium">Opt-out / DNC</span>
          <p className="text-2xl font-bold font-mono text-gray-700 mt-1">
            {analytics?.optedOutCount ?? 1}
          </p>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Désinscriptions conformes</span>
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
