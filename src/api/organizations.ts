import { apiGet, apiPost, apiPatch, executeWithPermission } from './client';
import type {
  OrganizationResponse,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '../types/api';

export const organizationsApi = {
  /**
   * POST /api/v1/organizations
   * Créer une nouvelle organisation (Espace de travail)
   */
  async createOrganization(payload: CreateOrganizationRequest): Promise<OrganizationResponse> {
    return apiPost<OrganizationResponse>('/api/v1/organizations', payload);
  },

  /**
   * GET /api/v1/organizations/current
   * Récupérer l'organisation active de l'utilisateur connecté
   */
  async getCurrentOrganization(): Promise<OrganizationResponse> {
    return apiGet<OrganizationResponse>('/api/v1/organizations/current');
  },

  /**
   * GET /api/v1/organizations/{id}
   * Récupérer une organisation par son ID
   */
  async getOrganizationById(id: string): Promise<OrganizationResponse> {
    return apiGet<OrganizationResponse>(`/api/v1/organizations/${id}`);
  },

  /**
   * PATCH /api/v1/organizations/{id}
   * Mettre à jour les paramètres de l'organisation (Rôle requis: ORG_ADMIN ou SUPER_ADMIN)
   */
  async updateOrganization(
    id: string,
    payload: UpdateOrganizationRequest
  ): Promise<OrganizationResponse> {
    return executeWithPermission('org:update', async () => {
      return apiPatch<OrganizationResponse>(`/api/v1/organizations/${id}`, payload);
    });
  },
};
