import type { Prospect, LeadScore } from '../types';
import { initialProspects } from './mockData';

const STORAGE_KEY = 'prospecta_prospects';

function loadProspects(): Prospect[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...initialProspects];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProspects));
  return [...initialProspects];
}

function saveProspects(prospects: Prospect[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects));
}

export const prospectsApi = {
  async getProspects(params?: {
    query?: string;
    status?: string;
    sector?: string;
    city?: string;
    scoreMin?: number;
  }): Promise<Prospect[]> {
    await new Promise((r) => setTimeout(r, 200));
    let list = loadProspects();

    if (params?.query) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          p.jobTitle.toLowerCase().includes(q) ||
          p.phone.includes(q)
      );
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((p) => p.status === params.status);
    }

    if (params?.sector && params.sector !== 'all') {
      list = list.filter((p) => p.sector === params.sector);
    }

    if (params?.city && params.city !== 'all') {
      list = list.filter((p) => p.city.toLowerCase() === params.city?.toLowerCase());
    }

    if (params?.scoreMin) {
      list = list.filter((p) => p.score.score >= params.scoreMin!);
    }

    return list;
  },

  async getProspectById(id: string): Promise<Prospect | null> {
    await new Promise((r) => setTimeout(r, 150));
    const list = loadProspects();
    return list.find((p) => p.id === id) || null;
  },

  async createProspect(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    jobTitle: string;
    city: string;
    sector: string;
    source?: 'manual' | 'csv' | 'campaign' | 'linkedin';
    notes?: string;
  }): Promise<Prospect> {
    await new Promise((r) => setTimeout(r, 300));
    const list = loadProspects();

    // Default calculated score
    const defaultScore: LeadScore = {
      score: 75,
      level: 'Moyen',
      factors: [
        { label: 'Correspondance ICP', points: 25, description: 'Profil standard qualifié' },
        { label: 'Décideur identifié', points: 20, description: data.jobTitle },
        { label: 'Secteur cible', points: 20, description: data.sector },
        { label: 'Coordonnées directes', points: 10, description: 'Téléphone & email fournis' },
      ],
    };

    const newProspect: Prospect = {
      id: `pros-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      companyId: `comp-custom-${Date.now()}`,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      city: data.city || 'Dakar',
      sector: data.sector || 'Services B2B',
      score: defaultScore,
      status: 'new',
      source: data.source || 'manual',
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: data.notes,
    };

    list.unshift(newProspect);
    saveProspects(list);
    return newProspect;
  },

  async updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect> {
    await new Promise((r) => setTimeout(r, 200));
    const list = loadProspects();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Prospect introuvable');
    }

    const updated = {
      ...list[index],
      ...updates,
      lastActivityAt: new Date().toISOString(),
    };
    list[index] = updated;
    saveProspects(list);
    return updated;
  },

  async deleteProspect(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    let list = loadProspects();
    list = list.filter((p) => p.id !== id);
    saveProspects(list);
  },

  async importProspectsFromCsv(rows: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName: string;
    jobTitle: string;
    city?: string;
    sector?: string;
  }>): Promise<{ importedCount: number; prospects: Prospect[] }> {
    await new Promise((r) => setTimeout(r, 600));
    const list = loadProspects();
    const created: Prospect[] = [];

    rows.forEach((row, idx) => {
      const p: Prospect = {
        id: `pros-import-${Date.now()}-${idx}`,
        firstName: row.firstName || 'Contact',
        lastName: row.lastName || `${idx + 1}`,
        email: row.email || `contact${idx}@entreprise.sn`,
        phone: row.phone || '+221 77 000 00 00',
        companyId: `comp-imp-${idx}`,
        companyName: row.companyName || 'Entreprise Partenaire',
        jobTitle: row.jobTitle || 'Responsable',
        city: row.city || 'Dakar',
        sector: row.sector || 'Commerce Général',
        score: {
          score: 70,
          level: 'Moyen',
          factors: [
            { label: 'Import CSV vérifié', points: 30 },
            { label: 'Coordonnées complètes', points: 25 },
            { label: 'Secteur renseigné', points: 15 },
          ],
        },
        status: 'new',
        source: 'csv',
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      created.push(p);
      list.unshift(p);
    });

    saveProspects(list);
    return { importedCount: created.length, prospects: created };
  },
};
