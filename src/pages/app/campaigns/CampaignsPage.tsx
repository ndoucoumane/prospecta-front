import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Mail,
  Phone,
  Play,
  Pause,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge, type BadgeVariant } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { campaignsApi } from '../../../api';
import { useToast } from '../../../app/providers/ToastProvider';
import type { CampaignStatus } from '../../../types';

export const CampaignsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.getCampaigns(),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignStatus }) =>
      campaignsApi.updateCampaignStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showToast(
        variables.status === 'active'
          ? 'Campagne lancée.'
          : 'La campagne a été mise en pause.'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      showToast('Campagne supprimée.');
    },
  });

  const getStatusBadge = (status: CampaignStatus): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'active':
        return { label: 'Active', variant: 'success' };
      case 'paused':
        return { label: 'En pause', variant: 'warning' };
      case 'completed':
        return { label: 'Terminée', variant: 'blue' };
      case 'draft':
      default:
        return { label: 'Brouillon', variant: 'gray' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 36. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Campagnes</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Automatisez vos prises de contact et séquences multicanales (Email & WhatsApp).
          </p>
        </div>

        <Link to="/app/campaigns/new">
          <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Nouvelle campagne
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Chargement des campagnes..." type="skeleton" rows={4} />
      ) : !campaigns || campaigns.length === 0 ? (
        <EmptyState
          title="Aucune campagne configurée"
          description="Créez votre première campagne multicanale pour démarrer la prospection automatique."
          actionLabel="Créer une campagne"
          onAction={() => (window.location.href = '/app/campaigns/new')}
        />
      ) : (
        <div className="space-y-4">
          {campaigns.map((camp) => {
            const status = getStatusBadge(camp.status);
            return (
              <div
                key={camp.id}
                className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Camp info */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/app/campaigns/${camp.id}`}
                      className="text-sm sm:text-base font-bold text-gray-900 hover:text-blue-600 truncate"
                    >
                      {camp.name}
                    </Link>
                    <Badge variant={status.variant} size="sm" dot>
                      {status.label}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-1">
                    <span className="font-semibold text-gray-700">Cible :</span> {camp.icp}
                  </p>

                  {/* Channels & steps indicator */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      {camp.channels.includes('email') && (
                        <span className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-[11px]">
                          <Mail className="w-3 h-3 text-blue-600" /> Email
                        </span>
                      )}
                      {camp.channels.includes('whatsapp') && (
                        <span className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-[11px]">
                          <Phone className="w-3 h-3 text-green-600" /> WhatsApp
                        </span>
                      )}
                    </div>
                    <span>•</span>
                    <span>{camp.steps.length} étapes configurées</span>
                  </div>
                </div>

                {/* Center: Metrics (Prospects, Réponses, RDV) */}
                <div className="grid grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-3 lg:pt-0 lg:pl-6 text-center">
                  <div>
                    <span className="text-base font-bold text-gray-900 font-mono">
                      {camp.totalProspects}
                    </span>
                    <span className="block text-[11px] text-gray-500">Prospects</span>
                  </div>
                  <div>
                    <span className="text-base font-bold text-blue-600 font-mono">
                      {camp.replyCount}
                    </span>
                    <span className="block text-[11px] text-gray-500">Réponses</span>
                  </div>
                  <div>
                    <span className="text-base font-bold text-green-600 font-mono">
                      {camp.meetingCount}
                    </span>
                    <span className="block text-[11px] text-gray-500">Rendez-vous</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  {camp.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        toggleStatusMutation.mutate({ id: camp.id, status: 'paused' })
                      }
                      leftIcon={<Pause className="w-3.5 h-3.5" />}
                    >
                      Mettre en pause
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() =>
                        toggleStatusMutation.mutate({ id: camp.id, status: 'active' })
                      }
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                    >
                      Lancer
                    </Button>
                  )}

                  <Link to={`/app/campaigns/${camp.id}`}>
                    <Button size="sm" variant="ghost" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                      Détails
                    </Button>
                  </Link>

                  <button
                    onClick={() => {
                      if (confirm(`Supprimer la campagne "${camp.name}" ?`)) {
                        deleteMutation.mutate(camp.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded"
                    title="Supprimer la campagne"
                    aria-label="Supprimer la campagne"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
