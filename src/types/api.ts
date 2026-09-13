// ============================================================================
// Prospecta Backend DTOs & API Contracts
// Aligned with the Prospecta REST API Specification
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Conventions Globales & Enveloppes
// ----------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    traceId?: string;
    details?: string[];
  };
}

// ----------------------------------------------------------------------------
// 2. Énumérations Métier
// ----------------------------------------------------------------------------

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ORG_ADMIN'
  | 'SALES_MANAGER'
  | 'SALES_REP'
  | 'VIEWER';

export type UserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';

export type ChannelType = 'WHATSAPP' | 'EMAIL' | 'SMS' | 'LINKEDIN';

export type ProspectStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'REPLIED'
  | 'MEETING_BOOKED'
  | 'OPPORTUNITY'
  | 'CUSTOMER'
  | 'UNRESPONSIVE'
  | 'OPTED_OUT'
  | 'INVALID';

export type LeadScoreLevel = 'HOT' | 'WARM' | 'COLD';

export type CampaignStatusBackend =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ARCHIVED';

export type ConversationStatus = 'OPEN' | 'PENDING' | 'REPLIED' | 'CLOSED' | 'ARCHIVED';

export type MessageDirection = 'OUTBOUND' | 'INBOUND';

export type OpportunityStageBackend =
  | 'NEW'
  | 'QUALIFICATION'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type OrganizationPlan = 'FREE' | 'STARTER' | 'BUSINESS' | 'PROFESSIONAL';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'
  | 'INCOMPLETE';

// ----------------------------------------------------------------------------
// 1.1 Inscription, Connexion & Session (/api/v1/auth)
// ----------------------------------------------------------------------------

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  scope: string;
}

export interface AuthUserResponse {
  id: string;
  organizationId: string;
  keycloakSubject?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string | null;
  jobTitle?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: AuthTokenResponse;
  user: AuthUserResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName?: string;
  phone?: string;
}

// ----------------------------------------------------------------------------
// 3. Organisations & Espaces de Travail (/api/v1/organizations)
// ----------------------------------------------------------------------------

export interface OrganizationResponse {
  id: string;
  name: string;
  slug?: string;
  country: string;
  timezone: string;
  currency: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  plan: OrganizationPlan;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
  country: string;
  timezone: string;
  currency: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  timezone?: string;
  currency?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
}

// ----------------------------------------------------------------------------
// 4. Profils Utilisateurs & Équipe (/api/v1/users)
// ----------------------------------------------------------------------------

export interface UserProfileResponse {
  id: string;
  organizationId: string;
  keycloakSubject?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
}

// ----------------------------------------------------------------------------
// 5. Prospects & Leads (/api/v1/prospects)
// ----------------------------------------------------------------------------

