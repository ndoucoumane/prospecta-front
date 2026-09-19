import { apiGet, apiPost } from './client';
import type { User, Organization } from '../types';
import type {
  AuthResponse,
  AuthUserResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/api';
import { initialOrganization } from './mockData';
import { usersApi } from './users';
import { organizationsApi } from './organizations';

const USER_STORAGE_KEY = 'prospecta_current_user';
const ORG_STORAGE_KEY = 'prospecta_organization';
const TOKEN_KEY = 'prospecta_token';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const authApi = {
  /**
   * Connexion utilisateur (POST /api/v1/auth/login)
   * Authentifie auprès de Keycloak et stocke les jetons d'accès JWT.
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await apiPost<AuthResponse, LoginRequest>('/api/v1/auth/login', {
      email,
      password,
    });

    const token = res.token.access_token;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    if (res.token.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, res.token.refresh_token);
    }

    const mappedUser: User = {
      id: res.user.id,
      email: res.user.email,
      firstName: res.user.firstName,
      lastName: res.user.lastName,
      role: res.user.role || 'ORG_ADMIN',
      organizationId: res.user.organizationId,
      organizationName: 'Mon Organisation',
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mappedUser));

    // Récupérer l'organisation active pour afficher le vrai nom de l'espace
    try {
      const org = await this.getOrganization();
      if (org?.name) {
        mappedUser.organizationName = org.name;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mappedUser));
      }
    } catch {
      // Poursuivre avec le nom par défaut si l'appel échoue temporairement
    }

    return { user: mappedUser, token };
  },

  /**
   * Inscription d'un nouvel utilisateur (POST /api/v1/auth/register)
   * Crée l'utilisateur dans Keycloak, initialise l'organisation et retourne les jetons JWT.
   */
  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    organizationName?: string;
    password: string;
    phone?: string;
  }): Promise<{ user: User; token: string }> {
    const payload: RegisterRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      companyName: data.organizationName || `${data.firstName} ${data.lastName}`.trim() || 'Mon Organisation',
      phone: data.phone || undefined,
    };

    const res = await apiPost<AuthResponse, RegisterRequest>('/api/v1/auth/register', payload);

    const token = res.token.access_token;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    if (res.token.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, res.token.refresh_token);
    }

    const mappedUser: User = {
      id: res.user.id,
      email: res.user.email,
      firstName: res.user.firstName,
      lastName: res.user.lastName,
      role: res.user.role || 'ORG_ADMIN',
      organizationId: res.user.organizationId,
      organizationName: data.organizationName || 'Mon Organisation',
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mappedUser));

    try {
      const org = await this.getOrganization();
      if (org?.name) {
        mappedUser.organizationName = org.name;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mappedUser));
      }
    } catch {
      // ignore
    }

    return { user: mappedUser, token };
  },

  /**
   * Récupère le profil connecté : tente GET /api/v1/auth/me avec le JWT Keycloak,
   * puis GET /api/v1/users/me, et en dernier ressort le cache local.
   */
  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;

    try {
      // 1.1.3 Profil Utilisateur Connecté (Me) : GET /api/v1/auth/me
      const profile = await apiGet<AuthUserResponse>('/api/v1/auth/me');
      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          role: profile.role || 'ORG_ADMIN',
          organizationId: profile.organizationId,
          organizationName: 'Mon Organisation',
        };

        const storedOrg = localStorage.getItem(ORG_STORAGE_KEY);
        if (storedOrg) {
          try {
            const org = JSON.parse(storedOrg);
            if (org.name) user.organizationName = org.name;
          } catch {
            // ignore
          }
        }

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        return user;
      }
    } catch {
      // Repli sur GET /api/v1/users/me
      try {
        const userProfile = await usersApi.getCurrentUserProfile();
        if (userProfile) {
          const user: User = {
            id: userProfile.id,
            email: userProfile.email,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            role: userProfile.role || 'ORG_ADMIN',
            organizationId: userProfile.organizationId,
            organizationName: 'Mon Organisation',
          };
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          return user;
        }
      } catch {
        // Repli cache local
      }
    }

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Récupère l'organisation active : GET /api/v1/organizations/current, sinon repli local
   */
  async getOrganization(): Promise<Organization> {
    try {
      const orgResponse = await organizationsApi.getCurrentOrganization();
      if (orgResponse) {
        const org: Organization = {
          id: orgResponse.id,
          name: orgResponse.name,
          currency: orgResponse.currency || 'FCFA',
          timezone: orgResponse.timezone || 'Africa/Dakar',
          country: orgResponse.country || 'Sénégal',
          phonePrefix: '+221',
          whatsappConnected: true,
        };
        localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(org));
        return org;
      }
    } catch {
      // Fallback
    }

    const storedOrg = localStorage.getItem(ORG_STORAGE_KEY);
    if (storedOrg) {
      try {
        return JSON.parse(storedOrg);
      } catch {
        return initialOrganization;
      }
    }
    return initialOrganization;
  },

  /**
   * Mettre à jour l'organisation active
   */
  async updateOrganization(updates: Partial<Organization>): Promise<Organization> {
    const current = await this.getOrganization();
    try {
      if (current.id) {
        await organizationsApi.updateOrganization(current.id, {
          name: updates.name,
          timezone: updates.timezone,
          currency: updates.currency,
        });
      }
    } catch {
      // Continue locally
    }

    const updated = { ...current, ...updates };
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Déconnexion complète : purge les jetons et sessions
   */
  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ORG_STORAGE_KEY);
  },
};
