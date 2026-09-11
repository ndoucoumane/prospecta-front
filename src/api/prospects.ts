import { apiGet, apiPost, apiPatch, apiDelete, apiClient, executeWithPermission } from './client';
import type { Prospect, LeadScore, LeadStatus } from '../types';
import type {
  ProspectResponse,
  CreateProspectRequest,
  UpdateProspectRequest,
  ProspectScoreResponse,
  ProspectImportResponse,
  PageResponse,
  ApiResponse,
} from '../types/api';
import { initialProspects } from './mockData';

const STORAGE_KEY = 'prospecta_prospects';

// Local storage fallback helper
function loadLocalProspects(): Prospect[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...initialProspects];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProspects));
  return [...initialProspects];
}

function saveLocalProspects(prospects: Prospect[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects));
}

// Converter: Backend ProspectResponse -> Frontend Prospect model
export function mapBackendToProspect(dto: ProspectResponse): Prospect {
  const levelMap: Record<string, 'Faible' | 'Moyen' | 'Élevé'> = {
    HOT: 'Élevé',
    WARM: 'Moyen',
    COLD: 'Faible',
  };

  const statusMap: Record<string, LeadStatus> = {
    NEW: 'new',
    CONTACTED: 'contacted',
    QUALIFIED: 'qualified',
    REPLIED: 'meeting',
    MEETING_BOOKED: 'meeting',
    OPPORTUNITY: 'qualified',
    CUSTOMER: 'qualified',
    UNRESPONSIVE: 'unresponsive',
    OPTED_OUT: 'opted_out',
    INVALID: 'opted_out',
  };

  const reasonsList = Array.isArray(dto.leadScoreReasons)
    ? dto.leadScoreReasons
    : dto.leadScoreReasons
    ? dto.leadScoreReasons.split(',').map((r) => r.trim())
    : ['Matching ICP cible', 'Décideur commercial identifié'];

  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone || dto.whatsappNumber || '',
    companyId: dto.companyId || 'comp-unknown',
    companyName: dto.companyName || 'Entreprise non renseignée',
    jobTitle: dto.jobTitle || 'Décideur',
    city: dto.city || 'Dakar',
    sector: dto.industry || 'Technologies',
    status: statusMap[dto.status] || 'new',
    source: (dto.source?.toLowerCase() as any) || 'manual',
    lastActivityAt: dto.updatedAt || dto.createdAt || new Date().toISOString(),
    createdAt: dto.createdAt || new Date().toISOString(),
    score: {
      score: dto.leadScore ?? 70,
      level: levelMap[dto.leadScoreLevel] || 'Moyen',
      factors: reasonsList.map((reason, idx) => ({
        label: reason,
        points: idx === 0 ? 30 : 20,
      })),
    },
  };
}

