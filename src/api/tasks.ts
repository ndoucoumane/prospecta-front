import { apiGet, apiPost, apiPatch, apiDelete, executeWithPermission } from './client';
import type {
  CommercialTask,
  CreateCommercialTaskRequest,
  UpdateCommercialTaskRequest,
  CommercialTaskStatus,
} from '../types/tasks';

const STORAGE_KEY = 'prospecta_commercial_tasks';

const INITIAL_TASKS: CommercialTask[] = [
  {
    id: 'task-1',
    type: 'call',
    title: 'Appel de qualification directeur commercial',
    prospectId: 'pros-1',
    prospectName: 'Amadou Ndiaye',
    companyName: 'ABC Technologies',
    phone: '+221775551234',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '11:00',
    assignedTo: 'Mor Keblink',
    status: 'pending',
    notes: 'Intéressé par la démo CRM et le canal WhatsApp. Préparer tarification Growth.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    type: 'whatsapp',
    title: 'Envoyer template WhatsApp confirmation démo',
    prospectId: 'pros-2',
    prospectName: 'Aminata Diallo',
    companyName: 'Wave Digital Finance',
    phone: '+221773334455',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '15:30',
    assignedTo: 'Mor Keblink',
    status: 'pending',
    notes: 'Validation horaire rendez-vous de démonstration commerciale.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    type: 'follow_up',
    title: 'Relancer suite à proposition envoyée',
    prospectId: 'pros-3',
    prospectName: 'Jean Fall',
    companyName: 'Sonatel B2B',
    phone: '+221776667788',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '10:00',
    assignedTo: 'Mor Keblink',
    status: 'pending',
    notes: 'Contrat annuel 45M FCFA. Discuter des conditions de paiement UEMOA.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function loadLocalTasks(): CommercialTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [...INITIAL_TASKS];
}

function saveLocalTasks(tasks: CommercialTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export const tasksApi = {
  /**
   * GET /api/v1/tasks
   * Récupérer toutes les tâches commerciales
   */
  async getTasks(params?: {
    status?: CommercialTaskStatus | 'all';
    prospectId?: string;
  }): Promise<CommercialTask[]> {
    return executeWithPermission('task:view', async () => {
      try {
        const queryParams: Record<string, string> = {};
        if (params?.status && params.status !== 'all') {
          queryParams.status = params.status;
        }
        if (params?.prospectId) {
          queryParams.prospectId = params.prospectId;
        }
        return await apiGet<CommercialTask[]>('/api/v1/tasks', queryParams);
      } catch {
        let list = loadLocalTasks();
        if (params?.status && params.status !== 'all') {
          list = list.filter((t) => t.status === params.status);
        }
        if (params?.prospectId) {
          list = list.filter((t) => t.prospectId === params.prospectId);
        }
        return list;
      }
    });
  },

  /**
   * POST /api/v1/tasks
   * Créer une tâche commerciale
   */
  async createTask(payload: CreateCommercialTaskRequest): Promise<CommercialTask> {
    return executeWithPermission('task:manage', async () => {
      try {
        return await apiPost<CommercialTask>('/api/v1/tasks', payload);
      } catch {
        const tasks = loadLocalTasks();
        const newTask: CommercialTask = {
          id: `task-${Date.now()}`,
          type: payload.type,
          title: payload.title,
          prospectId: payload.prospectId,
          prospectName: payload.prospectName,
          companyName: payload.companyName,
          phone: payload.phone,
          dueDate: payload.dueDate,
          dueTime: payload.dueTime || '09:00',
          assignedTo: payload.assignedTo || 'Moi',
          status: 'pending',
          notes: payload.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        tasks.unshift(newTask);
        saveLocalTasks(tasks);
        return newTask;
      }
    });
  },

  /**
   * PATCH /api/v1/tasks/{id}
   * Mettre à jour une tâche
   */
  async updateTask(id: string, payload: UpdateCommercialTaskRequest): Promise<CommercialTask> {
    return executeWithPermission('task:manage', async () => {
      try {
        return await apiPatch<CommercialTask>(`/api/v1/tasks/${id}`, payload);
      } catch {
        const tasks = loadLocalTasks();
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx >= 0) {
          tasks[idx] = {
            ...tasks[idx],
            ...payload,
            updatedAt: new Date().toISOString(),
          };
          saveLocalTasks(tasks);
          return tasks[idx];
        }
        throw new Error(`Tâche ${id} introuvable`);
      }
    });
  },

  /**
   * DELETE /api/v1/tasks/{id}
   * Supprimer une tâche commerciale
   */
  async deleteTask(id: string): Promise<void> {
    return executeWithPermission('task:manage', async () => {
      try {
        await apiDelete<void>(`/api/v1/tasks/${id}`);
      } catch {
        const tasks = loadLocalTasks();
        const filtered = tasks.filter((t) => t.id !== id);
        saveLocalTasks(filtered);
      }
    });
  },
};
