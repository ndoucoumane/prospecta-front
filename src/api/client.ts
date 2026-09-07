import axios, { type AxiosError } from 'axios';
import type { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('prospecta_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with structured error mapping
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; details?: Record<string, string[]> }>) => {
    const status = error.response?.status || 500;
    const serverMessage = error.response?.data?.message;

    let friendlyMessage = 'Une erreur inattendue est survenue.';

    switch (status) {
      case 400:
        friendlyMessage = serverMessage || 'Requête invalide. Veuillez vérifier vos données.';
        break;
      case 401:
        friendlyMessage = 'Session expirée. Veuillez vous reconnecter.';
        localStorage.removeItem('prospecta_token');
        break;
      case 403:
        friendlyMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        break;
      case 404:
        friendlyMessage = serverMessage || 'La ressource demandée est introuvable.';
        break;
      case 409:
        friendlyMessage = serverMessage || 'Un conflit est survenu (cette entrée existe peut-être déjà).';
        break;
      case 422:
        friendlyMessage = serverMessage || 'Données fournies non valides.';
        break;
      case 429:
        friendlyMessage = 'Limite de requêtes atteinte. Veuillez patienter avant de réessayer.';
        break;
      case 500:
      default:
        friendlyMessage = 'Erreur du serveur. Nos équipes sont informées.';
        break;
    }

    const structuredError: ApiError = {
      statusCode: status,
      message: friendlyMessage,
      details: error.response?.data?.details,
    };

    return Promise.reject(structuredError);
  }
);
