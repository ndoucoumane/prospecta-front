import { useMemo } from 'react';
import { useAuth } from '../app/providers/AuthProvider';
import {
  hasPermission,
  normalizeUserRole,
  type AppPermission,
  assertPermission,
} from './permissions';
import type { UserRole } from '../types/api';

export interface UsePermissionReturn {
  role: UserRole;
  can: (permission: AppPermission) => boolean;
  assertCan: (permission: AppPermission) => void;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  isSalesManager: boolean;
  isSalesRep: boolean;
  isViewer: boolean;
}

export function usePermission(): UsePermissionReturn {
  const { user } = useAuth();

  const role: UserRole = useMemo(() => {
    return normalizeUserRole(user?.role);
  }, [user?.role]);

  const can = useMemo(() => {
    return (permission: AppPermission) => hasPermission(role, permission);
  }, [role]);

  const assertCan = useMemo(() => {
    return (permission: AppPermission) => assertPermission(permission, role);
  }, [role]);

  return {
    role,
    can,
    assertCan,
    isSuperAdmin: role === 'SUPER_ADMIN',
    isOrgAdmin: role === 'ORG_ADMIN' || role === 'SUPER_ADMIN',
    isSalesManager: role === 'SALES_MANAGER',
    isSalesRep: role === 'SALES_REP',
    isViewer: role === 'VIEWER',
  };
}
