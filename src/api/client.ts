import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiErrorResponse } from '../types/api';
import { assertPermission, type AppPermission } from '../security/permissions';

// Base URL: configured via Vite env or fallback to local backend port 8080
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

// Response interceptor: extract error according to ApiErrorResponse contract & handle security signals
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status || 500;
    const backendError = error.response?.data?.error;

    if (backendError) {
      console.error(
        `[Prospecta API Error] [${backendError.code || status}] ${backendError.message} (Trace: ${backendError.traceId || 'N/A'})`,
        backendError.details || ''
      );
    }

    if (status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('prospecta_token');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('prospecta:unauthorized'));
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
