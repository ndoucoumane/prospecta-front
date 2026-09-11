import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Upload,
  Filter,
  Trash2,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge, type BadgeVariant } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AddProspectModal } from '../../../components/features/prospects/AddProspectModal';
import { ImportCsvModal } from '../../../components/features/prospects/ImportCsvModal';
import { DiscoveryModal } from '../../../components/features/discovery/DiscoveryModal';
import { prospectsApi } from '../../../api';
import { useToast } from '../../../app/providers/ToastProvider';
import { PermissionGate } from '../../../security';
import type { LeadStatus } from '../../../types';

export const ProspectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);

  // 29. Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery) {
        setSearchParams({ q: searchQuery });
      } else {
        setSearchParams({});
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, setSearchParams]);

  // Query prospects
  const { data: prospects, isLoading } = useQuery({
    queryKey: ['prospects', debouncedQuery, statusFilter, sectorFilter, cityFilter],
    queryFn: () =>
      prospectsApi.getProspects({
        query: debouncedQuery,
        status: statusFilter,
        sector: sectorFilter,
        city: cityFilter,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => prospectsApi.deleteProspect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      showToast('Prospect supprimé.');
    },
    onError: () => {
      showToast('Erreur lors de la suppression.', 'error');
    },
  });

  const getStatusBadge = (status: LeadStatus): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'qualified':
        return { label: 'Qualifié', variant: 'success' };
      case 'meeting':
        return { label: 'Rendez-vous', variant: 'blue' };
      case 'contacted':
        return { label: 'Contacté', variant: 'warning' };
      case 'opted_out':
        return { label: 'Désinscrit', variant: 'error' };
      case 'unresponsive':
        return { label: 'Sans réponse', variant: 'gray' };
      case 'new':
      default:
        return { label: 'Nouveau', variant: 'default' };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-5">
      {/* 27. Header & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Prospects</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Gérez votre base de contacts commerciaux et leur niveau de qualification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <PermissionGate permission="discovery:search" mode="disable" tooltip="Rôle insuffisant pour la découverte B2B">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsDiscoveryOpen(true)}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            >
              Découverte B2B (Apollo)
            </Button>
          </PermissionGate>

          <PermissionGate permission="prospect:import" mode="disable" tooltip="Rôle insuffisant pour importer">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsImportModalOpen(true)}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              Importer CSV
            </Button>
          </PermissionGate>

          <PermissionGate permission="prospect:create" mode="disable" tooltip="Rôle insuffisant pour créer un prospect">
            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Ajouter un prospect
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* 29 & 30. Search & Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Debounced Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un prospect (nom, email, téléphone, entreprise, poste)..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-gray-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-3.5 h-3.5" />}
            >
              Filtres {statusFilter !== 'all' || cityFilter !== 'all' || sectorFilter !== 'all' ? '(actifs)' : ''}
            </Button>

            {(statusFilter !== 'all' || cityFilter !== 'all' || sectorFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCityFilter('all');
                  setSectorFilter('all');
                }}
                className="text-xs text-gray-500 hover:text-gray-900 p-1.5 rounded flex items-center gap-1"
                title="Réinitialiser les filtres"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Effacer</span>
              </button>
            )}
          </div>
        </div>

        {/* 30. Combined Filters Section */}
        {showFilters && (
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-8 px-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-600"
              >
                <option value="all">Tous les statuts</option>
                <option value="new">Nouveau</option>
                <option value="contacted">Contacté</option>
                <option value="qualified">Qualifié</option>
                <option value="meeting">Rendez-vous</option>
                <option value="unresponsive">Sans réponse</option>
                <option value="opted_out">Désinscrit</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Ville / Région
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full h-8 px-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-600"
              >
                <option value="all">Toutes les villes</option>
                <option value="dakar">Dakar</option>
                <option value="thiès">Thiès</option>
                <option value="saly">Saly / Mbour</option>
                <option value="saint-louis">Saint-Louis</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Secteur d'activité
              </label>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-full h-8 px-2 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-600"
              >
                <option value="all">Tous les secteurs</option>
                <option value="Transport & Logistique">Transport & Logistique</option>
                <option value="Hôtellerie & Restauration">Hôtellerie & Restauration</option>
                <option value="Agroalimentaire">Agroalimentaire</option>
                <option value="Commerce & Distribution">Commerce & Distribution</option>
                <option value="Technologies & Logiciels">Technologies & Logiciels</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content: Loading / Empty / Table / Mobile cards */}
      {isLoading ? (
        <LoadingState message="Chargement des prospects..." type="skeleton" rows={5} />
      ) : !prospects || prospects.length === 0 ? (
        <EmptyState
          title="Aucun prospect trouvé"
          description="Vous n'avez pas encore ajouté de prospects correspondant à ces critères."
          actionLabel="Ajouter un prospect"
          onAction={() => setIsAddModalOpen(true)}
          secondaryActionLabel="Importer un fichier CSV"
          onSecondaryAction={() => setIsImportModalOpen(true)}
        />
      ) : (
        <>
          {/* 28. Desktop Table: Responsive, Flat, 1px Border */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Prospect</th>
                  <th className="py-3 px-4">Entreprise</th>
                  <th className="py-3 px-4">Fonction</th>
                  <th className="py-3 px-4">Localisation</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Dernière activité</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prospects.map((p) => {
                  const status = getStatusBadge(p.status);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/75 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <Link
                          to={`/app/prospects/${p.id}`}
                          className="hover:text-blue-600 font-semibold block"
                        >
                          {p.firstName} {p.lastName}
                        </Link>
                        <span className="text-[11px] text-gray-500 font-normal">
                          {p.email}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{p.companyName}</td>
                      <td className="py-3 px-4 text-gray-600">{p.jobTitle}</td>
                      <td className="py-3 px-4 text-gray-600">{p.city}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold font-mono text-blue-600">
                            {p.score.score}
                          </span>
                          <span className="text-[10px] text-gray-400">/100</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={status.variant} size="sm" dot>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px]">
                        {formatDate(p.lastActivityAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/app/prospects/${p.id}`}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                            title="Voir la fiche prospect"
                            aria-label={`Voir la fiche de ${p.firstName} ${p.lastName}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <PermissionGate permission="prospect:delete" mode="hide">
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer le prospect ${p.firstName} ${p.lastName} ?`)) {
                                  deleteMutation.mutate(p.id);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="Supprimer"
                              aria-label={`Supprimer ${p.firstName} ${p.lastName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 28. Mobile Cards / List Items */}
          <div className="md:hidden space-y-3">
            {prospects.map((p) => {
              const status = getStatusBadge(p.status);
              return (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/app/prospects/${p.id}`}
                      className="font-semibold text-sm text-gray-900 hover:text-blue-600"
                    >
                      {p.firstName} {p.lastName}
                    </Link>
                    <Badge variant={status.variant} size="sm" dot>
                      {status.label}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-600 space-y-0.5">
                    <p className="font-medium text-gray-800">
                      {p.jobTitle} • {p.companyName}
                    </p>
                    <p className="text-gray-500">
                      {p.city} • {p.phone}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Score :</span>
                      <span className="font-bold text-blue-600 font-mono">
                        {p.score.score}/100
                      </span>
                    </div>

                    <Link
                      to={`/app/prospects/${p.id}`}
                      className="text-blue-600 font-medium flex items-center gap-1"
                    >
                      Consulter <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modals */}
      <AddProspectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProspectAdded={() => queryClient.invalidateQueries({ queryKey: ['prospects'] })}
      />

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => queryClient.invalidateQueries({ queryKey: ['prospects'] })}
      />

      <DiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onImportSuccess={() => queryClient.invalidateQueries({ queryKey: ['prospects'] })}
      />
    </div>
  );
};
