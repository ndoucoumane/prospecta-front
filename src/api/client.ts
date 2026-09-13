import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiErrorResponse } from '../types/api';
import { assertPermission, type AppPermission } from '../security/permissions';

// Base URL: configured via Vite env or fallback to local backend port 8085
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8085';

export const KEYCLOAK_CONFIG = {
  authServerUrl: 'https://auth.clatous.com',
  realm: 'clatous-production',
  clientId: 'clatous-backend-prod',
  tokenEndpoint: 'https://auth.clatous.com/realms/clatous-production/protocol/openid-connect/token',
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 25000,
});

// Generate a cryptographically secure random trace UUID according to standard
function generateTraceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'trace-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
}

/**
 * Rafraîchit le jeton d'accès JWT auprès du serveur Keycloak (OpenID Connect Token Endpoint)
 */
export async function refreshAuthToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', KEYCLOAK_CONFIG.clientId);
    params.append('refresh_token', refreshToken);

    const response = await axios.post<{
      access_token: string;
      refresh_token?: string;
      token_type?: string;
      expires_in?: number;
    }>(KEYCLOAK_CONFIG.tokenEndpoint, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    });

    if (response.data?.access_token) {
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken);
      localStorage.setItem('prospecta_token', newAccessToken);

      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }

      return newAccessToken;
    }
  } catch (err) {
    console.warn('[Keycloak] Échec du rafraîchissement du token JWT:', err);
  }

  return null;
}

// Request interceptor: Inject Keycloak JWT Bearer token & X-Trace-Id
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      localStorage.getItem('access_token') || localStorage.getItem('prospecta_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    if (config.headers && !config.headers['X-Trace-Id']) {
      config.headers['X-Trace-Id'] = generateTraceId();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error, handle Keycloak token refresh & security signals
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status || 500;
    const backendError = error.response?.data?.error;
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (backendError) {
      console.error(
        `[Prospecta API Error] [${backendError.code || status}] ${backendError.message} (Trace: ${backendError.traceId || 'N/A'})`,
        backendError.details || ''
      );
      if (backendError.message) {
        error.message = backendError.message;
        if (backendError.details && backendError.details.length > 0) {
          error.message += ` (${backendError.details.join(', ')})`;
        }
      }
    }

    // Gestion du 401 Unauthorized avec rafraîchissement transparent du token Keycloak
    if (status === 401) {
      const isAuthAttempt =
        originalRequest?.url?.includes('/api/v1/auth/login') ||
        originalRequest?.url?.includes('/api/v1/auth/register');

      if (!isAuthAttempt && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const newAccessToken = await refreshAuthToken();

        if (newAccessToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }

        // Si le rafraîchissement échoue, purger la session et notifier l'application
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('prospecta_token');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('prospecta:unauthorized'));
        }
      }
    } else if (status === 403) {
      // Forbidden: role insufficient or cross-tenant violation attempt
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('prospecta:forbidden', {
            detail: backendError || {
              code: 'FORBIDDEN',
              message: 'Accès refusé : permissions insuffisantes pour cette ressource.',
            },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Extrait un message lisible depuis une erreur API ou standard
 */
export function extractApiErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue lors de la communication avec le serveur'
): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data?.error;
    if (apiError?.message) {
      if (apiError.details && apiError.details.length > 0) {
        return `${apiError.message} : ${apiError.details.join(', ')}`;
      }
      return apiError.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

// Type-safe wrapper functions with response unwrapping
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params });
  return res.data.data;
}

export async function apiPost<T, B = unknown>(url: string, body?: B): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, body);
  return res.data.data;
}

export async function apiPatch<T, B = unknown>(url: string, body?: B): Promise<T> {
  const res = await apiClient.patch<ApiResponse<T>>(url, body);
  return res.data.data;
}

export async function apiPut<T, B = unknown>(url: string, body?: B): Promise<T> {
  const res = await apiClient.put<ApiResponse<T>>(url, body);
  return res.data.data;
}

export async function apiDelete<T = void>(url: string): Promise<T> {
  const res = await apiClient.delete<ApiResponse<T>>(url);
  return res.data?.data as T;
}

/**
 * Exécute une opération API après vérification stricte des permissions RBAC côté front (Zero Trust)
 */
export async function executeWithPermission<T>(
  permission: AppPermission,
  action: () => Promise<T>
): Promise<T> {
  assertPermission(permission);
  return action();
}
