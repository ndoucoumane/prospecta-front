import type { Opportunity, PipelineStage } from '../types';
import { initialOpportunities } from './mockData';

const STORAGE_KEY = 'prospecta_opportunities';

function loadOpportunities(): Opportunity[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...initialOpportunities];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOpportunities));
  return [...initialOpportunities];
}

function saveOpportunities(opps: Opportunity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(opps));
}

export const pipelineApi = {
  async getOpportunities(): Promise<Opportunity[]> {
    await new Promise((r) => setTimeout(r, 150));
    return loadOpportunities();
  },

  async createOpportunity(data: {
    title: string;
    prospectId: string;
    prospectName: string;
    companyName: string;
    value: number;
    stage: PipelineStage;
    probability?: number;
    expectedCloseDate?: string;
  }): Promise<Opportunity> {
    await new Promise((r) => setTimeout(r, 300));
    const list = loadOpportunities();

    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      title: data.title,
      prospectId: data.prospectId,
      prospectName: data.prospectName,
      companyName: data.companyName,
      value: data.value,
      stage: data.stage,
      probability: data.probability || 50,
      lastActivityAt: new Date().toISOString(),
      expectedCloseDate: data.expectedCloseDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    };

    list.unshift(newOpp);
    saveOpportunities(list);
    return newOpp;
  },

  async updateOpportunityStage(id: string, stage: PipelineStage): Promise<Opportunity> {
    await new Promise((r) => setTimeout(r, 150));
    const list = loadOpportunities();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error('Opportunité introuvable');
    }

    list[index].stage = stage;
    list[index].lastActivityAt = new Date().toISOString();
    saveOpportunities(list);
    return list[index];
  },

  async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    await new Promise((r) => setTimeout(r, 200));
    const list = loadOpportunities();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error('Opportunité introuvable');
    }

    list[index] = {
      ...list[index],
      ...updates,
      lastActivityAt: new Date().toISOString(),
    };
    saveOpportunities(list);
    return list[index];
  },

  async deleteOpportunity(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    let list = loadOpportunities();
    list = list.filter((o) => o.id !== id);
    saveOpportunities(list);
  },
};
