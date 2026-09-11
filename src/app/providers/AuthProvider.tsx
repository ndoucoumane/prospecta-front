import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { User, Organization } from '../../types';
import type { UserRole } from '../../types/api';
import { authApi } from '../../api';
import { normalizeUserRole, hasPermission as checkPermission, type AppPermission } from '../../security';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  can: (permission: AppPermission) => boolean;
  hasPermission: (permission: AppPermission) => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    organizationName: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  reloadOrganization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const role: UserRole = useMemo(() => {
    return normalizeUserRole(user?.role);
  }, [user?.role]);

  const can = useCallback(
    (permission: AppPermission) => checkPermission(role, permission),
    [role]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setOrganization(null);
    }
  }, []);

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await authApi.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const org = await authApi.getOrganization();
          setOrganization(org);
        }
      } catch (err) {
        console.error('Failed to initialize auth', err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();

    // Ecouter les signaux globaux de sécurité émis par l'intercepteur API
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('prospecta:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('prospecta:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      setUser(res.user);
      const org = await authApi.getOrganization();
      setOrganization(org);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    organizationName: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authApi.signup(data);
      setUser(res.user);
      const org = await authApi.getOrganization();
      setOrganization(org);
    } finally {
      setIsLoading(false);
    }
  };

  const reloadOrganization = async () => {
    const org = await authApi.getOrganization();
    setOrganization(org);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        role,
        isAuthenticated: !!user,
        isLoading,
        can,
        hasPermission: can,
        login,
        signup,
        logout,
        reloadOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
