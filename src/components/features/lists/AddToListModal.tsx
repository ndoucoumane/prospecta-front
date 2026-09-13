import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListFilter, Plus, Check, Loader2 } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { leadListsApi } from '../../../api/leadLists';
import { useToast } from '../../../app/providers/ToastProvider';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospectIds: string[];
  onSuccess?: () => void;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({
  isOpen,
  onClose,
  prospectIds,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  // Fetch lead lists
  const { data: listsData, isLoading: isListsLoading } = useQuery({
    queryKey: ['lead-lists'],
    queryFn: () => leadListsApi.getAllLists({ size: 50 }),
    enabled: isOpen,
  });

  const lists = listsData?.items || [];

  // Add to existing list mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      let targetListId = selectedListId;
      if (mode === 'new') {
        if (!newListName.trim()) {
          throw new Error('Veuillez renseigner un nom de liste.');
        }
        const created = await leadListsApi.createList({
          name: newListName.trim(),
          description: newListDesc.trim() || undefined,
        });
        targetListId = created.id;
      }

      if (!targetListId) {
        throw new Error('Veuillez sélectionner ou créer une liste.');
      }

      await leadListsApi.addProspectsToList(targetListId, prospectIds);
      return targetListId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      showToast(
        `${prospectIds.length} prospect(s) ajouté(s) à la liste avec succès.`
      );
      onSuccess?.();
      onClose();
      // Reset
      setNewListName('');
      setNewListDesc('');
      setSelectedListId('');
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'ajout", 'error');
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter à une liste de prospects"
      description={`Rattachez ${prospectIds.length} prospect(s) sélectionné(s) à une liste thématique.`}
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Toggle Mode */}
        <div className="flex rounded-md bg-gray-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 py-1.5 font-medium rounded transition-colors ${
              mode === 'existing'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Liste existante
          </button>
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 py-1.5 font-medium rounded transition-colors ${
              mode === 'new'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            + Créer une nouvelle liste
          </button>
        </div>

        {mode === 'existing' ? (
          <div>
            {isListsLoading ? (
              <div className="flex items-center justify-center py-8 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-600" />
                Chargement des listes...
              </div>
            ) : lists.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-md">
                <ListFilter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Aucune liste disponible pour le moment.</p>
                <button
                  type="button"
                  onClick={() => setMode('new')}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Créer votre première liste
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {lists.map((list) => {
                  const isSelected = selectedListId === list.id;
                  return (
                    <div
                      key={list.id}
                      onClick={() => setSelectedListId(list.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{list.name}</div>
                        {list.description && (
                          <p className="text-[11px] text-gray-500 line-clamp-1">
                            {list.description}
                          </p>
                        )}
                        <span className="text-[10px] text-gray-400 mt-0.5 inline-block">
                          {list.prospectCount} prospect(s)
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              label="Nom de la liste"
              placeholder="ex: Directeurs Commerciaux Dakar 2026"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description (optionnelle)
              </label>
              <textarea
                value={newListDesc}
                onChange={(e) => setNewListDesc(e.target.value)}
                placeholder="ex: Campagne B2B SaaS auprès des PME et grands comptes au Sénégal"
                rows={3}
                className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            isLoading={addMutation.isPending}
            disabled={
              mode === 'existing'
                ? !selectedListId
                : !newListName.trim()
            }
            onClick={() => addMutation.mutate()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Ajouter à la liste
          </Button>
        </div>
      </div>
    </Modal>
  );
};
