/**
 * Custom error thrown when an action is rejected on the client side
 * due to insufficient role permissions (pre-flight check).
 */
export class SecurityPermissionError extends Error {
  public readonly requiredPermission: string;
  public readonly currentRole: string;
  public readonly timestamp: string;

  constructor(requiredPermission: string, currentRole: string, customMessage?: string) {
    const message =
      customMessage ||
      `Accès refusé : L'opération requiert la permission "${requiredPermission}", mais votre rôle actuel est "${currentRole}".`;
    super(message);
    this.name = 'SecurityPermissionError';
    this.requiredPermission = requiredPermission;
    this.currentRole = currentRole;
    this.timestamp = new Date().toISOString();

    // Fix prototype chain for custom Error subclass
    Object.setPrototypeOf(this, SecurityPermissionError.prototype);
  }
}
