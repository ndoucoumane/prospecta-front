import { apiGet, apiPost, apiPatch, apiPut, executeWithPermission } from './client';
import type { Opportunity, PipelineStage } from '../types';
import type {
  OpportunityResponse,
  CreateOpportunityRequest,
  UpdateOpportunityStageRequest,
  UpdateOpportunityRequest,
  PipelineOverviewResponse,
  PageResponse,
  OpportunityStageBackend,
} from '../types/api';
import { initialOpportunities } from './mockData';

const STORAGE_KEY = 'prospecta_opportunities';

function loadLocalOpportunities(): Opportunity[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...initialOpportunities];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOpportunities));
  return [...initialOpportunities];
}

function saveLocalOpportunities(opps: Opportunity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(opps));
}

export function mapBackendToOpportunity(dto: OpportunityResponse): Opportunity {
  const stageMap: Record<string, PipelineStage> = {
    NEW: 'new',
    QUALIFICATION: 'qualified',
    PROPOSAL: 'proposal',
    NEGOTIATION: 'negotiation',
    WON: 'won',
    LOST: 'lost',
  };

  return {
    id: dto.id,
    title: dto.title,
    prospectId: dto.prospectId,
    prospectName: dto.prospectName,
    companyName: dto.companyName,
    value: dto.estimatedValue,
    stage: stageMap[dto.stage] || 'new',
    probability: dto.winProbability,
    expectedCloseDate: dto.expectedCloseDate,
    lastActivityAt: dto.updatedAt || dto.createdAt,
  };
}

export const pipelineApi = {
  // ==========================================================================
  // Direct Backend REST Endpoints (/api/v1/pipeline)
  // ==========================================================================

  /**
   * POST /api/v1/pipeline/opportunities
   */
  async create(payload: CreateOpportunityRequest): Promise<OpportunityResponse> {
    return executeWithPermission('pipeline:create_opportunity', async () => {
      return apiPost<OpportunityResponse>('/api/v1/pipeline/opportunities', payload);
    });
  },

  /**
   * GET /api/v1/pipeline/opportunities
   */
  async getAll(params?: {
    stage?: string;
    assignedTo?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<OpportunityResponse>> {
    return apiGet<PageResponse<OpportunityResponse>>('/api/v1/pipeline/opportunities', {
      stage: params?.stage,
      assignedTo: params?.assignedTo,
      page: params?.page ?? 0,
      size: params?.size ?? 50,
      sort: params?.sort ?? 'createdAt,desc',
    });
  },

  /**
   * PATCH /api/v1/pipeline/opportunities/{id}/stage
   * Changer l'étape de l'opportunité (Drag & Drop Kanban)
   */
  async updateStage(
    id: string,
    payload: UpdateOpportunityStageRequest
  ): Promise<OpportunityResponse> {
    return executeWithPermission('pipeline:update_stage', async () => {
      return apiPatch<OpportunityResponse>(`/api/v1/pipeline/opportunities/${id}/stage`, payload);
    });
  },

  /**
   * PUT /api/v1/pipeline/opportunities/{id}
   * Mettre à jour les informations d'une opportunité
   */
  async updateDetails(
    id: string,
    payload: UpdateOpportunityRequest
  ): Promise<OpportunityResponse> {
    return executeWithPermission('pipeline:update_opportunity', async () => {
      return apiPut<OpportunityResponse>(`/api/v1/pipeline/opportunities/${id}`, payload);
    });
  },

  /**
   * GET /api/v1/pipeline/overview
   * Vue d'ensemble du Pipeline & Agrégats financiers
   */
  async getOverview(): Promise<PipelineOverviewResponse> {
    return apiGet<PipelineOverviewResponse>('/api/v1/pipeline/overview');
  },

  // ==========================================================================
  // High-Level UI Adapted Methods
  // ==========================================================================

  async getOpportunities(): Promise<Opportunity[]> {
    try {
      const res = await this.getAll({ size: 100 });
      if (res?.items && res.items.length > 0) {
        return res.items.map(mapBackendToOpportunity);
      }
    } catch {
      // Fallback
    }
    return loadLocalOpportunities();
  },

  async createOpportunity(data: {
    title: string;
    prospectId: string;
    prospectName: string;
    companyName: string;
    value: number;
    stage: PipelineStage;
    probability?: number;
    expectedCloseDate?: string;
  }): Promise<Opportunity> {
    const stageMap: Record<PipelineStage, OpportunityStageBackend> = {
      new: 'NEW',
      contacted: 'NEW',
      qualified: 'QUALIFICATION',
      meeting: 'QUALIFICATION',
      proposal: 'PROPOSAL',
      negotiation: 'NEGOTIATION',
      won: 'WON',
      lost: 'LOST',
    };

    try {
      const dto = await this.create({
        title: data.title,
        prospectId: data.prospectId,
        companyName: data.companyName,
        estimatedValue: data.value,
        currency: 'XOF',
        stage: stageMap[data.stage] || 'NEW',
        winProbability: data.probability || 50,
        expectedCloseDate:
          data.expectedCloseDate ||
          new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      });
      return mapBackendToOpportunity(dto);
    } catch {
      const list = loadLocalOpportunities();
      const newOpp: Opportunity = {
        id: `opp-${Date.now()}`,
        title: data.title,
        prospectId: data.prospectId,
        prospectName: data.prospectName,
        companyName: data.companyName,
        value: data.value,
        stage: data.stage,
        probability: data.probability || 50,
        lastActivityAt: new Date().toISOString(),
        expectedCloseDate:
          data.expectedCloseDate ||
          new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      };
      list.unshift(newOpp);
      saveLocalOpportunities(list);
      return newOpp;
    }
  },

  async updateOpportunityStage(id: string, stage: PipelineStage): Promise<Opportunity> {
    const stageMap: Record<PipelineStage, OpportunityStageBackend> = {
      new: 'NEW',
      contacted: 'NEW',
      qualified: 'QUALIFICATION',
      meeting: 'QUALIFICATION',
      proposal: 'PROPOSAL',
      negotiation: 'NEGOTIATION',
      won: 'WON',
      lost: 'LOST',
    };

    try {
      const dto = await this.updateStage(id, {
        stage: stageMap[stage] || 'NEW',
      });
      return mapBackendToOpportunity(dto);
    } catch {
      const list = loadLocalOpportunities();
      const index = list.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Opportunité introuvable');
      list[index].stage = stage;
      list[index].lastActivityAt = new Date().toISOString();
      saveLocalOpportunities(list);
      return list[index];
    }
  },
};
