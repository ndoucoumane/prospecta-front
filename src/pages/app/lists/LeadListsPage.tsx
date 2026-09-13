import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Users,
  Calendar,
  Send,
  Download,
  Trash2,
  ChevronRight,
  X,
  Sparkles,
  Search,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { leadListsApi } from '../../../api/leadLists';
import { useToast } from '../../../app/providers/ToastProvider';
import { exportToCsv } from '../../../lib/exportCsv';
import type { LeadListResponse, LeadListProspectDto } from '../../../types/api';

export const LeadListsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  // Selected list for member inspection drawer
  const [selectedList, setSelectedList] = useState<LeadListResponse | null>(null);

  // Fetch all lists
  const { data: listsData, isLoading } = useQuery({
    queryKey: ['lead-lists'],
    queryFn: () => leadListsApi.getAllLists({ size: 100 }),
  });

  const lists = listsData?.items || [];

  // Fetch members of currently inspected list
  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ['lead-list-members', selectedList?.id],
    queryFn: () => leadListsApi.getListProspects(selectedList!.id),
    enabled: !!selectedList,
  });

  const listMembers: LeadListProspectDto[] = membersData?.items || [];

  // Create list mutation
  const createMutation = useMutation({
    mutationFn: () =>
      leadListsApi.createList({
        name: newListName.trim(),
        description: newListDesc.trim() || undefined,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      showToast(`Liste "${created.name}" créée avec succès.`);
      setIsCreateModalOpen(false);
      setNewListName('');
      setNewListDesc('');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Erreur de création', 'error');
    },
  });

  // Delete list mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadListsApi.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      showToast('Liste de prospects supprimée.');
      if (selectedList) setSelectedList(null);
    },
    onError: () => {
      showToast('Erreur lors de la suppression.', 'error');
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: ({ listId, prospectId }: { listId: string; prospectId: string }) =>
      leadListsApi.removeProspectFromList(listId, prospectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-list-members', selectedList?.id] });
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      showToast('Prospect retiré de la liste.');
    },
  });

  // Export list to CSV
  const handleExportList = (list: LeadListResponse, members?: LeadListProspectDto[]) => {
    const toExport = members && members.length > 0 ? members : [];
    if (toExport.length === 0) {
      showToast('Cette liste ne contient aucun prospect à exporter.', 'warning');
      return;
    }

    exportToCsv(
      `prospecta-${list.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`,
      toExport,
      [
        { key: 'firstName', label: 'Prénom' },
        { key: 'lastName', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Téléphone' },
        { key: 'jobTitle', label: 'Poste / Titre' },
        { key: 'companyName', label: 'Entreprise' },
        { key: 'status', label: 'Statut' },
        { key: 'score', label: 'Score' },
      ]
    );
    showToast(`Liste "${list.name}" exportée en CSV.`);
  };

  const filteredLists = lists.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      (l.description && l.description.toLowerCase().includes(q))
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Listes de prospects
            </h1>
            <Badge variant="blue" size="sm">
              {lists.length} liste(s)
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Organisez vos prospects par secteur, géographie ou campagne thématique (CDC § 12).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Créer une liste
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une liste de prospection..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-gray-900"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState message="Chargement des listes de prospects..." type="skeleton" rows={4} />
      ) : filteredLists.length === 0 ? (
        <EmptyState
          title="Aucune liste de prospects"
          description="Créez des listes ciblées pour regrouper vos prospects et lancer des campagnes segmentées (ex: 'CEO Sénégal', 'Directeurs Commerciaux Dakar')."
          actionLabel="Créer une liste"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map((list) => (
            <div
              key={list.id}
              className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-gray-300 transition-all shadow-sm space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                    {list.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
                    <Users className="w-3 h-3" />
                    {list.prospectCount}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 min-h-[32px]">
                  {list.description || 'Aucune description renseignée.'}
                </p>

                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
                  <Calendar className="w-3 h-3" />
                  <span>Créée le {formatDate(list.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                <button
                  onClick={() => setSelectedList(list)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Voir les contacts <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/app/campaigns/new?listId=${list.id}`)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    title="Lancer une campagne avec cette liste"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedList(list);
                      // will export when opened
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors"
                    title="Inspecter & Exporter"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Supprimer la liste "${list.name}" ?`)) {
                        deleteMutation.mutate(list.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Supprimer la liste"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect List Members Drawer / Modal */}
      {selectedList && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">
                    {selectedList.name}
                  </h2>
                  <Badge variant="blue" size="sm">
                    {selectedList.prospectCount} prospect(s)
                  </Badge>
                </div>
                {selectedList.description && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedList.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedList(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body: Members Table */}
            <div className="p-4 flex-1 overflow-y-auto">
              {isMembersLoading ? (
                <div className="py-12 flex justify-center">
                  <LoadingState message="Chargement des membres..." type="spinner" />
                </div>
              ) : listMembers.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  Aucun prospect dans cette liste pour le moment.
                  <div className="mt-3">
                    <Button
                      size="sm"
                      onClick={() => navigate('/app/discovery')}
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      Trouver des prospects à ajouter
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {listMembers.map((member) => (
                    <div
                      key={member.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          {member.jobTitle} • {member.companyName}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {member.email || member.phone || 'Aucun contact certifié'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-mono font-bold text-blue-600 text-xs">
                          {member.score}/100
                        </span>
                        <button
                          onClick={() =>
                            removeMemberMutation.mutate({
                              listId: selectedList.id,
                              prospectId: member.id,
                            })
                          }
                          className="text-gray-400 hover:text-red-600 p-1 rounded"
                          title="Retirer de la liste"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExportList(selectedList, listMembers)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Exporter la liste CSV
              </Button>

              <Button
                size="sm"
                onClick={() => navigate(`/app/campaigns/new?listId=${selectedList.id}`)}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Lancer une campagne
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create List Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer une nouvelle liste de prospects"
        description="Donnez un nom clair et une description thématique pour regrouper vos cibles."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4 pt-1"
        >
          <Input
            label="Nom de la liste"
            placeholder="ex: Directeurs Commerciaux Dakar — PME Tech"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description / Objectif commercial
            </label>
            <textarea
              value={newListDesc}
              onChange={(e) => setNewListDesc(e.target.value)}
              placeholder="ex: Décideurs cibles pour la prospection Q4 avec séquence WhatsApp et email"
              rows={3}
              className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending}
              disabled={!newListName.trim()}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Créer la liste
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
