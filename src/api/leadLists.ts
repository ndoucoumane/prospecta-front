import { apiGet, apiPost, apiDelete, executeWithPermission } from './client';
import type {
  CreateLeadListRequest,
  LeadListResponse,
  LeadListProspectDto,
  PageResponse,
} from '../types/api';

const STORAGE_KEY = 'prospecta_lead_lists';

const INITIAL_LEAD_LISTS: LeadListResponse[] = [
  {
    id: 'list-1',
    name: 'Décideurs Télécoms Sénégal',
    description: "Liste de prospection ciblée pour le lancement de l'offre Enterprise",
    prospectCount: 14,
    createdAt: '2026-09-11T10:15:00Z',
    updatedAt: '2026-09-11T10:18:00Z',
  },
  {
    id: 'list-2',
    name: 'Directeurs Financiers UEMOA',
    description: 'Campagne Fintech & Banques Q4',
    prospectCount: 8,
    createdAt: '2026-09-10T14:20:00Z',
    updatedAt: '2026-09-10T14:20:00Z',
  },
];

function loadLocalLists(): LeadListResponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [...INITIAL_LEAD_LISTS];
}

function saveLocalLists(lists: LeadListResponse[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export const leadListsApi = {
  // ==========================================================================
  // Direct Backend REST Endpoints (/api/v1/lead-lists)
  // ==========================================================================

  /**
   * POST /api/v1/lead-lists
   * Créer une nouvelle liste de prospects
   */
  async createList(payload: CreateLeadListRequest): Promise<LeadListResponse> {
    return executeWithPermission('lead_list:manage', async () => {
      try {
        return await apiPost<LeadListResponse>('/api/v1/lead-lists', payload);
      } catch {
        const lists = loadLocalLists();
        const newList: LeadListResponse = {
          id: `list-${Date.now()}`,
          name: payload.name,
          description: payload.description || '',
          prospectCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        lists.unshift(newList);
        saveLocalLists(lists);
        return newList;
      }
    });
  },

  /**
   * GET /api/v1/lead-lists
   * Lister les listes de prospects (Paginé)
   */
  async getAllLists(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<LeadListResponse>> {
    try {
      return await apiGet<PageResponse<LeadListResponse>>('/api/v1/lead-lists', {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sort: params?.sort ?? 'createdAt,desc',
      });
    } catch {
      const lists = loadLocalLists();
      return {
        items: lists,
        page: 0,
        size: 20,
        totalElements: lists.length,
        totalPages: 1,
        first: true,
        last: true,
      };
    }
  },

  /**
   * GET /api/v1/lead-lists/{id}
   * Consulter le détail d'une liste
   */
  async getListById(id: string): Promise<LeadListResponse> {
    try {
      return await apiGet<LeadListResponse>(`/api/v1/lead-lists/${id}`);
    } catch {
      const lists = loadLocalLists();
      const found = lists.find((l) => l.id === id);
      if (found) return found;
      throw new Error(`Liste introuvable : ${id}`);
    }
  },

  /**
   * GET /api/v1/lead-lists/{id}/prospects
   * Obtenir les prospects rattachés à une liste (Paginé)
   */
  async getListProspects(
    listId: string,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<LeadListProspectDto>> {
    try {
      return await apiGet<PageResponse<LeadListProspectDto>>(
        `/api/v1/lead-lists/${listId}/prospects`,
        {
          page: params?.page ?? 0,
          size: params?.size ?? 25,
        }
      );
    } catch {
      return {
        items: [
          {
            id: 'pros-demo-1',
            firstName: 'Amadou',
            lastName: 'Diallo',
            email: 'amadou.diallo@sonatel.sn',
            phone: '+221771234567',
            jobTitle: 'Directeur Général B2B',
            companyName: 'Sonatel',
            status: 'QUALIFIED',
            score: 88,
            scoreLevel: 'HOT',
            createdAt: '2026-09-11T10:16:00Z',
          },
        ],
        page: 0,
        size: 25,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
      };
    }
  },

  /**
   * POST /api/v1/lead-lists/{id}/prospects
   * Ajouter des prospects à une liste
   */
  async addProspectsToList(listId: string, prospectIds: string[]): Promise<void> {
    return executeWithPermission('lead_list:manage', async () => {
      try {
        await apiPost<void>(`/api/v1/lead-lists/${listId}/prospects`, prospectIds);
      } catch {
        const lists = loadLocalLists();
        const l = lists.find((item) => item.id === listId);
        if (l) {
          l.prospectCount += prospectIds.length;
          l.updatedAt = new Date().toISOString();
          saveLocalLists(lists);
        }
      }
    });
  },

  /**
   * DELETE /api/v1/lead-lists/{id}/prospects/{prospectId}
   * Retirer un prospect d'une liste
   */
  async removeProspectFromList(listId: string, prospectId: string): Promise<void> {
    return executeWithPermission('lead_list:manage', async () => {
      try {
        await apiDelete<void>(`/api/v1/lead-lists/${listId}/prospects/${prospectId}`);
      } catch {
        const lists = loadLocalLists();
        const l = lists.find((item) => item.id === listId);
        if (l && l.prospectCount > 0) {
          l.prospectCount -= 1;
          l.updatedAt = new Date().toISOString();
          saveLocalLists(lists);
        }
      }
    });
  },
};
