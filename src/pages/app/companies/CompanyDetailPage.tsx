import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Phone,
  Bot,
  RotateCcw,
  Users,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { companiesApi, prospectsApi } from '../../../api';
import { useToast } from '../../../app/providers/ToastProvider';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companiesApi.getCompanyById(id || ''),
    enabled: !!id,
  });

  const { data: prospects } = useQuery({
    queryKey: ['prospects-company', company?.name],
    queryFn: () => prospectsApi.getProspects({ query: company?.name }),
    enabled: !!company?.name,
  });

  const refreshAIMutation = useMutation({
    mutationFn: () => companiesApi.refreshAIAnalysis(id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', id] });
      showToast('Analyse de l\'entreprise actualisée.');
    },
    onError: () => {
      showToast('Erreur lors de l\'actualisation de l\'analyse.', 'error');
    },
  });

  if (isLoading) {
    return <LoadingState message="Chargement de l'entreprise..." type="skeleton" rows={5} />;
  }

  if (error || !company) {
    return (
      <ErrorState
        title="Entreprise introuvable"
        message="Cette fiche entreprise n'existe pas ou a été retirée."
        onRetry={() => navigate('/app/companies')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/app/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour aux entreprises</span>
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {company.name}
            </h1>
            <Badge variant="blue" size="md">
              Score : {company.score}/100
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            {company.sector} • {company.city}, Sénégal
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Taille : {company.size} employés
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={`/app/campaigns/new?targetCompany=${encodeURIComponent(company.name)}`}>
            <Button size="sm">
              Cibler dans une campagne
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: 34. Informations, Contacts & 35. AI Analysis UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Infos & Contacts */}
        <div className="lg:col-span-2 space-y-6">
          {/* General info */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100 mb-4">
              Informations générales
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-500 block">Site internet</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-blue-600 hover:underline truncate block"
                  >
                    {company.website}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-500 block">Standard téléphonique</span>
                  <span className="font-semibold text-gray-900 block">
                    {company.phone || '+221 33 800 00 00'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-500 block">Siège / Zone</span>
                  <span className="font-semibold text-gray-900 block">
                    {company.city}, Sénégal
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-500 block">Secteur</span>
                  <span className="font-semibold text-gray-900 block">
                    {company.sector}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contacts rattachés */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Décideurs & contacts associés
                </h2>
                <p className="text-xs text-gray-500">
                  {prospects?.length || 0} prospect{(prospects?.length || 0) > 1 ? 's' : ''} enregistré{(prospects?.length || 0) > 1 ? 's' : ''} dans cette structure
                </p>
              </div>
              <Link to="/app/prospects">
                <Button size="sm" variant="secondary" leftIcon={<Users className="w-3.5 h-3.5" />}>
                  Ajouter un contact
                </Button>
              </Link>
            </div>

            {prospects && prospects.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {prospects.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link
                        to={`/app/prospects/${p.id}`}
                        className="text-xs font-semibold text-gray-900 hover:text-blue-600 block"
                      >
                        {p.firstName} {p.lastName}
                      </Link>
                      <span className="text-[11px] text-gray-500">
                        {p.jobTitle} • {p.email} • {p.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 font-mono">
                        {p.score.score}/100
                      </span>
                      <Link
                        to={`/app/prospects/${p.id}`}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        aria-label={`Voir ${p.firstName} ${p.lastName}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-3">
                Aucun contact spécifique n'a encore été créé pour cette entreprise.
              </p>
            )}
          </div>
        </div>

        {/* 35. AI ANALYSIS UI: Strictly professional, Bot icon, no sparkles, clear sections */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Analyse de l'entreprise
                </h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => refreshAIMutation.mutate()}
                isLoading={refreshAIMutation.isPending}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Actualiser
              </Button>
            </div>

            {company.aiAnalysis ? (
              <div className="space-y-4 text-xs">
                {/* Résumé */}
                <div>
                  <h4 className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] mb-1">
                    Résumé
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-100">
                    {company.aiAnalysis.summary}
                  </p>
                </div>

                {/* Points d'intérêt */}
                <div>
                  <h4 className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] mb-1.5">
                    Points d'intérêt
                  </h4>
                  <ul className="space-y-1.5">
                    {company.aiAnalysis.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunités */}
                <div>
                  <h4 className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] mb-1.5">
                    Opportunités
                  </h4>
                  <ul className="space-y-1.5">
                    {company.aiAnalysis.opportunities.map((opp, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Approche recommandée */}
                <div>
                  <h4 className="font-semibold text-gray-900 uppercase tracking-wider text-[11px] mb-1">
                    Approche recommandée
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-blue-50/50 p-2.5 rounded border border-blue-100">
                    {company.aiAnalysis.recommendedApproach}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                  Dernière analyse : {new Date(company.aiAnalysis.lastAnalyzedAt).toLocaleDateString('fr-FR')} à {new Date(company.aiAnalysis.lastAnalyzedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500 mb-3">
                  Aucune analyse IA n'a encore été générée pour cette entreprise.
                </p>
                <Button
                  size="sm"
                  onClick={() => refreshAIMutation.mutate()}
                  isLoading={refreshAIMutation.isPending}
                >
                  Lancer l'analyse
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
