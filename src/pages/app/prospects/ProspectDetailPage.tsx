import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge, type BadgeVariant } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LeadScoreCard } from '../../../components/features/prospects/LeadScoreCard';
import { prospectsApi, aiApi } from '../../../api';
import { useToast } from '../../../app/providers/ToastProvider';
import { PermissionGate } from '../../../security';
import type { LeadStatus } from '../../../types';

export const ProspectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [hasFetchedAi, setHasFetchedAi] = useState(false);

  const { data: prospect, isLoading, error } = useQuery({
    queryKey: ['prospect', id],
    queryFn: () => prospectsApi.getProspectById(id || ''),
    enabled: !!id,
  });

  const {
    data: aiSummary,
    isLoading: isAiLoading,
    refetch: refetchAi,
  } = useQuery({
    queryKey: ['prospectAi', id],
    queryFn: () => aiApi.summarizeProspect(id || ''),
    enabled: false,
  });

  const handleFetchAiAngle = async () => {
    setHasFetchedAi(true);
    try {
      await refetchAi();
      showToast("Angle d'accroche et synthèse IA générés avec succès.", 'success');
    } catch {
      showToast("Impossible d'obtenir la synthèse IA.", 'error');
    }
  };

  const statusMutation = useMutation({
    mutationFn: (newStatus: LeadStatus) =>
      prospectsApi.updateProspect(id || '', { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospect', id] });
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      showToast('Statut du prospect mis à jour.');
    },
  });

  const enrichMutation = useMutation({
    mutationFn: () => prospectsApi.enrichProspect(id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospect', id] });
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      showToast('Prospect enrichi avec succès via Apollo (coordonnées et WhatsApp certifiés).', 'success');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : "Échec de l'enrichissement", 'error');
    },
  });

  const scoreMutation = useMutation({
    mutationFn: () => prospectsApi.recalculateScore(id || ''),
    onSuccess: (newScore) => {
      queryClient.setQueryData(['prospect', id], (old: typeof prospect) =>
        old ? { ...old, score: newScore } : old
      );
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      showToast('Score IA recalculé avec succès.', 'success');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Erreur calcul score', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => prospectsApi.deleteProspect(id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      showToast('Prospect supprimé.');
      navigate('/app/prospects');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Suppression impossible', 'error');
    },
  });

  if (isLoading) {
    return <LoadingState message="Chargement de la fiche prospect..." type="skeleton" rows={5} />;
  }

  if (error || !prospect) {
    return (
      <ErrorState
        title="Prospect introuvable"
        message="Ce prospect n'existe pas ou a été supprimé."
        onRetry={() => navigate('/app/prospects')}
      />
    );
  }

  const getStatusBadge = (status: LeadStatus): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'qualified':
        return { label: 'Qualifié', variant: 'success' };
      case 'meeting':
        return { label: 'Rendez-vous', variant: 'blue' };
      case 'contacted':
        return { label: 'Contacté', variant: 'warning' };
      case 'opted_out':
        return { label: 'Désinscrit', variant: 'error' };
      case 'unresponsive':
        return { label: 'Sans réponse', variant: 'gray' };
      case 'new':
      default:
        return { label: 'Nouveau', variant: 'default' };
    }
  };

  const statusBadge = getStatusBadge(prospect.status);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/app/prospects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour aux prospects</span>
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {prospect.firstName} {prospect.lastName}
            </h1>
            <Badge variant={statusBadge.variant} size="md" dot>
              {statusBadge.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            {prospect.jobTitle} • {prospect.companyName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Ajouté le {new Date(prospect.createdAt).toLocaleDateString('fr-FR')} • Source : {prospect.source}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Enrichissement Apollo */}
          <PermissionGate permission="prospect:enrich" mode="disable" tooltip="Rôle insuffisant pour l'enrichissement Apollo">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => enrichMutation.mutate()}
              isLoading={enrichMutation.isPending}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            >
              Enrichir (Apollo)
            </Button>
          </PermissionGate>

          {/* Recalculer Score */}
          <PermissionGate permission="prospect:score" mode="disable" tooltip="Rôle insuffisant pour recalculer le score">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => scoreMutation.mutate()}
              isLoading={scoreMutation.isPending}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-blue-600" />}
            >
              Recalculer Score
            </Button>
          </PermissionGate>

          {/* Quick status change */}
          <PermissionGate permission="prospect:update" mode="disable">
            <select
              value={prospect.status}
              onChange={(e) => statusMutation.mutate(e.target.value as LeadStatus)}
              className="h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="new">Nouveau</option>
              <option value="contacted">Contacté</option>
              <option value="qualified">Qualifié</option>
              <option value="meeting">Rendez-vous fixé</option>
              <option value="unresponsive">Sans réponse</option>
              <option value="opted_out">Désinscrit</option>
            </select>
          </PermissionGate>

          <Link to={`/app/conversations?prospectId=${prospect.id}`}>
            <Button size="sm" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
              Conversation
            </Button>
          </Link>

          {/* Delete action protected by RBAC */}
          <PermissionGate permission="prospect:delete" mode="hide">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm('Confirmer la suppression définitive de ce prospect (Droit à l’oubli / RGPD) ?')) {
                  deleteMutation.mutate();
                }
              }}
              aria-label="Supprimer le prospect"
              title="Supprimer définitivement"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Grid: Lead Score Breakdown + Contact & Company info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Contact, Company & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100 mb-4">
              Coordonnées professionnelles certifiées
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-500 block">Email professionnel nominatif</span>
                  <a href={`mailto:${prospect.email}`} className="font-semibold text-gray-900 hover:text-blue-600 truncate block">
                    {prospect.email || 'Non renseigné'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-500 block">WhatsApp Direct vérifié (+221)</span>
                  <a href={`tel:${prospect.phone}`} className="font-semibold text-gray-900 hover:text-emerald-600 truncate block">
                    {prospect.phone || 'Non renseigné'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-500 block">Entreprise & Secteur</span>
                  <span className="font-semibold text-gray-900 block truncate">
                    {prospect.companyName} ({prospect.sector})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-500 block">Ville & Marché Cible</span>
                  <span className="font-semibold text-gray-900 block">
                    {prospect.city}, Sénégal
                  </span>
                </div>
              </div>
            </div>

            {prospect.notes && (
              <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded text-xs">
                <span className="font-semibold text-blue-900 block mb-1">Notes commerciales :</span>
                <p className="text-gray-700 leading-relaxed">{prospect.notes}</p>
              </div>
            )}
          </div>

          {/* Section IA Copilot : Angle d'accroche personnalisé */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-gray-900">
                  Intelligence Artificielle & Angle d'Accroche
                </h2>
              </div>
              {!hasFetchedAi && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleFetchAiAngle}
                  isLoading={isAiLoading}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                >
                  Générer l'angle IA
                </Button>
              )}
            </div>

            {isAiLoading ? (
              <LoadingState message="Synthèse du profil et analyse des leviers de négociation par l'IA..." type="skeleton" rows={3} />
            ) : aiSummary ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-md">
                  <span className="font-semibold text-amber-900 block mb-1">🎯 Angle recommandé pour la prise de contact :</span>
                  <p className="text-amber-950 font-medium leading-relaxed">{aiSummary.suggestedAngle}</p>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md">
                  <span className="font-semibold text-blue-900 block mb-1">📋 Profil & Décision :</span>
                  <p className="text-gray-700 leading-relaxed">{aiSummary.summary}</p>
                </div>

                {aiSummary.keyStrengths && aiSummary.keyStrengths.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-800 block mb-1.5">Points forts & centres d'intérêt :</span>
                    <ul className="space-y-1">
                      {aiSummary.keyStrengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Cliquez sur &quot;Générer l&apos;angle IA&quot; pour analyser la posture décisionnelle de {prospect.firstName} {prospect.lastName} et obtenir un message d&apos;accroche optimisé pour l&apos;Afrique de l&apos;Ouest.
              </p>
            )}
          </div>

          {/* Activity timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100 mb-4">
              Historique d'activité commerciale
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">Message envoyé</p>
                  <p className="text-gray-600 mt-0.5">Contact via campagne multicanale ou messagerie directe.</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(prospect.lastActivityAt).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded bg-green-50 border border-green-200 flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">Lead qualifié par le système</p>
                  <p className="text-gray-600 mt-0.5">Score commercial élevé ({prospect.score.score}/100) — Profil décideur validé.</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(prospect.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Lead Score Details */}
        <div className="space-y-6">
          <LeadScoreCard score={prospect.score} />

          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
              Actions rapides
            </h3>
            <div className="space-y-2">
              <PermissionGate permission="campaign:create" mode="disable">
                <Link to="/app/campaigns/new" className="block">
                  <Button size="sm" variant="secondary" className="w-full justify-start text-xs">
                    Ajouter à une nouvelle campagne
                  </Button>
                </Link>
              </PermissionGate>
              <PermissionGate permission="pipeline:create_opportunity" mode="disable">
                <Link to="/app/pipeline" className="block">
                  <Button size="sm" variant="secondary" className="w-full justify-start text-xs">
                    Créer une opportunité dans le Pipeline
                  </Button>
                </Link>
              </PermissionGate>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
