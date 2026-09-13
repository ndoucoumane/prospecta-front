import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Square,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { tasksApi } from '../../../api/tasks';
import { prospectsApi } from '../../../api/prospects';
import { useToast } from '../../../app/providers/ToastProvider';
import type {
  CommercialTaskType,
  CommercialTaskStatus,
} from '../../../types/tasks';

export const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [statusTab, setStatusTab] = useState<'all' | 'today' | 'overdue' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState<CommercialTaskType | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CommercialTaskType>('call');
  const [newProspectId, setNewProspectId] = useState('');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState('10:00');
  const [newNotes, setNewNotes] = useState('');

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['commercial-tasks'],
    queryFn: () => tasksApi.getTasks(),
  });

  // Fetch prospects for selector in modal
  const { data: prospects } = useQuery({
    queryKey: ['prospects-for-tasks'],
    queryFn: () => prospectsApi.getProspects(),
    enabled: isAddModalOpen,
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: () => {
      const selectedProspect = prospects?.find((p) => p.id === newProspectId);
      return tasksApi.createTask({
        title: newTitle.trim(),
        type: newType,
        prospectId: selectedProspect?.id,
        prospectName: selectedProspect ? `${selectedProspect.firstName} ${selectedProspect.lastName}` : undefined,
        companyName: selectedProspect?.companyName,
        phone: selectedProspect?.phone,
        dueDate: newDueDate,
        dueTime: newDueTime,
        notes: newNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial-tasks'] });
      showToast('Tâche commerciale créée avec succès.');
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewNotes('');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Erreur de création', 'error');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: CommercialTaskStatus }) => {
      const nextStatus: CommercialTaskStatus =
        currentStatus === 'completed' ? 'pending' : 'completed';
      return tasksApi.updateTask(id, { status: nextStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial-tasks'] });
      showToast('Statut de la tâche actualisé.');
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial-tasks'] });
      showToast('Tâche supprimée.');
    },
  });

  const allTasks = tasks || [];
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredTasks = allTasks.filter((t) => {
    // Tab filter
    if (statusTab === 'today') {
      if (t.dueDate !== todayStr || t.status === 'completed') return false;
    } else if (statusTab === 'overdue') {
      if (t.dueDate >= todayStr || t.status === 'completed') return false;
    } else if (statusTab === 'completed') {
      if (t.status !== 'completed') return false;
    } else {
      // 'all' tab shows pending/in_progress first, or everything
    }

    // Type filter
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;

    return true;
  });

  // Counters
  const pendingCount = allTasks.filter((t) => t.status !== 'completed').length;
  const todayCount = allTasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed').length;
  const overdueCount = allTasks.filter((t) => t.dueDate < todayStr && t.status !== 'completed').length;
  const completedCount = allTasks.filter((t) => t.status === 'completed').length;

  const getTypeIcon = (type: CommercialTaskType) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'follow_up':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'profile':
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: CommercialTaskType) => {
    switch (type) {
      case 'call':
        return 'Appel téléphonique';
      case 'whatsapp':
        return 'Message WhatsApp';
      case 'meeting':
        return 'Préparation rendez-vous';
      case 'follow_up':
        return 'Relance commerciale';
      case 'profile':
      default:
        return 'Consulter profil';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Tâches commerciales
            </h1>
            <Badge variant="blue" size="sm">
              {pendingCount} à traiter
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Planifiez vos actions humaines ciblées : appels, WhatsApp, relances et préparation de rendez-vous (CDC § 33).
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Nouvelle tâche
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusTab('all')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            statusTab === 'all'
              ? 'border-blue-600 bg-blue-50/40 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <span className="text-[11px] font-semibold text-gray-500">Toutes à traiter</span>
          <p className="text-xl font-bold text-gray-900 mt-0.5 font-mono">{pendingCount}</p>
        </div>

        <div
          onClick={() => setStatusTab('today')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            statusTab === 'today'
              ? 'border-blue-600 bg-blue-50/40 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <span className="text-[11px] font-semibold text-gray-500">Aujourd'hui</span>
          <p className="text-xl font-bold text-blue-600 mt-0.5 font-mono">{todayCount}</p>
        </div>

        <div
          onClick={() => setStatusTab('overdue')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            statusTab === 'overdue'
              ? 'border-red-600 bg-red-50/40 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <span className="text-[11px] font-semibold text-gray-500">En retard</span>
          <p className="text-xl font-bold text-red-600 mt-0.5 font-mono">{overdueCount}</p>
        </div>

        <div
          onClick={() => setStatusTab('completed')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            statusTab === 'completed'
              ? 'border-green-600 bg-green-50/40 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <span className="text-[11px] font-semibold text-gray-500">Terminées</span>
          <p className="text-xl font-bold text-green-600 mt-0.5 font-mono">{completedCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Channels */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-500">Type d'action :</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CommercialTaskType | 'all')}
            className="h-8 px-2 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
          >
            <option value="all">Tous les types</option>
            <option value="call">Appel téléphonique</option>
            <option value="whatsapp">Message WhatsApp</option>
            <option value="follow_up">Relance commerciale</option>
            <option value="meeting">Préparation rendez-vous</option>
            <option value="profile">Consulter profil</option>
          </select>
        </div>
      </div>

      {/* Task List Content */}
      {isLoading ? (
        <LoadingState message="Chargement des tâches..." type="skeleton" rows={4} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="Aucune tâche commerciale à afficher"
          description="Vous êtes à jour dans vos actions commerciales ou aucune tâche ne correspond à ces critères."
          actionLabel="Créer une tâche"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden shadow-sm">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = task.dueDate < todayStr && !isCompleted;

            return (
              <div
                key={task.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isCompleted ? 'bg-gray-50/60 opacity-75' : 'hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() =>
                      toggleStatusMutation.mutate({
                        id: task.id,
                        currentStatus: task.status,
                      })
                    }
                    className="mt-0.5 text-gray-400 hover:text-blue-600 flex-shrink-0"
                    title={isCompleted ? 'Marquer comme non fait' : 'Marquer comme terminé'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(task.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-600">
                        {getTypeLabel(task.type)}
                      </span>
                    </div>

                    {task.prospectName && (
                      <p className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold">{task.prospectName}</span>
                        {task.companyName && (
                          <span className="text-gray-400">({task.companyName})</span>
                        )}
                      </p>
                    )}

                    {task.notes && (
                      <p className="text-[11px] text-gray-500 mt-1 italic line-clamp-1">
                        "{task.notes}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5">
                      <span
                        className={`flex items-center gap-1 ${
                          isOverdue ? 'text-red-600 font-bold' : ''
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {task.dueDate} {task.dueTime ? `à ${task.dueTime}` : ''}
                        {isOverdue && ' (En retard)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 sm:self-center pl-8 sm:pl-0">
                  {task.phone && task.type === 'call' && (
                    <a
                      href={`tel:${task.phone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 border border-blue-200"
                    >
                      <Phone className="w-3 h-3" /> Appeler
                    </a>
                  )}

                  {task.phone && task.type === 'whatsapp' && (
                    <a
                      href={`https://wa.me/${task.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 border border-green-200"
                    >
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </a>
                  )}

                  {task.prospectId && (
                    <Link
                      to={`/app/prospects/${task.prospectId}`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100"
                      title="Voir la fiche prospect"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette tâche commerciale ?')) {
                        deleteMutation.mutate(task.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                    title="Supprimer la tâche"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Créer une tâche commerciale"
        description="Assurez le suivi manuel d'un prospect : appel, WhatsApp ou préparation de rendez-vous."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4 pt-1"
        >
          <Input
            label="Intitulé de la tâche"
            placeholder="ex: Appel de qualification offre SaaS avec DG"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Type d'action"
              value={newType}
              onChange={(e) => setNewType(e.target.value as CommercialTaskType)}
              options={[
                { value: 'call', label: 'Appel téléphonique' },
                { value: 'whatsapp', label: 'Message WhatsApp' },
                { value: 'follow_up', label: 'Relance commerciale' },
                { value: 'meeting', label: 'Préparation rendez-vous' },
                { value: 'profile', label: 'Consulter profil' },
              ]}
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Prospect associé (optionnel)
              </label>
              <select
                value={newProspectId}
                onChange={(e) => setNewProspectId(e.target.value)}
                className="w-full h-9 px-2.5 bg-white border border-gray-300 rounded-md text-xs focus:outline-none focus:border-blue-600"
              >
                <option value="">Aucun prospect</option>
                {prospects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date d'échéance"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
            />
            <Input
              label="Heure estimée"
              type="time"
              value={newDueTime}
              onChange={(e) => setNewDueTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Instructions / Notes
            </label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="ex: Rappeler suite au salon AfricaTech, valider le budget FCFA..."
              rows={3}
              className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending}
              disabled={!newTitle.trim()}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Créer la tâche
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
