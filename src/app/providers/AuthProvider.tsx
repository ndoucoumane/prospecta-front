import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Organization } from '../../types';
import { authApi } from '../../api';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  }, []);

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

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setOrganization(null);
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
        isAuthenticated: !!user,
        isLoading,
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
