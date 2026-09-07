import type { Campaign, CampaignStatus } from '../types';
import { initialCampaigns } from './mockData';

const STORAGE_KEY = 'prospecta_campaigns';

function loadCampaigns(): Campaign[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...initialCampaigns];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCampaigns));
  return [...initialCampaigns];
}

function saveCampaigns(campaigns: Campaign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

export const campaignsApi = {
  async getCampaigns(): Promise<Campaign[]> {
    await new Promise((r) => setTimeout(r, 200));
    return loadCampaigns();
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    await new Promise((r) => setTimeout(r, 150));
    const list = loadCampaigns();
    return list.find((c) => c.id === id) || null;
  },

  async createCampaign(data: {
    name: string;
    objective: string;
    icp: string;
    targetAudience?: string;
    channels: Campaign['channels'];
    totalProspects: number;
    steps: Campaign['steps'];
    status?: CampaignStatus;
  }): Promise<Campaign> {
    await new Promise((r) => setTimeout(r, 400));
    const list = loadCampaigns();

    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: data.name,
      objective: data.objective,
      icp: data.icp,
      targetAudience: data.targetAudience || 'Décideurs B2B',
      channels: data.channels,
      totalProspects: data.totalProspects,
      sentCount: data.status === 'active' ? data.totalProspects : 0,
      replyCount: 0,
      meetingCount: 0,
      status: data.status || 'draft',
      steps: data.steps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newCampaign);
    saveCampaigns(list);
    return newCampaign;
  },

  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    await new Promise((r) => setTimeout(r, 200));
    const list = loadCampaigns();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Campagne introuvable');
    }

    const updated = {
      ...list[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    saveCampaigns(list);
    return updated;
  },

  async deleteCampaign(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    let list = loadCampaigns();
    list = list.filter((c) => c.id !== id);
    saveCampaigns(list);
  },
};
