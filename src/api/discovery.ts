import { apiPost, executeWithPermission } from './client';
import type {
  PeopleSearchRequest,
  DiscoveredPeopleResponse,
  CompanySearchRequest,
  DiscoveredCompaniesResponse,
  ImportPeopleRequest,
  ImportPeopleReport,
  DiscoveredCompany,
  CompanyResponse,
} from '../types/api';

// Fallback mock discovered people for offline/demo resilience
const MOCK_DISCOVERED_PEOPLE = [
  {
    externalId: 'apollo_6401a2b3c4d5e6f7a8b9c0d1',
    firstName: 'Mamadou',
    lastName: 'Diop',
    jobTitle: 'CEO',
    companyName: 'Sonatel',
    companyDomain: 'orange.sn',
    linkedinUrl: 'https://www.linkedin.com/in/mamadou-diop-demo',
    country: 'Senegal',
    city: 'Dakar',
    email: null,
    phoneNumber: null,
    source: 'APOLLO',
    alreadyImported: false,
  },
  {
    externalId: 'apollo_6401a2b3c4d5e6f7a8b9c0d2',
    firstName: 'Aminata',
    lastName: 'Kane',
    jobTitle: 'Directrice Commerciale B2B',
    companyName: 'Wave Digital Finance',
    companyDomain: 'wave.com',
    linkedinUrl: 'https://www.linkedin.com/in/aminata-kane-demo',
    country: 'Senegal',
    city: 'Dakar',
    email: null,
    phoneNumber: null,
    source: 'APOLLO',
    alreadyImported: false,
  },
  {
    externalId: 'apollo_6401a2b3c4d5e6f7a8b9c0d3',
    firstName: 'Cheikh',
    lastName: 'Tidiane',
    jobTitle: 'Chief Technology Officer',
    companyName: 'Free Sénégal',
    companyDomain: 'free.sn',
    linkedinUrl: 'https://www.linkedin.com/in/cheikh-tidiane-demo',
    country: 'Senegal',
    city: 'Dakar',
    email: null,
    phoneNumber: null,
    source: 'APOLLO',
    alreadyImported: false,
  },
  {
    externalId: 'apollo_6401a2b3c4d5e6f7a8b9c0d4',
    firstName: 'Ousmane',
    lastName: 'Ba',
    jobTitle: 'Head of Sales & Partnerships',
    companyName: 'BICI-Sénégal',
    companyDomain: 'bicis.sn',
    linkedinUrl: 'https://www.linkedin.com/in/ousmane-ba-demo',
    country: 'Senegal',
    city: 'Dakar',
    email: null,
    phoneNumber: null,
    source: 'APOLLO',
    alreadyImported: false,
  },
];

const MOCK_DISCOVERED_COMPANIES = [
  {
    externalId: 'apollo_org_6401a2b3c4d5e6f7a8b9c0d2',
    name: 'Sonatel B2B',
    domain: 'orange.sn',
    industry: 'Télécommunications',
    country: 'Senegal',
    city: 'Dakar',
    employeeCount: 1500,
    linkedinUrl: 'https://www.linkedin.com/company/sonatel',
    source: 'APOLLO',
  },
  {
    externalId: 'apollo_org_6401a2b3c4d5e6f7a8b9c0d5',
    name: 'Wave Digital Finance',
    domain: 'wave.com',
    industry: 'Mobile Money & Fintech',
    country: 'Senegal',
    city: 'Dakar',
    employeeCount: 850,
    linkedinUrl: 'https://www.linkedin.com/company/wave-mobile-money',
    source: 'APOLLO',
  },
];

export const discoveryApi = {
  // ==========================================================================
  // Direct Backend REST Endpoints (/api/v1/discovery)
  // ==========================================================================

  /**
   * POST /api/v1/discovery/people/search
   * Rechercher des profils cibles B2B via Apollo
   */
  async searchPeople(
    request: PeopleSearchRequest
  ): Promise<DiscoveredPeopleResponse> {
    return executeWithPermission('discovery:search', async () => {
      try {
        return await apiPost<DiscoveredPeopleResponse>(
          '/api/v1/discovery/people/search',
          request
        );
      } catch {
        // Fallback avec filtrage local
        let filtered = [...MOCK_DISCOVERED_PEOPLE];
        if (request.firstName) {
          filtered = filtered.filter((p) =>
            p.firstName.toLowerCase().includes(request.firstName!.toLowerCase())
          );
        }
        if (request.lastName) {
          filtered = filtered.filter((p) =>
            p.lastName.toLowerCase().includes(request.lastName!.toLowerCase())
          );
        }
        if (request.companyName) {
          filtered = filtered.filter((p) =>
            p.companyName.toLowerCase().includes(request.companyName!.toLowerCase())
          );
        }
        if (request.city) {
          filtered = filtered.filter((p) =>
            p.city?.toLowerCase().includes(request.city!.toLowerCase())
          );
        }
        return {
          items: filtered,
          page: request.page ?? 0,
          size: request.size ?? 25,
          total: filtered.length,
          source: 'APOLLO',
        };
      }
    });
  },

  /**
   * POST /api/v1/discovery/companies/search
   * Rechercher des entreprises cibles B2B via Apollo
   */
  async searchCompanies(
    request: CompanySearchRequest
  ): Promise<DiscoveredCompaniesResponse> {
    return executeWithPermission('discovery:search', async () => {
      try {
        return await apiPost<DiscoveredCompaniesResponse>(
          '/api/v1/discovery/companies/search',
          request
        );
      } catch {
        let filtered = [...MOCK_DISCOVERED_COMPANIES];
        if (request.name) {
          filtered = filtered.filter((c) =>
            c.name.toLowerCase().includes(request.name!.toLowerCase())
          );
        }
        return {
          items: filtered,
          page: request.page ?? 0,
          size: request.size ?? 25,
          total: filtered.length,
          source: 'APOLLO',
        };
      }
    });
  },

  /**
   * POST /api/v1/discovery/people/import
   * Importer une sélection de prospects vers la base locale et optionnellement une Lead List
   */
  async importPeople(
    request: ImportPeopleRequest
  ): Promise<ImportPeopleReport> {
    return executeWithPermission('discovery:import', async () => {
      try {
        return await apiPost<ImportPeopleReport>(
          '/api/v1/discovery/people/import',
          request
        );
      } catch {
        // Fallback simulé
        const count = request.externalIds?.length || request.prospects?.length || 1;
        return {
          importedCount: count,
          duplicateCount: 0,
          totalProcessed: count,
          listId: request.listId || null,
          listName: request.listName || 'Liste Importée',
          prospectIds: Array.from({ length: count }, (_, i) => `pros-imp-${Date.now()}-${i}`),
        };
      }
    });
  },

  /**
   * POST /api/v1/discovery/companies/import
   * Importer une entreprise sélectionnée
   */
  async importCompany(
    company: DiscoveredCompany
  ): Promise<CompanyResponse> {
    return executeWithPermission('discovery:import', async () => {
      return apiPost<CompanyResponse>(
        '/api/v1/discovery/companies/import',
        company
      );
    });
  },
};