export interface ProspectResponse {
  id: string;
  organizationId?: string;
  companyId?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  jobTitle: string;
  companyName: string;
  companyWebsite?: string;
  email: string;
  emailStatus?: string;
  phone: string;
  phoneStatus?: string;
  whatsappNumber?: string;
  country: string;
  city: string;
  region?: string;
  industry: string;
  companySize?: string;
  linkedinUrl?: string;
  source?: string;
  status: ProspectStatus;
  leadScore: number;
  leadScoreLevel: LeadScoreLevel;
  leadScoreReasons?: string | string[];
  externalId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProspectRequest {
  companyId?: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  companyName: string;
  companyWebsite?: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  country?: string;
  city: string;
  region?: string;
  industry?: string;
  companySize?: string;
  linkedinUrl?: string;
  source?: string;
}

export interface UpdateProspectRequest {
  jobTitle?: string;
  phone?: string;
  whatsappNumber?: string;
  status?: ProspectStatus;
  city?: string;
  industry?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ProspectScoreResponse {
  score: number;
  level: LeadScoreLevel;
  reasons: string[];
}

export interface ProspectImportResponse {
  total: number;
  created: number;
  duplicates: number;
  invalid: number;
  errors: string[];
}

// ----------------------------------------------------------------------------
// 6. Entreprises Cibles (/api/v1/companies)
// ----------------------------------------------------------------------------

export interface CompanyResponse {
  id: string;
  organizationId?: string;
  name: string;
  website?: string;
  industry: string;
  description?: string;
  country: string;
  city: string;
  phone?: string;
  email?: string;
  employeeCount?: number;
  linkedinUrl?: string;
  source?: string;
  externalId?: string;
  domain?: string;
  aiSummary?: string | null;
  aiPainPoints?: string[] | null;
  aiAnalyzedAt?: string | null;
  contactCount?: number;
  score?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCompanyRequest {
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  country?: string;
  city?: string;
  phone?: string;
  email?: string;
  employeeCount?: number;
  linkedinUrl?: string;
  source?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  website?: string;
  industry?: string;
  employeeCount?: number;
  description?: string;
  phone?: string;
  email?: string;
}

// ----------------------------------------------------------------------------
// 7. Profil Client Idéal / ICP (/api/v1/icp)
// ----------------------------------------------------------------------------

export interface IcpResponse {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  targetIndustries: string;
  targetCities: string;
  targetCountries: string;
  minEmployees: number;
  maxEmployees: number;
  targetJobTitles: string;
  keywords: string;
  excludedIndustries?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIcpRequest {
  name: string;
  description?: string;
  targetIndustries: string;
  targetCities: string;
  targetCountries: string;
  minEmployees: number;
  maxEmployees: number;
  targetJobTitles: string;
  keywords: string;
  excludedIndustries?: string;
}

export interface UpdateIcpRequest {
  name?: string;
  description?: string;
  targetIndustries?: string;
  targetCities?: string;
  targetCountries?: string;
  minEmployees?: number;
  maxEmployees?: number;
  targetJobTitles?: string;
  keywords?: string;
  excludedIndustries?: string;
}

// ----------------------------------------------------------------------------
// 8. Campagnes & Séquences (/api/v1/campaigns)
// ----------------------------------------------------------------------------

export interface CampaignStepDto {
  id?: string;
  position: number;
  channel: ChannelType;
  delayMinutes: number;
  subjectTemplate?: string | null;
  contentTemplate: string;
  enabled?: boolean;
}

export interface CampaignResponse {
  id: string;
  organizationId?: string;
  name: string;
  description?: string;
  status: CampaignStatusBackend;
  channelStrategy?: 'WHATSAPP_FIRST' | 'EMAIL_FIRST' | 'BALANCED';
  startedAt?: string | null;
  completedAt?: string | null;
  steps: CampaignStepDto[];
  totalProspects?: number;
  sentCount?: number;
  replyCount?: number;
  meetingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  channelStrategy?: 'WHATSAPP_FIRST' | 'EMAIL_FIRST' | 'BALANCED';
}

export interface AttachProspectsRequest {
  prospectIds: string[];
}

export interface AttachProspectsResponse {
  addedCount: number;
  campaignId: string;
}

// ----------------------------------------------------------------------------
// 9. Boîte de Réception & Conversations (/api/v1/conversations)
// ----------------------------------------------------------------------------

export interface ConversationItemResponse {
  id: string;
  prospectId: string;
  prospectName: string;
  companyName: string;
  channel: ChannelType;
  lastMessage: string;
  lastMessageAt: string;
  status: ConversationStatus;
  assignedTo?: string;
  unread?: boolean;
}

export interface ConversationMessageDto {
  id: string;
  direction: MessageDirection;
  channel: ChannelType;
  sender: string;
  recipient: string;
  content: string;
  sentAt: string;
}

export interface ConversationDetailResponse {
  id: string;
  prospectId: string;
  prospectName: string;
  companyName: string;
  channel: ChannelType;
  status: ConversationStatus;
  assignedTo?: string;
  messages: ConversationMessageDto[];
}

export interface SendMessageRequest {
  content: string;
}

export interface AiReplySuggestionResponse {
  suggestedReply: string;
  intent: string;
  sentiment: string;
  recommendedNextAction: string;
  confidence: number;
}

// ----------------------------------------------------------------------------
// 10. Pipeline Commercial & Opportunités (/api/v1/pipeline)
// ----------------------------------------------------------------------------

export interface OpportunityResponse {
  id: string;
  prospectId: string;
  prospectName: string;
  companyId?: string;
  companyName: string;
  assignedTo?: string;
  title: string;
  stage: OpportunityStageBackend;
  estimatedValue: number;
  currency: string;
  winProbability: number;
  expectedCloseDate: string;
  closedAt?: string | null;
  lossReason?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityRequest {
  prospectId: string;
  companyId?: string;
  companyName?: string;
  assignedTo?: string;
  title: string;
  stage: OpportunityStageBackend;
  estimatedValue: number;
  currency: string;
  winProbability?: number;
  expectedCloseDate?: string;
  notes?: string;
}

export interface UpdateOpportunityStageRequest {
  stage: OpportunityStageBackend;
  lossReason?: string | null;
}

export interface UpdateOpportunityRequest {
  title?: string;
  assignedTo?: string;
  estimatedValue?: number;
  currency?: string;
  winProbability?: number;
  expectedCloseDate?: string;
  notes?: string;
}

export interface PipelineStageSummary {
  stage: OpportunityStageBackend;
  count: number;
  totalValue: number;
}

export interface PipelineOverviewResponse {
  totalOpportunities: number;
  totalPipelineValue: number;
  currency: string;
  stages: PipelineStageSummary[];
}

// ----------------------------------------------------------------------------
// 11. Intelligence Artificielle & Copilot B2B (/api/v1/ai)
// ----------------------------------------------------------------------------

export interface CompanyAiAnalysisResponse {
  summary: string;
  industry: string;
  painPoints: string[];
  opportunities: string[];
  recommendedApproach: string;
  confidence: number;
}

export interface ProspectAiSummaryResponse {
  summary: string;
  keyStrengths: string[];
  suggestedAngle: string;
}

export interface AiMessageGenerateRequest {
  channel: ChannelType;
  prospectId: string;
  offerDescription: string;
  goal: string;
}

export interface AiMessageGenerateResponse {
  channel: ChannelType;
  subject?: string | null;
  body: string;
  callToAction: string;
}

export interface AiUsageResponse {
  monthlyOperations: number;
  monthlyTokens: number;
  quotaLimit: number;
  plan: OrganizationPlan;
}

// ----------------------------------------------------------------------------
// 12. Analytics (/api/v1/analytics)
// ----------------------------------------------------------------------------

export interface ChannelAnalyticsBreakdown {
  channel: ChannelType;
  totalSent: number;
  delivered: number;
  failed: number;
}

export interface AnalyticsOverviewResponse {
  totalProspects: number;
  qualifiedProspects: number;
  contactedProspects: number;
  repliedProspects: number;
  meetingBookedProspects: number;
  opportunitiesCount: number;
  opportunitiesWon: number;
  totalWonValue: number;
  totalPipelineValue: number;
  currency: string;
  replyRate: number;
  conversionRate: number;
  activeCampaigns: number;
  channelBreakdown: ChannelAnalyticsBreakdown[];
}

export interface CampaignAnalyticsResponse {
  campaignId: string;
  campaignName: string;
  status: CampaignStatusBackend;
  targetProspectsCount: number;
  pendingCount: number;
  activeCount: number;
  completedCount: number;
  repliedCount: number;
  optedOutCount: number;
  failedCount: number;
  replyRate: number;
}

// ----------------------------------------------------------------------------
// 14. Facturation, Abonnements & Stripe (/api/v1/billing)
// ----------------------------------------------------------------------------

export interface BillingPlanFeature {
  text: string;
}

export interface BillingPlanResponse {
  id: OrganizationPlan;
  name: string;
  description: string;
  price: number;
  currency: string; // 'XOF'
  billingPeriod: 'MONTHLY' | 'ANNUAL';
  aiQuota: number;
  features: string[];
  isCurrent: boolean;
}

export interface SubscriptionResponse {
  organizationId: string;
  organizationName: string;
  plan: OrganizationPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  monthlyAiQuota: number;
}

export interface CheckoutSessionRequest {
  plan: OrganizationPlan;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface CustomerPortalRequest {
  returnUrl: string;
}

export interface CustomerPortalResponse {
  portalUrl: string;
}

// ----------------------------------------------------------------------------
// 15. Découverte de Prospects & Entreprises — Apollo (/api/v1/discovery)
// ----------------------------------------------------------------------------

export interface PeopleSearchRequest {
  firstName?: string;
  lastName?: string;
  jobTitles?: string[];
  companyName?: string;
  companyDomain?: string;
  country?: string;
  city?: string;
  industry?: string;
  companySizeMin?: number;
  companySizeMax?: number;
  page?: number;
  size?: number;
}

export interface DiscoveredPerson {
  externalId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  companyName: string;
  companyDomain?: string | null;
  linkedinUrl?: string | null;
  country?: string | null;
  city?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  source?: string;
  alreadyImported?: boolean;
  existingProspectId?: string | null;
}

export interface DiscoveredPeopleResponse {
  items: DiscoveredPerson[];
  page: number;
  size: number;
  total: number;
  source: string;
}

export interface CompanySearchRequest {
  name?: string;
  domain?: string;
  industry?: string;
  country?: string;
  city?: string;
  companySizeMin?: number;
  companySizeMax?: number;
  page?: number;
  size?: number;
}

export interface DiscoveredCompany {
  externalId: string;
  name: string;
  domain?: string | null;
  industry?: string | null;
  country?: string | null;
  city?: string | null;
  employeeCount?: number | null;
  linkedinUrl?: string | null;
  source?: string;
}

export interface DiscoveredCompaniesResponse {
  items: DiscoveredCompany[];
  page: number;
  size: number;
  total: number;
  source: string;
}

export interface ImportPeopleRequest {
  externalIds?: string[];
  prospects?: DiscoveredPerson[];
  listId?: string;
  listName?: string;
}

export interface ImportPeopleReport {
  importedCount: number;
  duplicateCount: number;
  totalProcessed: number;
  listId?: string | null;
  listName?: string | null;
  prospectIds: string[];
}

// ----------------------------------------------------------------------------
// 16. Listes de Prospects — Lead Lists (/api/v1/lead-lists)
// ----------------------------------------------------------------------------

export interface CreateLeadListRequest {
  name: string;
  description?: string;
}

export interface LeadListResponse {
  id: string;
  name: string;
  description?: string;
  prospectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListProspectDto {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  status: ProspectStatus;
  score: number;
  scoreLevel: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// 17. Enrichissement de Coordonnées (/api/v1/prospects/{id}/enrichment)
// ----------------------------------------------------------------------------

export interface ProspectEnrichmentMetadata {
  enrichedBy: string;
  enrichedAt: string;
  [key: string]: unknown;
}

