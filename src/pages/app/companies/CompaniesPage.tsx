import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Building2, Globe, Users, ExternalLink, ChevronRight } from 'lucide-react';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Badge } from '../../../components/ui/Badge';
import { companiesApi } from '../../../api';

export const CompaniesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies', searchQuery, sectorFilter, cityFilter],
    queryFn: () =>
      companiesApi.getCompanies({
        query: searchQuery,
        sector: sectorFilter,
        city: cityFilter,
      }),
  });

  return (
    <div className="space-y-6">
      {/* 33. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Entreprises</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Annuaire des organisations ciblées au Sénégal et analyse commerciale.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une entreprise par nom, secteur, ville ou site..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-gray-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-9 px-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 focus:outline-none focus:border-blue-600"
          >
            <option value="all">Toutes les villes</option>
            <option value="dakar">Dakar</option>
            <option value="thiès">Thiès</option>
            <option value="saly">Saly</option>
          </select>

          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="h-9 px-2.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 focus:outline-none focus:border-blue-600"
          >
            <option value="all">Tous les secteurs</option>
            <option value="Transport & Logistique">Transport & Logistique</option>
            <option value="Hôtellerie & Restauration">Hôtellerie & Restauration</option>
            <option value="Agroalimentaire">Agroalimentaire</option>
            <option value="Technologies & Logiciels">Technologies & Logiciels</option>
          </select>
        </div>
      </div>

      {/* Companies List */}
      {isLoading ? (
        <LoadingState message="Chargement des entreprises..." type="skeleton" rows={5} />
      ) : !companies || companies.length === 0 ? (
        <EmptyState
          title="Aucune entreprise trouvée"
          description="Aucune entreprise ne correspond à vos filtres actuels."
        />
      ) : (
        <>
          {/* Desktop 33. Table: Entreprise, Secteur, Ville, Contacts, Site web, Score */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Entreprise</th>
                  <th className="py-3 px-4">Secteur</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Contacts</th>
                  <th className="py-3 px-4">Site web</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <Link
                        to={`/app/companies/${comp.id}`}
                        className="hover:text-blue-600 flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{comp.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{comp.sector}</td>
                    <td className="py-3 px-4 text-gray-600">{comp.city}</td>
                    <td className="py-3 px-4 text-gray-700">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>{comp.contactCount} contact{comp.contactCount > 1 ? 's' : ''}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>{comp.website.replace('https://', '')}</span>
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold font-mono text-blue-600">
                        {comp.score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/app/companies/${comp.id}`}
                        className="p-1 text-gray-400 hover:text-blue-600 inline-block"
                        title="Voir la fiche entreprise"
                        aria-label={`Voir la fiche de ${comp.name}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {companies.map((comp) => (
              <div
                key={comp.id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      to={`/app/companies/${comp.id}`}
                      className="font-bold text-sm text-gray-900 hover:text-blue-600 block"
                    >
                      {comp.name}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {comp.sector} • {comp.city}
                    </span>
                  </div>
                  <Badge variant="blue" size="sm">
                    {comp.score}/100
                  </Badge>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">{comp.contactCount} contacts enregistrés</span>
                  <Link
                    to={`/app/companies/${comp.id}`}
                    className="text-blue-600 font-medium flex items-center gap-1"
                  >
                    Fiche <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
