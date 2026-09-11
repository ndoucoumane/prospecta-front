import { apiGet } from './client';
import type { AnalyticsSummary } from '../types';
import type { AnalyticsOverviewResponse, CampaignAnalyticsResponse } from '../types/api';
import { initialAnalytics } from './mockData';

export const analyticsApi = {
  // ==========================================================================
  // Direct Backend REST Endpoints (/api/v1/analytics)
  // ==========================================================================

  /**
   * GET /api/v1/analytics/overview
   * Tableau de bord général des ventes
   */
  async getOverview(): Promise<AnalyticsOverviewResponse> {
    return apiGet<AnalyticsOverviewResponse>('/api/v1/analytics/overview');
  },

  /**
   * GET /api/v1/analytics/campaigns/{id}
   * Statistiques et entonnoir d'une campagne spécifique
   */
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalyticsResponse> {
    return apiGet<CampaignAnalyticsResponse>(`/api/v1/analytics/campaigns/${campaignId}`);
  },

  // ==========================================================================
  // High-Level UI Adapted Methods
  // ==========================================================================

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    try {
      const data = await this.getOverview();
      if (data) {
        return {
          totalProspects: data.totalProspects,
          qualifiedProspects: data.qualifiedProspects,
          activeCampaigns: data.activeCampaigns,
          totalOpportunities: data.opportunitiesCount,
          totalPipelineValue: data.totalPipelineValue,
          conversionRate: data.conversionRate,
          replyRate: data.replyRate,
          activityTimeline: initialAnalytics.activityTimeline,
        };
      }
    } catch {
      // Fallback to local initialAnalytics
    }
    return initialAnalytics;
  },
};
