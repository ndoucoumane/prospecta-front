/**
 * Types pour le module Tâches Commerciales (CDC § 33)
 */

export type CommercialTaskType =
  | 'call'
  | 'whatsapp'
  | 'follow_up'
  | 'meeting'
  | 'profile';

export type CommercialTaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface CommercialTask {
  id: string;
  type: CommercialTaskType;
  title: string;
  prospectId?: string;
  prospectName?: string;
  companyName?: string;
  phone?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  assignedTo?: string;
  status: CommercialTaskStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommercialTaskRequest {
  type: CommercialTaskType;
  title: string;
  prospectId?: string;
  prospectName?: string;
  companyName?: string;
  phone?: string;
  dueDate: string;
  dueTime?: string;
  assignedTo?: string;
  notes?: string;
}

export interface UpdateCommercialTaskRequest {
  type?: CommercialTaskType;
  title?: string;
  status?: CommercialTaskStatus;
  dueDate?: string;
  dueTime?: string;
  assignedTo?: string;
  notes?: string;
}