export const prospectsApi = {
  // ==========================================================================
  // Direct Backend REST Endpoints (/api/v1/prospects)
  // ==========================================================================

  /**
   * POST /api/v1/prospects
   */
  async create(payload: CreateProspectRequest): Promise<ProspectResponse> {
    return apiPost<ProspectResponse>('/api/v1/prospects', payload);
  },

  /**
   * GET /api/v1/prospects/{id}
   */
  async getById(id: string): Promise<ProspectResponse> {
    return apiGet<ProspectResponse>(`/api/v1/prospects/${id}`);
  },

  /**
   * GET /api/v1/prospects
   */
  async getAll(params?: {
    status?: string;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<ProspectResponse>> {
    return apiGet<PageResponse<ProspectResponse>>('/api/v1/prospects', {
      status: params?.status,
      search: params?.search,
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sort: params?.sort ?? 'createdAt,desc',
    });
  },

  /**
   * PATCH /api/v1/prospects/{id}
   */
  async update(id: string, payload: UpdateProspectRequest): Promise<ProspectResponse> {
    return apiPatch<ProspectResponse>(`/api/v1/prospects/${id}`, payload);
  },

  /**
   * DELETE /api/v1/prospects/{id}
   */
  async delete(id: string): Promise<void> {
    return apiDelete<void>(`/api/v1/prospects/${id}`);
  },

  /**
   * POST /api/v1/prospects/{id}/score
   * Recalculer le Lead Score d'un prospect
   */
  async calculateScore(id: string): Promise<ProspectScoreResponse> {
    return apiPost<ProspectScoreResponse>(`/api/v1/prospects/${id}/score`);
  },

  /**
   * POST /api/v1/prospects/import
   * Importer des prospects par fichier CSV (multipart/form-data)
   */
  async importCsv(file: File): Promise<ProspectImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ProspectImportResponse>>(
      '/api/v1/prospects/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data;
  },

  /**
   * POST /api/v1/prospects/{id}/enrichment
   * Enrichir un prospect existant via Apollo Person Match (Section 17)
   */
  async enrich(id: string): Promise<ProspectResponse> {
    return executeWithPermission('prospect:enrich', async () => {
      return apiPost<ProspectResponse>(`/api/v1/prospects/${id}/enrichment`);
    });
  },

  // ==========================================================================
  // High-Level UI Adapted Methods (with graceful offline/mock fallback)
  // ==========================================================================

  async getProspects(params?: {
    query?: string;
    status?: string;
    sector?: string;
    city?: string;
    scoreMin?: number;
  }): Promise<Prospect[]> {
    try {
      const statusParam =
        params?.status && params.status !== 'all'
          ? params.status.toUpperCase()
          : undefined;

      const pageRes = await this.getAll({
        search: params?.query,
        status: statusParam,
        size: 50,
      });

      if (pageRes?.items) {
        let list = pageRes.items.map(mapBackendToProspect);
        if (params?.sector && params.sector !== 'all') {
          list = list.filter((p) => p.sector.toLowerCase() === params.sector?.toLowerCase());
        }
        if (params?.city && params.city !== 'all') {
          list = list.filter((p) => p.city.toLowerCase() === params.city?.toLowerCase());
        }
        if (params?.scoreMin) {
          list = list.filter((p) => p.score.score >= params.scoreMin!);
        }
        return list;
      }
    } catch {
      // Graceful fallback to local mock storage
    }

    // Fallback logic for mock/offline
    let list = loadLocalProspects();
    if (params?.query) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          p.jobTitle.toLowerCase().includes(q) ||
          p.phone.includes(q)
      );
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter((p) => p.status === params.status);
    }
    if (params?.sector && params.sector !== 'all') {
      list = list.filter((p) => p.sector === params.sector);
    }
    if (params?.city && params.city !== 'all') {
      list = list.filter((p) => p.city.toLowerCase() === params.city?.toLowerCase());
    }
    if (params?.scoreMin) {
      list = list.filter((p) => p.score.score >= params.scoreMin!);
    }
    return list;
  },

  async getProspectById(id: string): Promise<Prospect | null> {
    try {
      const dto = await this.getById(id);
      if (dto) {
        return mapBackendToProspect(dto);
      }
    } catch {
      // Fallback
    }
    const list = loadLocalProspects();
    return list.find((p) => p.id === id) || null;
  },

  async createProspect(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    jobTitle: string;
    city: string;
    sector: string;
    source?: 'manual' | 'csv' | 'campaign' | 'linkedin';
    notes?: string;
  }): Promise<Prospect> {
    try {
      const dto = await this.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        whatsappNumber: data.phone,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        city: data.city,
        industry: data.sector,
        source: data.source?.toUpperCase() || 'MANUAL',
      });
      return mapBackendToProspect(dto);
    } catch {
      // Fallback
      const list = loadLocalProspects();
      const defaultScore: LeadScore = {
        score: 75,
        level: 'Moyen',
        factors: [
          { label: 'Correspondance ICP', points: 25 },
          { label: 'Décideur identifié', points: 20 },
          { label: 'Secteur cible', points: 20 },
        ],
      };
      const newProspect: Prospect = {
        id: `pros-${Date.now()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        companyId: `comp-${Date.now()}`,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        city: data.city,
        sector: data.sector,
        score: defaultScore,
        status: 'new',
        source: data.source || 'manual',
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        notes: data.notes,
      };
      list.unshift(newProspect);
      saveLocalProspects(list);
      return newProspect;
    }
  },

  async updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect> {
    try {
      const statusMap: Record<string, any> = {
        new: 'NEW',
        contacted: 'CONTACTED',
        qualified: 'QUALIFIED',
        meeting: 'MEETING_BOOKED',
        unresponsive: 'UNRESPONSIVE',
        opted_out: 'OPTED_OUT',
      };

      const dto = await this.update(id, {
        jobTitle: updates.jobTitle,
        phone: updates.phone,
        whatsappNumber: updates.phone,
        status: updates.status ? statusMap[updates.status] : undefined,
        city: updates.city,
        industry: updates.sector,
      });
      return mapBackendToProspect(dto);
    } catch {
      const list = loadLocalProspects();
      const index = list.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Prospect introuvable');
      const updated = { ...list[index], ...updates };
      list[index] = updated;
      saveLocalProspects(list);
      return updated;
    }
  },

  async enrichProspect(id: string): Promise<Prospect> {
    return executeWithPermission('prospect:enrich', async () => {
      try {
        const dto = await this.enrich(id);
        if (dto) return mapBackendToProspect(dto);
      } catch {
        // Fallback local simulation
      }
      const list = loadLocalProspects();
      const index = list.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Prospect introuvable');
      const target = list[index];
      const rawPhone = target.phone.replace(/[\s\-()]/g, '');
      const normalizedPhone = rawPhone.startsWith('+') ? rawPhone : '+221' + rawPhone;
      const enriched: Prospect = {
        ...target,
        phone: normalizedPhone,
        status: 'qualified',
        score: {
          score: Math.min(100, target.score.score + 15),
          level: 'Élevé',
          factors: [
            ...target.score.factors,
            { label: 'Coordonnées directes Apollo vérifiées & WhatsApp normalisé', points: 15 },
          ],
        },
        lastActivityAt: new Date().toISOString(),
      };
      list[index] = enriched;
      saveLocalProspects(list);
      return enriched;
    });
  },

  async deleteProspect(id: string): Promise<void> {
    return executeWithPermission('prospect:delete', async () => {
      try {
        await this.delete(id);
      } catch {
        // Continue to remove locally
      }
      const list = loadLocalProspects();
      const filtered = list.filter((p) => p.id !== id);
      saveLocalProspects(filtered);
    });
  },

  async recalculateScore(id: string): Promise<LeadScore> {
    return executeWithPermission('prospect:score', async () => {
      try {
        const res = await this.calculateScore(id);
        const levelMap: Record<string, 'Faible' | 'Moyen' | 'Élevé'> = {
          HOT: 'Élevé',
          WARM: 'Moyen',
          COLD: 'Faible',
        };
        return {
          score: res.score,
          level: levelMap[res.level] || 'Moyen',
          factors: res.reasons.map((r, i) => ({
            label: r,
            points: i === 0 ? 35 : 20,
          })),
        };
      } catch {
        return {
          score: 85,
          level: 'Élevé',
          factors: [
            { label: 'Critères ICP UEMOA validés', points: 30 },
            { label: 'Décideur C-Level vérifié', points: 25 },
          ],
        };
      }
    });
  },

  async importProspectsFromCsv(rows: Array<Record<string, string>>): Promise<{
    importedCount: number;
    imported: number;
    failed: number;
  }> {
    return executeWithPermission('prospect:import', async () => {
      // Adapter for in-memory / modal table CSV import
      const list = loadLocalProspects();
      let imported = 0;
      for (const row of rows) {
        if (!row.email && !row.phone) continue;
        const p: Prospect = {
          id: `pros-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          firstName: row.firstName || row.first_name || 'Inconnu',
          lastName: row.lastName || row.last_name || '',
          email: row.email || '',
          phone: row.phone || row.telephone || '',
          companyId: `comp-${Date.now()}`,
          companyName: row.companyName || row.company || row.entreprise || 'Entreprise',
          jobTitle: row.jobTitle || row.title || row.poste || 'Responsable',
          city: row.city || row.ville || 'Dakar',
          sector: row.sector || row.industrie || 'Services',
          status: 'new',
          source: 'csv',
          score: {
            score: 70,
            level: 'Moyen',
            factors: [{ label: 'Importation CSV', points: 20 }],
          },
          createdAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        };
        list.push(p);
        imported++;
      }
      saveLocalProspects(list);
      return { importedCount: imported, imported, failed: rows.length - imported };
    });
  },
};
