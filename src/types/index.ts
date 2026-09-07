export type Channel = 'whatsapp' | 'email' | 'sms';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'meeting' | 'unresponsive' | 'opted_out';

export type PipelineStage = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'meeting'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface ScoreFactor {
  label: string;
  points: number;
  description?: string;
}

export interface LeadScore {
  score: number;
  level: 'Faible' | 'Moyen' | 'Élevé';
  factors: ScoreFactor[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  organizationName: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  currency: string; // 'FCFA'
  timezone: string; // 'Africa/Dakar'
  country: string; // 'Sénégal'
  phonePrefix: string; // '+221'
  whatsappConnected?: boolean;
  whatsappPhoneNumber?: string;
  whatsappAccountName?: string;
}

export interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyId: string;
  companyName: string;
  jobTitle: string;
  city: string;
  sector: string;
  score: LeadScore;
  status: LeadStatus;
  source: 'manual' | 'csv' | 'campaign' | 'linkedin';
  lastActivityAt: string;
  createdAt: string;
  notes?: string;
}

export interface CompanyAIAnalysis {
  summary: string;
  keyPoints: string[];
  opportunities: string[];
  recommendedApproach: string;
  lastAnalyzedAt: string;
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  city: string;
  website: string;
  size: string;
  contactCount: number;
  score: number;
  phone?: string;
  aiAnalysis?: CompanyAIAnalysis;
  createdAt: string;
}

export interface CampaignStep {
  stepNumber: number;
  channel: Channel;
  delayDays: number;
  subject?: string;
  content: string;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  icp: string;
  status: CampaignStatus;
  channels: Channel[];
  totalProspects: number;
  sentCount: number;
  replyCount: number;
  meetingCount: number;
  steps: CampaignStep[];
  targetAudience?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  prospectId: string;
  prospectName: string;
  companyName: string;
  channel: Channel;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  suggestedReply?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'prospect' | 'user' | 'system';
  content: string;
  channel: Channel;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Opportunity {
  id: string;
  title: string;
  prospectId: string;
  prospectName: string;
  companyName: string;
  value: number; // In FCFA
  stage: PipelineStage;
  probability: number;
  lastActivityAt: string;
  expectedCloseDate: string;
}

export interface AnalyticsSummary {
  totalProspects: number;
  qualifiedProspects: number;
  activeCampaigns: number;
  totalOpportunities: number;
  totalPipelineValue: number;
  conversionRate: number;
  replyRate: number;
  activityTimeline: {
    period: string;
    sent: number;
    replies: number;
    meetings: number;
  }[];
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: Record<string, string[]>;
}
