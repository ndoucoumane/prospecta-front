import React from 'react';
import { usePermission } from './usePermission';
import type { AppPermission } from './permissions';

export interface PermissionGateProps {
  permission: AppPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: 'hide' | 'disable';
  tooltip?: string;
}

/**
 * Composant de garde RBAC pour l'UI :
 * Masque ou désactive les boutons et sections réservés aux rôles autorisés.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null,
  mode = 'hide',
  tooltip,
}) => {
  const { can, role } = usePermission();
  const isAllowed = can(permission);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (mode === 'hide') {
    return <>{fallback}</>;
  }

  // Mode disable : entoure l'élément ou le clone avec attribut désactivé
  const defaultReason = tooltip || `Action non autorisée pour le profil ${role}.`;

  return (
    <span
      className="inline-block cursor-not-allowed opacity-60"
      title={defaultReason}
      aria-disabled="true"
    >
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ disabled?: boolean; tabIndex?: number }>, {
            disabled: true,
            tabIndex: -1,
          })
        : children}
    </span>
  );
};
