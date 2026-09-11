import type { UserRole } from '../types/api';
import { SecurityPermissionError } from './SecurityError';

export type AppPermission =
  // Workspace / Organisation
  | 'org:update'
  // Billing & Stripe
  | 'billing:manage'
  | 'billing:view'
  // Team & Users
  | 'team:manage'
  | 'team:view'
  // Prospects
  | 'prospect:create'
  | 'prospect:update'
  | 'prospect:delete'
  | 'prospect:score'
  | 'prospect:import'
  | 'prospect:enrich'
  // Target Companies
  | 'company:create'
  | 'company:update'
  | 'company:analyze'
  // ICP
  | 'icp:manage'
  // Campaigns
  | 'campaign:create'
  | 'campaign:launch'
  | 'campaign:pause'
  | 'campaign:delete'
  // Inbox & Conversations
  | 'conversation:send'
  | 'conversation:ai_reply'
  // Pipeline & Opportunities
  | 'pipeline:create_opportunity'
  | 'pipeline:update_stage'
  | 'pipeline:update_opportunity'
  // Discovery (Apollo)
  | 'discovery:search'
  | 'discovery:import'
  // Lead Lists
  | 'lead_list:manage';

/**
 * Strict Role-Based Access Control (RBAC) Permission Matrix
 */
export const ROLE_PERMISSIONS_MAP: Record<UserRole, AppPermission[]> = {
  SUPER_ADMIN: [
    'org:update',
    'billing:manage',
    'billing:view',
    'team:manage',
    'team:view',
    'prospect:create',
    'prospect:update',
    'prospect:delete',
    'prospect:score',
    'prospect:import',
    'prospect:enrich',
    'company:create',
    'company:update',
    'company:analyze',
    'icp:manage',
    'campaign:create',
    'campaign:launch',
    'campaign:pause',
    'campaign:delete',
    'conversation:send',
    'conversation:ai_reply',
    'pipeline:create_opportunity',
    'pipeline:update_stage',
    'pipeline:update_opportunity',
    'discovery:search',
    'discovery:import',
    'lead_list:manage',
  ],

  ORG_ADMIN: [
    'org:update',
    'billing:manage',
    'billing:view',
    'team:manage',
    'team:view',
    'prospect:create',
    'prospect:update',
    'prospect:delete',
    'prospect:score',
    'prospect:import',
    'prospect:enrich',
    'company:create',
    'company:update',
    'company:analyze',
    'icp:manage',
    'campaign:create',
    'campaign:launch',
    'campaign:pause',
    'campaign:delete',
    'conversation:send',
    'conversation:ai_reply',
    'pipeline:create_opportunity',
    'pipeline:update_stage',
    'pipeline:update_opportunity',
    'discovery:search',
    'discovery:import',
    'lead_list:manage',
  ],

  SALES_MANAGER: [
    'billing:view',
    'team:view',
    'prospect:create',
    'prospect:update',
    'prospect:delete',
    'prospect:score',
    'prospect:import',
    'prospect:enrich',
    'company:create',
    'company:update',
    'company:analyze',
    'icp:manage',
    'campaign:create',
    'campaign:launch',
    'campaign:pause',
    'campaign:delete',
    'conversation:send',
    'conversation:ai_reply',
    'pipeline:create_opportunity',
    'pipeline:update_stage',
    'pipeline:update_opportunity',
    'discovery:search',
    'discovery:import',
    'lead_list:manage',
  ],

  SALES_REP: [
    'billing:view',
    'team:view',
    'prospect:create',
    'prospect:update',
    'prospect:score',
    'prospect:import',
    'prospect:enrich',
    'company:create',
    'company:update',
    'company:analyze',
    'conversation:send',
    'conversation:ai_reply',
    'pipeline:create_opportunity',
    'pipeline:update_stage',
    'pipeline:update_opportunity',
    'discovery:search',
    'discovery:import',
    'lead_list:manage',
  ],

  VIEWER: [
    'billing:view',
    'team:view',
  ],
};

/**
 * Normalise les chaînes de rôle backend ou UI vers un UserRole standardisé
 */
export function normalizeUserRole(rawRole?: string | null): UserRole {
  if (!rawRole) return 'VIEWER';
  const r = rawRole.toUpperCase().trim();
  if (r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (r === 'ORG_ADMIN' || r === 'ADMINISTRATEUR COMMERCIAL' || r === 'ADMIN') return 'ORG_ADMIN';
  if (r === 'SALES_MANAGER' || r === 'DIRECTEUR COMMERCIAL' || r === 'MANAGER') return 'SALES_MANAGER';
  if (r === 'SALES_REP' || r === 'COMMERCIAL' || r === 'SALES') return 'SALES_REP';
  if (r === 'VIEWER' || r === 'LECTEUR') return 'VIEWER';
  return 'SALES_REP'; // rôle par défaut pour un commercial
}

/**
 * Lit le rôle de l'utilisateur actuellement stocké localement
 */
export function getCurrentSessionRole(): UserRole {
  try {
    const rawUser = localStorage.getItem('prospecta_current_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      return normalizeUserRole(parsed.role);
    }
  } catch {
    // ignore parse error
  }
  return 'ORG_ADMIN'; // Fallback par défaut si non renseigné
}

/**
 * Vérifie si un rôle possède une permission spécifique
 */
export function hasPermission(role: UserRole, permission: AppPermission): boolean {
  const allowed = ROLE_PERMISSIONS_MAP[role] || [];
  return allowed.includes(permission);
}

/**
 * Pré-vol de sécurité obligatoire : lève une SecurityPermissionError
 * si le rôle session actuel ne détient pas la permission requise.
 */
export function assertPermission(permission: AppPermission, customRole?: UserRole): void {
  const role = customRole || getCurrentSessionRole();
  if (!hasPermission(role, permission)) {
    throw new SecurityPermissionError(permission, role);
  }
}
