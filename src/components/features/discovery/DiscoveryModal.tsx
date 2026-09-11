import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Search,
  Building2,
  MapPin,
  Sparkles,
  Download,
  Filter,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { discoveryApi } from '../../../api/discovery';
import { leadListsApi } from '../../../api/leadLists';
import { useToast } from '../../../app/providers/ToastProvider';
import type { DiscoveredPerson, PeopleSearchRequest } from '../../../types/api';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [searchCriteria, setSearchCriteria] = useState<PeopleSearchRequest>({
    firstName: '',
    lastName: '',
    companyName: '',
    city: 'Dakar',
    country: 'SN',
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [newListName, setNewListName] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  // Charger les listes de prospects existantes pour sélection
  const { data: leadListsData } = useQuery({
    queryKey: ['leadLists'],
    queryFn: () => leadListsApi.getAllLists(),
    enabled: isOpen,
  });

  // Recherche de prospects via Apollo
  const { data: searchResults, isFetching, refetch } = useQuery({
    queryKey: ['discoverySearch', searchCriteria],
    queryFn: () => discoveryApi.searchPeople(searchCriteria),
    enabled: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setSelectedIds([]);
    refetch();
  };

  const toggleSelect = (externalId: string) => {
    setSelectedIds((prev) =>
      prev.includes(externalId)
        ? prev.filter((id) => id !== externalId)
        : [...prev, externalId]
    );
  };

  const selectAll = () => {
    if (!searchResults?.items) return;
    if (selectedIds.length === searchResults.items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(searchResults.items.map((p) => p.externalId));
    }
  };

  // Mutation d'importation
  const importMutation = useMutation({
    mutationFn: async () => {
      const selectedPersons = (searchResults?.items || []).filter((p) =>
        selectedIds.includes(p.externalId)
      );

      return discoveryApi.importPeople({
        externalIds: selectedIds,
        prospects: selectedPersons,
        listId: selectedListId || undefined,
        listName: !selectedListId && newListName ? newListName : undefined,
      });
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      queryClient.invalidateQueries({ queryKey: ['leadLists'] });
      showToast(
        `${report.importedCount} prospect(s) importé(s) avec succès dans votre espace !`,
        'success'
      );
      onImportSuccess?.();
      onClose();
    },
    onError: (err: unknown) => {
      showToast(
        err instanceof Error ? err.message : "Erreur lors de l'importation",
        'error'
      );
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-linear-to-r from-blue-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Découverte de Prospects B2B — Apollo Provider
              </h2>
              <p className="text-xs text-gray-500">
                Recherchez des décideurs qualifiés en Afrique de l&apos;Ouest sans scraping et importez-les directement.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Form */}
        <form onSubmit={handleSearch} className="p-5 border-b border-gray-100 bg-gray-50/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Prénom ou Nom</label>
              <input
                type="text"
                placeholder="Ex: Mamadou"
                value={searchCriteria.firstName || ''}
                onChange={(e) =>
                  setSearchCriteria((prev) => ({ ...prev, firstName: e.target.value }))
                }
                className="w-full h-8.5 px-3 bg-white border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Entreprise</label>
              <input
                type="text"
                placeholder="Ex: Sonatel, Wave..."
                value={searchCriteria.companyName || ''}
                onChange={(e) =>
                  setSearchCriteria((prev) => ({ ...prev, companyName: e.target.value }))
                }
                className="w-full h-8.5 px-3 bg-white border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                placeholder="Ex: Dakar, Abidjan"
                value={searchCriteria.city || ''}
                onChange={(e) =>
                  setSearchCriteria((prev) => ({ ...prev, city: e.target.value }))
                }
                className="w-full h-8.5 px-3 bg-white border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                size="sm"
                className="w-full h-8.5"
                isLoading={isFetching}
                leftIcon={<Search className="w-3.5 h-3.5" />}
              >
                Explorer Apollo
              </Button>
            </div>
          </div>
        </form>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {isFetching ? (
            <div className="py-12 text-center text-xs text-gray-500">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Interrogation du fournisseur Apollo et dédoublonnage avec votre organisation...
            </div>
          ) : !hasSearched ? (
            <div className="py-12 text-center text-xs text-gray-400">
              <Filter className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              Renseignez vos critères ci-dessus et cliquez sur &quot;Explorer Apollo&quot; pour afficher les prospects.
            </div>
          ) : !searchResults?.items || searchResults.items.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              Aucun décideur trouvé pour ces critères de recherche.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
                <span className="font-semibold text-gray-700">
                  {searchResults.total} profil(s) découvert(s)
                </span>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedIds.length === searchResults.items.length
                    ? 'Tout désélectionner'
                    : 'Tout sélectionner'}
                </button>
              </div>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {searchResults.items.map((person: DiscoveredPerson) => {
                  const isSelected = selectedIds.includes(person.externalId);
                  return (
                    <div
                      key={person.externalId}
                      onClick={() => toggleSelect(person.externalId)}
                      className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors text-xs ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 truncate">
                              {person.firstName} {person.lastName}
                            </span>
                            {person.alreadyImported && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                Déjà importé
                              </span>
                            )}
                          </div>
                          <span className="text-gray-600 font-medium block truncate">
                            {person.jobTitle}
                          </span>
                          <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              {person.companyName}
                            </span>
                            {person.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {person.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {person.linkedinUrl && (
                        <a
                          href={person.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-blue-600 p-1.5 rounded"
                          title="Voir sur LinkedIn"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Lead List attachment & Import Action */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="font-medium text-gray-700">Rattacher à une liste :</span>
            <select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-800"
            >
              <option value="">-- Aucune (Base générale) --</option>
              {leadListsData?.items?.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.prospectCount} prospects)
                </option>
              ))}
            </select>

            {!selectedListId && (
              <input
                type="text"
                placeholder="Ou nommer une nouvelle liste..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="h-8 px-2.5 bg-white border border-gray-300 rounded-md text-xs w-48 text-gray-800"
              />
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button size="sm" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={selectedIds.length === 0}
              isLoading={importMutation.isPending}
              onClick={() => importMutation.mutate()}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Importer ({selectedIds.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
