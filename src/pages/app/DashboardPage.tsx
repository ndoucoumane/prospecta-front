import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Target,
  Megaphone,
  Kanban,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../app/providers/AuthProvider';
import { analyticsApi, campaignsApi, prospectsApi, pipelineApi } from '../../api';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getAnalyticsSummary(),
  });

  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery({
    queryKey: ['recent-campaigns'],
    queryFn: () => campaignsApi.getCampaigns(),
  });

  const { data: prospects, isLoading: isProspectsLoading } = useQuery({
    queryKey: ['prospects-to-follow'],
    queryFn: () => prospectsApi.getProspects({ status: 'qualified' }),
  });

  const { data: opportunities, isLoading: isOppsLoading } = useQuery({
    queryKey: ['recent-opportunities'],
    queryFn: () => pipelineApi.getOpportunities(),
  });

  if (isAnalyticsLoading || isCampaignsLoading || isProspectsLoading || isOppsLoading) {
    return <LoadingState message="Chargement du tableau de bord commercial..." type="skeleton" rows={6} />;
  }

  const formatFCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  return (
    <div className="space-y-8">
      {/* 24. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Bonjour {user?.firstName || 'Mor'},
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Voici l'activité commerciale de votre organisation.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/app/campaigns/new">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Nouvelle campagne
            </Button>
          </Link>
          <Link to="/app/prospects">
            <Button size="sm" variant="secondary" leftIcon={<Users className="w-4 h-4" />}>
              Voir les prospects
            </Button>
          </Link>
        </div>
      </div>

      {/* 24 & 25. KPI Cards: Flat, Bordered, No Shadow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Prospects */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              Prospects
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.totalProspects ? analytics.totalProspects.toLocaleString('fr-FR') : '1 245'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12,4 % cette semaine</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Prospects qualifiés */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              Prospects qualifiés
            </span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.qualifiedProspects || 386}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8,1 % ce mois</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Campagnes actives */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              Campagnes actives
            </span>
            <Megaphone className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.activeCampaigns || 8}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
              <span>{campaigns?.length || 3} campagnes configurées</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Opportunités */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              Opportunités
            </span>
            <Kanban className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.totalOpportunities || 42}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-1">
              <span>Valeur : {formatFCFA(analytics?.totalPipelineValue || 48500000)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 26. Activité des campagnes & Métriques de délivrance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Activité des campagnes cette semaine
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Volume des messages envoyés, réponses reçues et rendez-vous fixés.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm" /> Envoyés
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 bg-blue-400 rounded-sm" /> Réponses
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 bg-green-600 rounded-sm" /> Rendez-vous
            </span>
          </div>
        </div>

        {/* Simple bar visualization strictly flat, no gradients */}
        <div className="grid grid-cols-7 gap-3 sm:gap-6 pt-4">
          {analytics?.activityTimeline.map((item) => (
            <div key={item.period} className="flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1 h-36 bg-gray-50 rounded p-1 border border-gray-100">
                {/* Sent bar */}
                <div
                  className="w-1/3 bg-blue-600 rounded-sm transition-all"
                  style={{ height: `${Math.min(100, (item.sent / 200) * 100)}%` }}
                  title={`Envoyés: ${item.sent}`}
                />
                {/* Replies bar */}
                <div
                  className="w-1/3 bg-blue-400 rounded-sm transition-all"
                  style={{ height: `${Math.min(100, (item.replies / 60) * 100)}%` }}
                  title={`Réponses: ${item.replies}`}
                />
                {/* Meetings bar */}
                <div
                  className="w-1/3 bg-green-600 rounded-sm transition-all"
                  style={{ height: `${Math.min(100, (item.meetings / 10) * 100)}%` }}
                  title={`RDV: ${item.meetings}`}
                />
              </div>
              <span className="text-xs font-semibold text-gray-700">{item.period}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Campagnes récentes & Prospects à suivre */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campagnes récentes */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Campagnes récentes</h2>
              <Link
                to="/app/campaigns"
                className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
              >
                Tout voir <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {campaigns?.slice(0, 3).map((camp) => (
                <div key={camp.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-gray-900 truncate">
                      {camp.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                      <span>{camp.totalProspects} prospects</span>
                      <span>•</span>
                      <span>{camp.replyCount} réponses</span>
                      <span>•</span>
                      <span>{camp.meetingCount} RDV</span>
                    </div>
                  </div>
                  <Badge
                    variant={camp.status === 'active' ? 'success' : 'gray'}
                    size="sm"
                    dot
                  >
                    {camp.status === 'active' ? 'En cours' : 'Brouillon'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prospects à suivre */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Prospects à suivre en priorité</h2>
              <Link
                to="/app/prospects"
                className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
              >
                Tous les prospects <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {prospects?.slice(0, 3).map((pros) => (
                <Link
                  key={pros.id}
                  to={`/app/prospects/${pros.id}`}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {pros.firstName} {pros.lastName}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {pros.jobTitle} • {pros.companyName} ({pros.city})
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600 font-mono">
                        {pros.score.score}/100
                      </span>
                    </div>
                    <Badge variant="blue" size="sm">
                      {pros.score.level}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Opportunités prioritaires */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Opportunités en négociation</h2>
            <p className="text-xs text-gray-500">Deals en phase avancée dans votre pipeline.</p>
          </div>
          <Link
            to="/app/pipeline"
            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
          >
            Ouvrir le Kanban <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities?.slice(0, 3).map((opp) => (
            <div
              key={opp.id}
              className="border border-gray-200 rounded-md p-4 bg-gray-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-900">{opp.companyName}</span>
                  <Badge variant="blue" size="sm">
                    {opp.probability}% prob.
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{opp.title}</p>
                <p className="text-[11px] text-gray-500">Contact : {opp.prospectName}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900">{formatFCFA(opp.value)}</span>
                <span className="text-gray-500">Clôture : {opp.expectedCloseDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
