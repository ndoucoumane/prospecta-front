import type { User, Organization } from '../types';
import { initialUser, initialOrganization } from './mockData';
import { usersApi } from './users';
import { organizationsApi } from './organizations';

const USER_STORAGE_KEY = 'prospecta_current_user';
const ORG_STORAGE_KEY = 'prospecta_organization';
const TOKEN_KEY = 'prospecta_token';
const ACCESS_TOKEN_KEY = 'access_token';

export const authApi = {
  /**
   * Connexion de l'utilisateur (stocke le JWT Keycloak)
   */
  async login(email: string, _password: string): Promise<{ user: User; token: string }> {
    await new Promise((r) => setTimeout(r, 300));

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const user: User = storedUser ? JSON.parse(storedUser) : { ...initialUser, email };
    const token = 'mock_keycloak_jwt_token_for_' + user.id;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return { user, token };
  },

  /**
   * Inscription d'un nouvel utilisateur & création de son espace
   */
  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    organizationName: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    await new Promise((r) => setTimeout(r, 400));

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'Administrateur Commercial',
      organizationId: `org-${Date.now()}`,
      organizationName: data.organizationName,
    };

    const newOrg: Organization = {
      ...initialOrganization,
      id: newUser.organizationId,
      name: data.organizationName,
    };

    const token = 'mock_keycloak_jwt_token_for_' + newUser.id;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(newOrg));

    return { user: newUser, token };
  },

  /**
   * Récupère le profil connecté : tente GET /api/v1/users/me avec le JWT, sinon repli sur le cache local
   */
  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;

    try {
      const profile = await usersApi.getCurrentUserProfile();
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
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        return user;
      }
    } catch {
      // Fallback to local storage
    }

    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return initialUser;
      }
    }
    return initialUser;
  },

  /**
   * Récupère l'organisation active : tente GET /api/v1/organizations/current, sinon repli local
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

  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};
