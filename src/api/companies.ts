import { apiGet, apiPost, apiPatch, executeWithPermission } from './client';
import type { Company, CompanyAIAnalysis } from '../types';
import type {
  CompanyResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompanyAiAnalysisResponse,
  PageResponse,
} from '../types/api';
import { initialCompanies } from './mockData';

const STORAGE_KEY = 'prospecta_companies';

function loadLocalCompanies(): Company[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...initialCompanies];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCompanies));
  return [...initialCompanies];
}

function saveLocalCompanies(companies: Company[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

export function mapBackendToCompany(dto: CompanyResponse): Company {
  return {
    id: dto.id,
    name: dto.name,
    sector: dto.industry || 'Technologies & Télécoms',
    city: dto.city || 'Dakar',
    website: dto.website || '',
    size: dto.employeeCount ? `${dto.employeeCount}+` : '50+',
    contactCount: dto.contactCount ?? 1,
    score: dto.score ?? 80,
    phone: dto.phone,
    createdAt: dto.createdAt || new Date().toISOString(),
    aiAnalysis: dto.aiSummary
      ? {
          summary: dto.aiSummary,
          keyPoints: dto.aiPainPoints || [],
          opportunities: ['Déploiement commercial multicanal', 'Automatisation des séquences WhatsApp'],
          recommendedApproach: 'Contacter les décideurs commerciaux avec approche directe ROI.',
          lastAnalyzedAt: dto.aiAnalyzedAt || new Date().toISOString(),
        }
      : undefined,
  };
}

export const companiesApi = {
  // ==========================================================================
  // Direct Backend REST Endpoints (/api/v1/companies)
  // ==========================================================================

  /**
   * POST /api/v1/companies
   */
  async create(payload: CreateCompanyRequest): Promise<CompanyResponse> {
    return executeWithPermission('company:create', async () => {
      return apiPost<CompanyResponse>('/api/v1/companies', payload);
    });
  },

  /**
   * GET /api/v1/companies/{id}
   */
  async getById(id: string): Promise<CompanyResponse> {
    return apiGet<CompanyResponse>(`/api/v1/companies/${id}`);
  },

  /**
   * GET /api/v1/companies
   */
  async getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<CompanyResponse>> {
    return apiGet<PageResponse<CompanyResponse>>('/api/v1/companies', {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sort: params?.sort ?? 'name,asc',
    });
  },

  /**
   * PATCH /api/v1/companies/{id}
   */
  async update(id: string, payload: UpdateCompanyRequest): Promise<CompanyResponse> {
    return executeWithPermission('company:update', async () => {
      return apiPatch<CompanyResponse>(`/api/v1/companies/${id}`, payload);
    });
  },

  /**
   * POST /api/v1/companies/{id}/ai/analyze
   * Analyser l'intelligence web d'une entreprise cible via l'IA
   */
  async analyzeWithAi(id: string): Promise<CompanyAiAnalysisResponse> {
    return executeWithPermission('company:analyze', async () => {
      return apiPost<CompanyAiAnalysisResponse>(`/api/v1/companies/${id}/ai/analyze`);
    });
  },

  // ==========================================================================
  // High-Level UI Adapted Methods
  // ==========================================================================

  async getCompanies(params?: {
    query?: string;
    sector?: string;
    city?: string;
  }): Promise<Company[]> {
    try {
      const res = await this.getAll({ size: 50 });
      if (res?.items) {
        let list = res.items.map(mapBackendToCompany);
        if (params?.query) {
          const q = params.query.toLowerCase().trim();
          list = list.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.sector.toLowerCase().includes(q) ||
              c.city.toLowerCase().includes(q)
          );
        }
        if (params?.sector && params.sector !== 'all') {
          list = list.filter((c) => c.sector.toLowerCase() === params.sector?.toLowerCase());
        }
        if (params?.city && params.city !== 'all') {
          list = list.filter((c) => c.city.toLowerCase() === params.city?.toLowerCase());
        }
        return list;
      }
    } catch {
      // Fallback
    }

    let list = loadLocalCompanies();
    if (params?.query) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }
    if (params?.sector && params.sector !== 'all') {
      list = list.filter((c) => c.sector === params.sector);
    }
    if (params?.city && params.city !== 'all') {
      list = list.filter((c) => c.city.toLowerCase() === params.city?.toLowerCase());
    }
    return list;
  },

  async getCompanyById(id: string): Promise<Company | null> {
    try {
      const dto = await this.getById(id);
      if (dto) return mapBackendToCompany(dto);
    } catch {
      // Fallback
    }
    const list = loadLocalCompanies();
    return list.find((c) => c.id === id) || null;
  },

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    try {
      const dto = await this.update(id, {
        description: updates.sector,
        website: updates.website,
        phone: updates.phone,
      });
      return mapBackendToCompany(dto);
    } catch {
      const list = loadLocalCompanies();
      const index = list.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Entreprise introuvable');
      const updated = { ...list[index], ...updates };
      list[index] = updated;
      saveLocalCompanies(list);
      return updated;
    }
  },

  async refreshAIAnalysis(companyId: string): Promise<CompanyAIAnalysis> {
    try {
      const aiData = await this.analyzeWithAi(companyId);
      const analysis: CompanyAIAnalysis = {
        summary: aiData.summary,
        keyPoints: aiData.painPoints || [],
        opportunities: aiData.opportunities || [],
        recommendedApproach: aiData.recommendedApproach,
        lastAnalyzedAt: new Date().toISOString(),
      };
      // Update locally if cached
      const list = loadLocalCompanies();
      const company = list.find((c) => c.id === companyId);
      if (company) {
        company.aiAnalysis = analysis;
        saveLocalCompanies(list);
      }
      return analysis;
    } catch {
      // Fallback mock
      const list = loadLocalCompanies();
      const company = list.find((c) => c.id === companyId);
      const newAnalysis: CompanyAIAnalysis = {
        summary: `Analyse enrichie pour ${company?.name || 'l\'entreprise'}. Acteur B2B à fort potentiel sur le marché ouest-africain avec opportunité de digitalisation des relances commerciales.`,
        keyPoints: [
          'Cycle de décision impliquant direction générale et commerciale',
          'Intérêt marqué pour l\'automatisation WhatsApp',
        ],
        opportunities: [
          'Réduction de 50% du temps de premier contact commercial',
          'Amélioration du taux de réponse sur mobile',
        ],
        recommendedApproach: 'Privilégier un premier message WhatsApp courtois et direct avec invitation à un échange de 15 minutes.',
        lastAnalyzedAt: new Date().toISOString(),
      };
      if (company) {
        company.aiAnalysis = newAnalysis;
        saveLocalCompanies(list);
      }
      return newAnalysis;
    }
  },
};
