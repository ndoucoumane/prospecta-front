import { apiGet, apiPatch } from './client';
import type {
  UserProfileResponse,
  UpdateUserProfileRequest,
  PageResponse,
} from '../types/api';

export const usersApi = {
  /**
   * GET /api/v1/users/me
   * Récupérer le profil connecté
   */
  async getCurrentUserProfile(): Promise<UserProfileResponse> {
    return apiGet<UserProfileResponse>('/api/v1/users/me');
  },

  /**
   * PATCH /api/v1/users/me
   * Mettre à jour son profil utilisateur
   */
  async updateCurrentUserProfile(payload: UpdateUserProfileRequest): Promise<UserProfileResponse> {
    return apiPatch<UserProfileResponse>('/api/v1/users/me', payload);
  },

  /**
   * GET /api/v1/users
   * Lister les membres de l'équipe (Espace de travail) avec pagination
   */
  async getUsers(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<UserProfileResponse>> {
    return apiGet<PageResponse<UserProfileResponse>>('/api/v1/users', {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sort: params?.sort ?? 'createdAt,desc',
    });
  },
};
