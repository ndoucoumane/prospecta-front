import type { AnalyticsSummary } from '../types';
import { initialAnalytics } from './mockData';

export const analyticsApi = {
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    await new Promise((r) => setTimeout(r, 200));
    return initialAnalytics;
  },
};
