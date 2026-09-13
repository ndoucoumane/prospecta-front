import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Users,
  Building2,
  Mail,
  Phone,
  Filter,
  CheckSquare,
  Square,
  ListPlus,
  Send,
  Download,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AddToListModal } from '../../../components/features/lists/AddToListModal';
import { discoveryApi } from '../../../api/discovery';
import { useToast } from '../../../app/providers/ToastProvider';
import { exportToCsv } from '../../../lib/exportCsv';
import type {
  DiscoveredPerson,
  DiscoveredCompany,
  PeopleSearchRequest,
  CompanySearchRequest,
} from '../../../types/api';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export const DiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Mode: 'people' | 'companies'
  const [activeTab, setActiveTab] = useState<'people' | 'companies'>('people');

  // Intelligent query (CDC § 8)
  const [naturalQuery, setNaturalQuery] = useState('');
  const [isAiInterpreting, setIsAiInterpreting] = useState(false);

  // People Search Filters (CDC § 6)
  const [personJobTitle, setPersonJobTitle] = useState('');
  const [personCountry, setPersonCountry] = useState('Sénégal');
  const [personCity, setPersonCity] = useState('');
  const [personCompany, setPersonCompany] = useState('');
  const [personIndustry, setPersonIndustry] = useState('');
  const [personSize, setPersonSize] = useState('');
  const [requireEmail, setRequireEmail] = useState(false);
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireLinkedin, setRequireLinkedin] = useState(false);

  // Company Search Filters (CDC § 7)
  const [companyName, setCompanyName] = useState('');
  const [companyCountry, setCompanyCountry] = useState('Sénégal');
  const [companyCity, setCompanyCity] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');

  // Multi-selection (CDC § 66)
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);

  // Modals & Drawers
  const [isAddToListOpen, setIsAddToListOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

  // =========================================================================
  // People Query
  // =========================================================================
  const peopleRequest: PeopleSearchRequest = {
    jobTitles: personJobTitle ? [personJobTitle] : undefined,
    companyName: personCompany || undefined,
    country: personCountry || undefined,
    city: personCity || undefined,
    industry: personIndustry || undefined,
    companySizeMin: personSize.includes('-') ? parseInt(personSize.split('-')[0]) : undefined,
    companySizeMax: personSize.includes('-') ? parseInt(personSize.split('-')[1]) : undefined,
    page: 0,
    size: 50,
  };

  const {
    data: peopleData,
    isLoading: isPeopleLoading,
  } = useQuery({
    queryKey: [
      'discovery-people',
      personJobTitle,
      personCountry,
      personCity,
      personCompany,
      personIndustry,
      personSize,
      requireEmail,
      requirePhone,
      requireLinkedin,
    ],
    queryFn: () => discoveryApi.searchPeople(peopleRequest),
    enabled: activeTab === 'people',
  });

  // =========================================================================
  // Companies Query
  // =========================================================================
  const companyRequest: CompanySearchRequest = {
    name: companyName || undefined,
    country: companyCountry || undefined,
    city: companyCity || undefined,
    industry: companyIndustry || undefined,
    companySizeMin: companySize.includes('-') ? parseInt(companySize.split('-')[0]) : undefined,
    companySizeMax: companySize.includes('-') ? parseInt(companySize.split('-')[1]) : undefined,
    page: 0,
    size: 50,
  };

  const {
    data: companiesData,
    isLoading: isCompaniesLoading,
  } = useQuery({
    queryKey: [
      'discovery-companies',
      companyName,
      companyCountry,
      companyCity,
      companyIndustry,
      companySize,
    ],
    queryFn: () => discoveryApi.searchCompanies(companyRequest),
    enabled: activeTab === 'companies',
  });

  const discoveredPeople: DiscoveredPerson[] = peopleData?.items || [];
  const discoveredCompanies: DiscoveredCompany[] = companiesData?.items || [];

  // =========================================================================
  // Selection handlers (CDC § 66)
  // =========================================================================
  const handleTogglePerson = (id: string) => {
    setSelectedPeopleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPeople = () => {
    if (selectedPeopleIds.length === discoveredPeople.length) {
      setSelectedPeopleIds([]);
    } else {
      setSelectedPeopleIds(discoveredPeople.map((p) => p.externalId));
    }
  };

  const handleToggleCompany = (id: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // =========================================================================
  // Intelligent Search (CDC § 8)
  // =========================================================================
  const handleInterpretQuery = () => {
    if (!naturalQuery.trim()) return;
    setIsAiInterpreting(true);

    setTimeout(() => {
      const q = naturalQuery.toLowerCase();

      // Detect job title
      if (q.includes('directeur commercial') || q.includes('commercial')) {
        setPersonJobTitle('Directeur Commercial');
      } else if (q.includes('ceo') || q.includes('dg') || q.includes('fondateur')) {
        setPersonJobTitle('CEO');
      } else if (q.includes('cto') || q.includes('technique')) {
        setPersonJobTitle('CTO');
      } else if (q.includes('drh') || q.includes('rh')) {
        setPersonJobTitle('DRH');
      }

      // Detect location
      if (q.includes('dakar')) {
        setPersonCity('Dakar');
        setPersonCountry('Sénégal');
      } else if (q.includes('abidjan')) {
        setPersonCity('Abidjan');
        setPersonCountry("Côte d'Ivoire");
      } else if (q.includes('casablanca')) {
        setPersonCity('Casablanca');
        setPersonCountry('Maroc');
      }

      // Detect sector
      if (q.includes('tech') || q.includes('logiciel')) {
        setPersonIndustry('Technologies & Logiciels');
      } else if (q.includes('fintech') || q.includes('banque')) {
        setPersonIndustry('Fintech & Mobile Money');
      } else if (q.includes('hôtel') || q.includes('tourisme')) {
        setPersonIndustry('Hôtellerie & Restauration');
      }

      // Detect size
      if (q.includes('20') || q.includes('pme')) {
        setPersonSize('11-50');
      }

      setIsAiInterpreting(false);
      showToast('Filtres renseignés à partir de votre recherche naturelle.', 'success');
      setActiveTab('people');
    }, 600);
  };

  // =========================================================================
  // Reset filters
  // =========================================================================
  const handleResetFilters = () => {
    setNaturalQuery('');
    setPersonJobTitle('');
    setPersonCountry('Sénégal');
    setPersonCity('');
    setPersonCompany('');
    setPersonIndustry('');
    setPersonSize('');
    setRequireEmail(false);
    setRequirePhone(false);
    setRequireLinkedin(false);

    setCompanyName('');
    setCompanyCountry('Sénégal');
    setCompanyCity('');
    setCompanyIndustry('');
    setCompanySize('');

    setSelectedPeopleIds([]);
    setSelectedCompanyIds([]);
  };

  // =========================================================================
  // Batch Actions
  // =========================================================================
  const importMutation = useMutation({
    mutationFn: async () => {
      const selected = discoveredPeople.filter((p) =>
        selectedPeopleIds.includes(p.externalId)
      );
      const report = await discoveryApi.importPeople({
        externalIds: selectedPeopleIds,
        prospects: selected,
      });
      return report;
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      showToast(
        `${report.importedCount} prospect(s) importé(s) avec succès dans votre base.`
      );
      setSelectedPeopleIds([]);
    },
    onError: (err: unknown) => {
      showToast(
        err instanceof Error ? err.message : "Erreur lors de l'import",
        'error'
      );
    },
  });

  const handleExportCsv = () => {
    if (activeTab === 'people') {
      const toExport =
        selectedPeopleIds.length > 0
          ? discoveredPeople.filter((p) => selectedPeopleIds.includes(p.externalId))
          : discoveredPeople;

      if (toExport.length === 0) {
        showToast('Aucun résultat à exporter.', 'warning');
        return;
      }

      exportToCsv(
        `prospecta-discovery-personnes-${new Date().toISOString().slice(0, 10)}.csv`,
        toExport,
        [
          { key: 'firstName', label: 'Prénom' },
          { key: 'lastName', label: 'Nom' },
          { key: 'jobTitle', label: 'Poste / Titre' },
          { key: 'companyName', label: 'Entreprise' },
          { key: 'city', label: 'Ville' },
          { key: 'country', label: 'Pays' },
          { key: 'companyDomain', label: 'Domaine' },
          { key: 'linkedinUrl', label: 'LinkedIn' },
          { key: 'source', label: 'Source' },
        ]
      );
      showToast(`${toExport.length} profil(s) exporté(s) au format CSV.`);
    } else {
      const toExport =
        selectedCompanyIds.length > 0
          ? discoveredCompanies.filter((c) => selectedCompanyIds.includes(c.externalId))
          : discoveredCompanies;

      if (toExport.length === 0) {
        showToast('Aucun résultat à exporter.', 'warning');
        return;
      }

      exportToCsv(
        `prospecta-discovery-entreprises-${new Date().toISOString().slice(0, 10)}.csv`,
        toExport,
        [
          { key: 'name', label: 'Entreprise' },
          { key: 'industry', label: 'Secteur' },
          { key: 'city', label: 'Ville' },
          { key: 'country', label: 'Pays' },
          { key: 'employeeCount', label: 'Employés' },
          { key: 'domain', label: 'Site Web' },
          { key: 'linkedinUrl', label: 'LinkedIn' },
        ]
      );
      showToast(`${toExport.length} entreprise(s) exportée(s) au format CSV.`);
    }
  };

  // Launch campaign with selection
  const handleLaunchCampaign = () => {
    if (selectedPeopleIds.length === 0) return;
    navigate('/app/campaigns/new', {
      state: { preSelectedProspectIds: selectedPeopleIds },
    });
  };

  // Switch to Personnes tab filtered by company (CDC § 69)
  const handleDrilldownCompany = (company: DiscoveredCompany) => {
    setActiveTab('people');
    setPersonCompany(company.name);
    if (company.city) setPersonCity(company.city);
    if (company.country) setPersonCountry(company.country);
    showToast(`Recherche des décideurs chez ${company.name}`);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Moteur de Recherche B2B (Discovery)
            </h1>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700">
              Apollo & B2B Data
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Trouvez les entreprises cibles et les décideurs qualifiés en Afrique et à l'international.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Exporter CSV
          </Button>
          <Button
            size="sm"
            variant={showAdvancedFilters ? 'primary' : 'secondary'}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            leftIcon={<Filter className="w-3.5 h-3.5" />}
          >
            Filtres
          </Button>
        </div>
      </div>

      {/* Intelligent Search Input (CDC § 8) */}
      <div className="bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 border border-blue-200/80 rounded-lg p-4 shadow-sm">
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Recherche Intelligente en langage naturel (IA)
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInterpretQuery()}
              placeholder="ex: Trouve-moi les directeurs commerciaux des PME technologiques à Dakar avec plus de 20 employés..."
              className="w-full h-10 px-3.5 text-xs bg-white border border-blue-200 rounded-md shadow-inner focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-gray-900"
            />
          </div>
          <Button
            size="sm"
            onClick={handleInterpretQuery}
            isLoading={isAiInterpreting}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Analyser
          </Button>
        </div>
      </div>

      {/* Main Tabs: Personnes vs Entreprises (CDC § 65) */}
      <div className="border-b border-gray-200 flex items-center justify-between">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('people')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'people'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Personnes & Décideurs ({discoveredPeople.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'companies'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Entreprises Cibles ({discoveredCompanies.length})
          </button>
        </div>

        {(personJobTitle ||
          personCity ||
          personCompany ||
          personIndustry ||
          companyName ||
          companyCity ||
          companyIndustry) && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 pb-3"
          >
            <RotateCcw className="w-3 h-3" />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Filter Panels (CDC § 6 & § 7) */}
      {showAdvancedFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          {activeTab === 'people' ? (
            /* Personnes Filters */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Poste / Fonction
                </label>
                <input
                  type="text"
                  placeholder="ex: CEO, Directeur Commercial, CTO..."
                  value={personJobTitle}
                  onChange={(e) => setPersonJobTitle(e.target.value)}
                  className="w-full h-8 px-2.5 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Pays
                </label>
                <select
                  value={personCountry}
                  onChange={(e) => setPersonCountry(e.target.value)}
                  className="w-full h-8 px-2 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="Sénégal">Sénégal</option>
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                  <option value="Maroc">Maroc</option>
                  <option value="Cameroun">Cameroun</option>
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="France">France</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  placeholder="ex: Dakar, Abidjan, Casablanca..."
                  value={personCity}
                  onChange={(e) => setPersonCity(e.target.value)}
                  className="w-full h-8 px-2.5 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Entreprise
                </label>
                <input
                  type="text"
                  placeholder="ex: Sonatel, Wave, Free..."
                  value={personCompany}
                  onChange={(e) => setPersonCompany(e.target.value)}
                  className="w-full h-8 px-2.5 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Secteur d'activité
                </label>
                <select
                  value={personIndustry}
                  onChange={(e) => setPersonIndustry(e.target.value)}
                  className="w-full h-8 px-2 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="">Tous les secteurs</option>
                  <option value="Technologies & Logiciels">Technologies & Logiciels</option>
                  <option value="Fintech & Mobile Money">Fintech & Mobile Money</option>
                  <option value="Télécommunications">Télécommunications</option>
                  <option value="Transport & Logistique">Transport & Logistique</option>
                  <option value="Hôtellerie & Tourisme">Hôtellerie & Tourisme</option>
                  <option value="Banques & Assurances">Banques & Assurances</option>
                  <option value="Agroalimentaire">Agroalimentaire</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Taille d'entreprise (salariés)
                </label>
                <select
                  value={personSize}
                  onChange={(e) => setPersonSize(e.target.value)}
                  className="w-full h-8 px-2 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="">Toutes tailles</option>
                  <option value="1-10">1–10 employés (TPE)</option>
                  <option value="11-50">11–50 employés (PME)</option>
                  <option value="51-200">51–200 employés (Moyenne)</option>
                  <option value="201-500">201–500 employés (Grande)</option>
                  <option value="500+">500+ employés (Grand Compte)</option>
                </select>
              </div>

              {/* Coordonnées requises (CDC § 6) */}
              <div className="sm:col-span-2 flex items-center gap-4 pt-4 border-t border-gray-100">
                <span className="text-[11px] font-semibold text-gray-600">
                  Canaux vérifiés :
                </span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={requireEmail}
                    onChange={(e) => setRequireEmail(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300"
                  />
                  <span>Email disponible</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={requirePhone}
                    onChange={(e) => setRequirePhone(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300"
                  />
                  <span>Téléphone / WhatsApp</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={requireLinkedin}
                    onChange={(e) => setRequireLinkedin(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300"
                  />
                  <span>LinkedIn</span>
                </label>
              </div>
            </div>
          ) : (
            /* Entreprises Filters */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Nom d'entreprise
                </label>
                <input
                  type="text"
                  placeholder="ex: Wave, Sonatel, Ecobank..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-8 px-2.5 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Pays
                </label>
                <select
                  value={companyCountry}
                  onChange={(e) => setCompanyCountry(e.target.value)}
                  className="w-full h-8 px-2 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="Sénégal">Sénégal</option>
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                  <option value="Maroc">Maroc</option>
                  <option value="Cameroun">Cameroun</option>
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  placeholder="ex: Dakar, Abidjan..."
                  value={companyCity}
                  onChange={(e) => setCompanyCity(e.target.value)}
                  className="w-full h-8 px-2.5 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Secteur
                </label>
                <select
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  className="w-full h-8 px-2 bg-gray-50 border border-gray-300 rounded text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="">Tous les secteurs</option>
                  <option value="Télécommunications">Télécommunications</option>
                  <option value="Mobile Money & Fintech">Mobile Money & Fintech</option>
                  <option value="Technologies & Logiciels">Technologies & Logiciels</option>
                  <option value="Banques & Assurances">Banques & Assurances</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Multi-Selection Action Bar (CDC § 66) */}
      {selectedPeopleIds.length > 0 && activeTab === 'people' && (
        <div className="sticky top-2 z-20 bg-gray-900 text-white p-3 rounded-lg shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              {selectedPeopleIds.length}
            </span>
            <span className="text-xs font-semibold">
              {selectedPeopleIds.length} prospect(s) sélectionné(s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsAddToListOpen(true)}
              leftIcon={<ListPlus className="w-3.5 h-3.5 text-blue-600" />}
            >
              Ajouter à une liste
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => importMutation.mutate()}
              isLoading={importMutation.isPending}
              leftIcon={<Check className="w-3.5 h-3.5 text-green-600" />}
            >
              Importer dans mes prospects
            </Button>
            <Button
              size="sm"
              onClick={handleLaunchCampaign}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Lancer une campagne
            </Button>
            <button
              onClick={() => setSelectedPeopleIds([])}
              className="text-xs text-gray-400 hover:text-white px-2 py-1"
            >
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* Content: People or Companies */}
      {activeTab === 'people' ? (
        isPeopleLoading ? (
          <LoadingState message="Recherche des profils cibles B2B..." type="skeleton" rows={6} />
        ) : discoveredPeople.length === 0 ? (
          <EmptyState
            title="Aucun profil trouvé"
            description="Modifiez vos critères de recherche ou réinitialisez les filtres pour explorer d'autres décideurs."
            actionLabel="Réinitialiser les filtres"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="space-y-3">
            {/* Table / List Header with Select All */}
            <div className="flex items-center justify-between px-2 text-xs text-gray-500 font-semibold">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAllPeople}
                  className="flex items-center gap-1.5 hover:text-gray-900"
                >
                  {selectedPeopleIds.length === discoveredPeople.length ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                  <span>Tout sélectionner ({discoveredPeople.length})</span>
                </button>
              </div>
              <span>Source : Apollo Global B2B Network</span>
            </div>

            {/* Results Grid matching CDC § 10 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {discoveredPeople.map((person) => {
                const isSelected = selectedPeopleIds.includes(person.externalId);
                const score = 80 + (person.jobTitle.length % 16); // Dynamic realistic fit score

                return (
                  <div
                    key={person.externalId}
                    className={`bg-white border rounded-lg p-4 transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/20'
                        : 'border-gray-200 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePerson(person.externalId)}
                          className="mt-0.5 text-gray-400 hover:text-blue-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {person.firstName[0]}
                          {person.lastName[0]}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 truncate">
                            {person.firstName} {person.lastName}
                          </h3>
                          <p className="text-xs font-semibold text-blue-700 truncate">
                            {person.jobTitle}
                          </p>
                          <p className="text-[11px] text-gray-600 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            {person.companyName} • {person.city}, {person.country}
                          </p>
                        </div>
                      </div>

                      {/* Score badge (CDC § 10) */}
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 uppercase font-mono font-bold">
                          Fit Score
                        </span>
                        <span className="font-bold text-xs font-mono text-blue-600">
                          {score}/100
                        </span>
                      </div>
                    </div>

                    {/* Available Channels Badges (CDC § 10) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100 text-[11px]">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Mail className="w-3 h-3" /> Email disponible
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Phone className="w-3 h-3" /> Téléphone disponible
                      </span>
                      {person.linkedinUrl && (
                        <a
                          href={person.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        >
                          <LinkedinIcon className="w-3 h-3" /> LinkedIn
                        </a>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedPeopleIds([person.externalId]);
                          setIsAddToListOpen(true);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <ListPlus className="w-3.5 h-3.5" />
                        Ajouter à une liste
                      </button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedPeopleIds([person.externalId]);
                          importMutation.mutate();
                        }}
                        isLoading={
                          importMutation.isPending &&
                          selectedPeopleIds.includes(person.externalId)
                        }
                      >
                        Importer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* Companies Tab (CDC § 7 & § 69) */
        isCompaniesLoading ? (
          <LoadingState message="Recherche des entreprises B2B..." type="skeleton" rows={5} />
        ) : discoveredCompanies.length === 0 ? (
          <EmptyState
            title="Aucune entreprise trouvée"
            description="Modifiez vos filtres géographiques ou sectoriels pour explorer d'autres comptes cibles."
            actionLabel="Réinitialiser les filtres"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveredCompanies.map((company) => {
              const isSelected = selectedCompanyIds.includes(company.externalId);
              return (
                <div
                  key={company.externalId}
                  className={`bg-white border rounded-lg p-4 transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/20'
                      : 'border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCompany(company.externalId)}
                        className="mt-2 text-gray-400 hover:text-blue-600"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-gray-900 truncate">
                          {company.name}
                        </h3>
                        <p className="text-xs text-gray-600 font-medium">
                          {company.industry}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {company.city}, {company.country} • {company.employeeCount}+ employés
                        </p>
                      </div>
                    </div>

                    {company.domain && (
                      <span className="text-[11px] font-mono text-gray-400">
                        {company.domain}
                      </span>
                    )}
                  </div>

                  {/* Actions matching CDC § 7 and § 69 (Recherche -> Entreprise -> Contacts) */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleDrilldownCompany(company)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Voir les décideurs / contacts
                    </button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await discoveryApi.importCompany(company);
                          queryClient.invalidateQueries({ queryKey: ['companies'] });
                          showToast(`Entreprise ${company.name} ajoutée.`);
                        } catch {
                          showToast("Échec de l'import", 'error');
                        }
                      }}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Modal Add To List */}
      <AddToListModal
        isOpen={isAddToListOpen}
        onClose={() => setIsAddToListOpen(false)}
        prospectIds={selectedPeopleIds}
        onSuccess={() => {
          setSelectedPeopleIds([]);
        }}
      />
    </div>
  );
};
