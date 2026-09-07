import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Megaphone,
  MessageSquare,
  Kanban,
  Target,
  Calendar,
} from 'lucide-react';
import { LoadingState } from '../../../components/ui/LoadingState';
import { analyticsApi } from '../../../api';

export const AnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-full'],
    queryFn: () => analyticsApi.getAnalyticsSummary(),
  });

  if (isLoading) {
    return <LoadingState message="Chargement des analyses commerciales..." type="skeleton" rows={6} />;
  }

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // 45. The required metrics: Prospects, Campagnes, Messages, Réponses, Rendez-vous, Opportunités, Conversions
  const kpis = [
    { label: 'Prospects ciblés', value: analytics?.totalProspects?.toLocaleString('fr-FR') || '1 245', sub: '+12,4% sem.', icon: Users },
    { label: 'Campagnes lancées', value: String(analytics?.activeCampaigns || 8), sub: 'Actives', icon: Megaphone },
    { label: 'Messages délivrés', value: '980', sub: 'Email & WhatsApp', icon: MessageSquare },
    { label: 'Réponses obtenues', value: '280', sub: `Taux : ${analytics?.replyRate || 28.5}%`, icon: MessageSquare },
    { label: 'Rendez-vous fixés', value: '38', sub: 'Convertis', icon: Calendar },
    { label: 'Opportunités créées', value: String(analytics?.totalOpportunities || 42), sub: formatFCFA(analytics?.totalPipelineValue || 48500000), icon: Kanban },
    { label: 'Taux de conversion', value: `${analytics?.conversionRate || 14.8}%`, sub: 'Cible → Affaire', icon: Target },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analyses commerciales</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Suivi des indicateurs clés de performance et de conversion de vos campagnes.
        </p>
      </div>

      {/* 45. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  {kpi.label}
                </span>
                <Icon className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <span className="text-xl font-bold font-mono text-gray-900">{kpi.value}</span>
                <span className="block text-[11px] text-gray-500 mt-0.5">{kpi.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion Funnel (Sobriété absolue, monochrome bleu/gris) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900">
            Entonnoir de conversion global (Dakar & Régions)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Du premier contact à l'opportunité commerciale gagnée.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {[
            { step: '1. Prospects importés & ciblés', count: 1245, pct: 100, color: 'bg-blue-700' },
            { step: '2. Messages envoyés (Email / WhatsApp)', count: 980, pct: 78.7, color: 'bg-blue-600' },
            { step: '3. Réponses positives reçues', count: 280, pct: 28.5, color: 'bg-blue-500' },
            { step: '4. Rendez-vous de démonstration', count: 72, pct: 7.3, color: 'bg-blue-400' },
            { step: '5. Opportunités créées dans le pipeline', count: 42, pct: 4.2, color: 'bg-blue-300' },
            { step: '6. Contrats signés / Gagnés', count: 18, pct: 1.8, color: 'bg-green-600' },
          ].map((item) => (
            <div key={item.step} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">{item.step}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-gray-500">{item.count} contacts</span>
                  <span className="font-mono font-bold text-gray-900 w-12 text-right">{item.pct}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-sm h-3 overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-sm transition-all`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multichannel Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">
            Performance par canal d'approche
          </h3>
          <p className="text-xs text-gray-500">
            Comparatif des taux de réponse au Sénégal.
          </p>

          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-900 block">WhatsApp Business</span>
                <span className="text-[11px] text-gray-500">420 envoyés • 168 réponses</span>
              </div>
              <span className="text-sm font-bold font-mono text-green-700">40,0 %</span>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-900 block">Email Professionnel</span>
                <span className="text-[11px] text-gray-500">560 envoyés • 112 réponses</span>
              </div>
              <span className="text-sm font-bold font-mono text-blue-700">20,0 %</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">
            Répartition géographique des opportunités
          </h3>
          <p className="text-xs text-gray-500">
            Volume des affaires par région commerciale.
          </p>

          <div className="space-y-2.5 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Dakar (Plateau, Almadies, Zone Ind.)</span>
              <span className="font-mono font-bold text-gray-900">72 %</span>
            </div>
            <div className="w-full bg-gray-100 rounded-sm h-2">
              <div className="h-full bg-blue-600 rounded-sm" style={{ width: '72%' }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-gray-700">Thiès & Diamniadio</span>
              <span className="font-mono font-bold text-gray-900">18 %</span>
            </div>
            <div className="w-full bg-gray-100 rounded-sm h-2">
              <div className="h-full bg-blue-500 rounded-sm" style={{ width: '18%' }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-gray-700">Petite Côte (Saly, Mbour)</span>
              <span className="font-mono font-bold text-gray-900">10 %</span>
            </div>
            <div className="w-full bg-gray-100 rounded-sm h-2">
              <div className="h-full bg-blue-400 rounded-sm" style={{ width: '10%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
