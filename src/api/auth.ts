import type { User, Organization } from '../types';
import { initialUser, initialOrganization } from './mockData';

const USER_STORAGE_KEY = 'prospecta_current_user';
const ORG_STORAGE_KEY = 'prospecta_organization';
const TOKEN_KEY = 'prospecta_token';

export const authApi = {
  async login(email: string, _password: string): Promise<{ user: User; token: string }> {
    // Simulates auth check & returns session
    await new Promise((r) => setTimeout(r, 400));
    
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const user: User = storedUser ? JSON.parse(storedUser) : { ...initialUser, email };
    const token = 'mock_jwt_token_for_' + user.id;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return { user, token };
  },

  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    organizationName: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    await new Promise((r) => setTimeout(r, 500));

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

    const token = 'mock_jwt_token_for_' + newUser.id;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(newOrg));

    return { user: newUser, token };
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

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

  async getOrganization(): Promise<Organization> {
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
    const updated = { ...current, ...updates };
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};
