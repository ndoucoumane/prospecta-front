import { apiGet, apiPost, apiDelete, executeWithPermission } from './client';
import type { Campaign, CampaignStatus, Channel } from '../types';
import type {
  CampaignResponse,
  CampaignStepDto,
  CreateCampaignRequest,
  AttachProspectsRequest,
  AttachProspectsResponse,
  ChannelType,
} from '../types/api';
import { initialCampaigns } from './mockData';

const STORAGE_KEY = 'prospecta_campaigns';

function loadLocalCampaigns(): Campaign[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...initialCampaigns];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCampaigns));
  return [...initialCampaigns];
}

function saveLocalCampaigns(campaigns: Campaign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

export function mapBackendToCampaign(dto: CampaignResponse): Campaign {
  const statusMap: Record<string, CampaignStatus> = {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    RUNNING: 'active',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    ARCHIVED: 'completed',
  };

  const channels: Channel[] = dto.steps
    ? Array.from(new Set(dto.steps.map((s) => s.channel.toLowerCase() as Channel)))
    : ['email'];

  return {
    id: dto.id,
    name: dto.name,
    objective: dto.description || 'Développement commercial B2B',
    icp: 'Entreprises UEMOA',
    status: statusMap[dto.status] || 'draft',
    channels,
    totalProspects: dto.totalProspects ?? 0,
    sentCount: dto.sentCount ?? 0,
    replyCount: dto.replyCount ?? 0,
    meetingCount: dto.meetingCount ?? 0,
    createdAt: dto.createdAt || new Date().toISOString(),
    updatedAt: dto.updatedAt || new Date().toISOString(),
    steps: (dto.steps || []).map((step, idx) => ({
      stepNumber: step.position || idx + 1,
      channel: (step.channel?.toLowerCase() as Channel) || 'whatsapp',
      delayDays: Math.round((step.delayMinutes || 0) / 1440),
      subject: step.subjectTemplate || undefined,
      content: step.contentTemplate || '',
    })),
  };
}

export const campaignsApi = {
  // ==========================================================================
  // Direct Backend REST Endpoints (/api/v1/campaigns)
  // ==========================================================================

  /**
   * POST /api/v1/campaigns
   * Créer une campagne
   */
  async create(payload: CreateCampaignRequest): Promise<CampaignResponse> {
    return executeWithPermission('campaign:create', async () => {
      return apiPost<CampaignResponse>('/api/v1/campaigns', payload);
    });
  },

  /**
   * POST /api/v1/campaigns/{id}/steps
   * Configurer les étapes de la séquence
   */
  async configureSteps(
    id: string,
    steps: CampaignStepDto[]
  ): Promise<CampaignResponse> {
    return executeWithPermission('campaign:create', async () => {
      return apiPost<CampaignResponse>(`/api/v1/campaigns/${id}/steps`, steps);
    });
  },

  /**
   * POST /api/v1/campaigns/{id}/prospects
   * Associer des prospects cibles
   */
  async attachProspects(
    id: string,
    payload: AttachProspectsRequest
  ): Promise<AttachProspectsResponse> {
    return executeWithPermission('campaign:create', async () => {
      return apiPost<AttachProspectsResponse>(`/api/v1/campaigns/${id}/prospects`, payload);
    });
  },

  /**
   * POST /api/v1/campaigns/{id}/launch
   * Lancer la campagne
   */
  async launch(id: string): Promise<CampaignResponse> {
    return executeWithPermission('campaign:launch', async () => {
      return apiPost<CampaignResponse>(`/api/v1/campaigns/${id}/launch`);
    });
  },

  /**
   * POST /api/v1/campaigns/{id}/pause
   * Mettre en pause la campagne
   */
  async pause(id: string): Promise<CampaignResponse> {
    return executeWithPermission('campaign:pause', async () => {
      return apiPost<CampaignResponse>(`/api/v1/campaigns/${id}/pause`);
    });
  },

  /**
   * GET /api/v1/campaigns/{id}
   */
  async getById(id: string): Promise<CampaignResponse> {
    return apiGet<CampaignResponse>(`/api/v1/campaigns/${id}`);
  },

  /**
   * GET /api/v1/campaigns
   */
  async getAll(): Promise<CampaignResponse[]> {
    return apiGet<CampaignResponse[]>('/api/v1/campaigns');
  },

  /**
   * DELETE /api/v1/campaigns/{id}
   */
  async delete(id: string): Promise<void> {
    return executeWithPermission('campaign:delete', async () => {
      return apiDelete<void>(`/api/v1/campaigns/${id}`);
    });
  },

  // ==========================================================================
  // High-Level UI Adapted Methods
  // ==========================================================================

  async getCampaigns(): Promise<Campaign[]> {
    try {
      const res = await this.getAll();
      if (Array.isArray(res) && res.length > 0) {
        return res.map(mapBackendToCampaign);
      }
    } catch {
      // Fallback
    }
    return loadLocalCampaigns();
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    try {
      const dto = await this.getById(id);
      if (dto) return mapBackendToCampaign(dto);
    } catch {
      // Fallback
    }
    const list = loadLocalCampaigns();
    return list.find((c) => c.id === id) || null;
  },

  /**
   * Orchestre la création complète d'une campagne :
   * 1. POST /campaigns
   * 2. POST /campaigns/{id}/steps
   * 3. POST /campaigns/{id}/prospects
   * 4. POST /campaigns/{id}/launch (si statut actif)
   */
  async createCampaign(data: {
    name: string;
    objective: string;
    icp: string;
    targetAudience?: string;
    channels: Campaign['channels'];
    totalProspects: number;
    steps: Campaign['steps'];
    prospectIds?: string[];
    status?: CampaignStatus;
  }): Promise<Campaign> {
    try {
      // 1. Create base campaign
      const createdCampaign = await this.create({
        name: data.name,
        description: data.objective,
        channelStrategy: data.channels.includes('whatsapp') ? 'WHATSAPP_FIRST' : 'EMAIL_FIRST',
      });

      // 2. Configure steps
      const stepsDto: CampaignStepDto[] = data.steps.map((step, idx) => ({
        position: step.stepNumber || idx + 1,
        channel: step.channel.toUpperCase() as ChannelType,
        delayMinutes: (step.delayDays || 0) * 1440,
        subjectTemplate: step.subject || null,
        contentTemplate: step.content,
        enabled: true,
      }));

      await this.configureSteps(createdCampaign.id, stepsDto);

      // 3. Attach prospects if provided
      if (data.prospectIds && data.prospectIds.length > 0) {
        await this.attachProspects(createdCampaign.id, { prospectIds: data.prospectIds });
      }

      // 4. Launch if active
      if (data.status === 'active') {
        await this.launch(createdCampaign.id);
      }

      const freshCampaign = await this.getById(createdCampaign.id);
      return mapBackendToCampaign(freshCampaign);
    } catch {
      // Offline fallback
      const list = loadLocalCampaigns();
      const newCampaign: Campaign = {
        id: `camp-${Date.now()}`,
        name: data.name,
        objective: data.objective,
        icp: data.icp,
        targetAudience: data.targetAudience || 'Décideurs B2B',
        channels: data.channels,
        totalProspects: data.totalProspects,
        sentCount: data.status === 'active' ? data.totalProspects : 0,
        replyCount: 0,
        meetingCount: 0,
        status: data.status || 'draft',
        steps: data.steps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.unshift(newCampaign);
      saveLocalCampaigns(list);
      return newCampaign;
    }
  },

  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    try {
      if (status === 'active') {
        const dto = await this.launch(id);
        return mapBackendToCampaign(dto);
      } else if (status === 'paused') {
        const dto = await this.pause(id);
        return mapBackendToCampaign(dto);
      }
    } catch {
      // Fallback
    }

    const list = loadLocalCampaigns();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Campagne introuvable');
    list[index].status = status;
    list[index].updatedAt = new Date().toISOString();
    saveLocalCampaigns(list);
    return list[index];
  },

  async deleteCampaign(id: string): Promise<void> {
    try {
      await this.delete(id);
    } catch {
      // Fallback
    }
    const list = loadLocalCampaigns();
    const filtered = list.filter((c) => c.id !== id);
    saveLocalCampaigns(filtered);
  },
};
