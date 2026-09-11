import { apiGet, apiPost, apiPatch, executeWithPermission } from './client';
import type { IcpResponse, CreateIcpRequest, UpdateIcpRequest } from '../types/api';

export const icpApi = {
  /**
   * POST /api/v1/icp
   * Créer un profil ICP
   */
  async createIcp(payload: CreateIcpRequest): Promise<IcpResponse> {
    return executeWithPermission('icp:manage', async () => {
      return apiPost<IcpResponse>('/api/v1/icp', payload);
    });
  },

  /**
   * GET /api/v1/icp/active
   * Récupérer l'ICP actif de l'organisation (utilisé par le moteur de Lead Scoring)
   */
  async getActiveIcp(): Promise<IcpResponse> {
    return apiGet<IcpResponse>('/api/v1/icp/active');
  },

  /**
   * PATCH /api/v1/icp/{id}
   * Mettre à jour les critères ICP
   */
  async updateIcp(id: string, payload: UpdateIcpRequest): Promise<IcpResponse> {
    return executeWithPermission('icp:manage', async () => {
      return apiPatch<IcpResponse>(`/api/v1/icp/${id}`, payload);
    });
  },
};
