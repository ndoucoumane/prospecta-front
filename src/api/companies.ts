import type { Company, CompanyAIAnalysis } from '../types';
import { initialCompanies } from './mockData';

const STORAGE_KEY = 'prospecta_companies';

function loadCompanies(): Company[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...initialCompanies];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCompanies));
  return [...initialCompanies];
}

function saveCompanies(companies: Company[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

export const companiesApi = {
  async getCompanies(params?: { query?: string; sector?: string; city?: string }): Promise<Company[]> {
    await new Promise((r) => setTimeout(r, 200));
    let list = loadCompanies();

    if (params?.query) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.website.toLowerCase().includes(q)
      );
    }

    if (params?.sector && params.sector !== 'all') {
      list = list.filter((c) => c.sector === params.sector);
    }

    if (params?.city && params.city !== 'all') {
      list = list.filter((c) => c.city.toLowerCase() === params.city?.toLowerCase());
    }

    return list;
  },

  async getCompanyById(id: string): Promise<Company | null> {
    await new Promise((r) => setTimeout(r, 150));
    const list = loadCompanies();
    return list.find((c) => c.id === id) || null;
  },

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    await new Promise((r) => setTimeout(r, 200));
    const list = loadCompanies();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Entreprise introuvable');
    }

    const updated = { ...list[index], ...updates };
    list[index] = updated;
    saveCompanies(list);
    return updated;
  },

  async refreshAIAnalysis(companyId: string): Promise<CompanyAIAnalysis> {
    await new Promise((r) => setTimeout(r, 700));
    const list = loadCompanies();
    const company = list.find((c) => c.id === companyId);
    if (!company) {
      throw new Error('Entreprise introuvable');
    }

    const newAnalysis: CompanyAIAnalysis = {
      summary: `Analyse mise à jour pour ${company.name} (${company.city}). Société active dans le secteur ${company.sector}, présentant une maturité commerciale favorable et une opportunité élevée d'automatisation des relances B2B.`,
      keyPoints: [
        `Forte présence sur le marché de ${company.city}`,
        `Effectif estimé : ${company.size} collaborateurs`,
        'Cycles de signature commerciale propices aux approches multicanales (Email + WhatsApp)',
      ],
      opportunities: [
        'Optimisation du pipeline de prospection pour les grands comptes',
        'Réduction du temps de qualification des leads entrants de 40%',
        'Campagne de ciblage spécifique sur l\'écosystème sénégalais',
      ],
      recommendedApproach: `Prendre contact directement avec les décideurs via une séquence combinant email professionnel personnalisé et relance WhatsApp sobre, centrée sur le gain de temps commercial.`,
      lastAnalyzedAt: new Date().toISOString(),
    };

    company.aiAnalysis = newAnalysis;
    saveCompanies(list);
    return newAnalysis;
  },
};
