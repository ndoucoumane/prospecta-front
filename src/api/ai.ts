import { apiGet, apiPost } from './client';
import type { Channel } from '../types';
import type {
  CompanyAiAnalysisResponse,
  ProspectAiSummaryResponse,
  AiMessageGenerateRequest,
  AiMessageGenerateResponse,
  AiUsageResponse,
  AiReplySuggestionResponse,
} from '../types/api';

export const aiApi = {
  // ==========================================================================
  // Direct Backend REST Endpoints
  // ==========================================================================

  /**
   * POST /api/v1/companies/{id}/ai/analyze
   * Analyser l'intelligence web d'une entreprise cible
   */
  async analyzeCompany(companyId: string): Promise<CompanyAiAnalysisResponse> {
    return apiPost<CompanyAiAnalysisResponse>(`/api/v1/companies/${companyId}/ai/analyze`);
  },

  /**
   * POST /api/v1/prospects/{id}/ai/summarize
   * Synthétiser un prospect & angle d'accroche personnalisé
   */
  async summarizeProspect(prospectId: string): Promise<ProspectAiSummaryResponse> {
    return apiPost<ProspectAiSummaryResponse>(`/api/v1/prospects/${prospectId}/ai/summarize`);
  },

  /**
   * POST /api/v1/ai/messages/generate
   * Générer un message commercial multicanal ciblé pour un prospect
   */
  async generateProspectMessage(
    payload: AiMessageGenerateRequest
  ): Promise<AiMessageGenerateResponse> {
    return apiPost<AiMessageGenerateResponse>('/api/v1/ai/messages/generate', payload);
  },

  /**
   * GET /api/v1/ai/usage
   * Suivi des quotas IA & consommation de tokens
   */
  async getAiUsage(): Promise<AiUsageResponse> {
    return apiGet<AiUsageResponse>('/api/v1/ai/usage');
  },

  /**
   * POST /api/v1/conversations/{id}/ai/reply
   * Suggérer une réponse intelligente dans l'Inbox unifiée
   */
  async getConversationSuggestion(
    conversationId: string
  ): Promise<AiReplySuggestionResponse> {
    return apiPost<AiReplySuggestionResponse>(
      `/api/v1/conversations/${conversationId}/ai/reply`
    );
  },

  // ==========================================================================
  // High-Level UI Adapted Methods
  // ==========================================================================

  /**
   * Générateur de modèle d'étape de campagne (utilisé par CampaignBuilderPage)
   */
  async generateCampaignMessage(params: {
    channel: Channel;
    objective: string;
    icp: string;
    stepNumber: number;
  }): Promise<{ subject?: string; content: string }> {
    await new Promise((r) => setTimeout(r, 400));

    if (params.channel === 'whatsapp') {
      return {
        content: `Bonjour {{firstName}},\n\nJe me permets de vous contacter car j'ai vu votre rôle clé chez {{companyName}} à {{city}}.\n\nNous aidons les entreprises de votre secteur à automatiser la prospection B2B et la qualification des prospects qualifiés.\n\nSeriez-vous ouvert à échanger 10 minutes cette semaine ?\n\nBien cordialement,\nProspecta Sénégal`,
      };
    }

    if (params.stepNumber === 1) {
      return {
        subject: `Accélération commerciale chez {{companyName}}`,
        content: `Bonjour {{firstName}},\n\nJ'ai suivi avec beaucoup d'intérêt le développement récent de {{companyName}} à {{city}}.\n\nDans le contexte économique actuel, beaucoup de directions commerciales consacrent jusqu'à 60% de leur temps à qualifier manuellement des bases de contacts, au détriment de la conclusion des affaires.\n\nProspecta vous permet de cibler directement les décideurs clés au Sénégal (Email professionnel & WhatsApp certifié) et d'automatiser vos prises de contact avec un contrôle humain systématique.\n\nAuriez-vous 15 minutes ce jeudi ou vendredi pour un rapide échange de découverte ?\n\nBien à vous,\nL'équipe commerciale Prospecta`,
      };
    }

    return {
      subject: `Relance suite à mon précédent message — {{firstName}}`,
      content: `Bonjour {{firstName}},\n\nJe fais suite à mon précédent mot concernant la prospection commerciale chez {{companyName}}.\n\nSi le sujet n'est pas prioritaire pour vous actuellement, n'hésitez pas à me le faire savoir. Dans le cas contraire, seriez-vous disponible la semaine prochaine pour un rapide point de 10 minutes ?\n\nBien cordialement,`,
    };
  },

  /**
   * Générateur de réponse rapide pour l'Inbox unifiée (utilisé par ConversationsPage)
   */
  async generateConversationReply(params: {
    lastMessage: string;
    prospectName: string;
    companyName: string;
    conversationId?: string;
  }): Promise<string> {
    if (params.conversationId) {
      try {
        const suggestion = await this.getConversationSuggestion(params.conversationId);
        if (suggestion?.suggestedReply) {
          return suggestion.suggestedReply;
        }
      } catch {
        // Fallback below
      }
    }

    await new Promise((r) => setTimeout(r, 400));

    const lower = params.lastMessage.toLowerCase();
    if (lower.includes('tarif') || lower.includes('prix') || lower.includes('coût') || lower.includes('combien')) {
      return `Bonjour ${params.prospectName}, merci pour votre retour ! Nos offres démarrent à partir de 29 000 FCFA/mois (Plan Starter) et s'adaptent selon le volume de prospection de ${params.companyName}. Seriez-vous ouvert à un rapide échange de 10 min pour vous présenter la formule la plus adaptée ?`;
    }

    if (
      lower.includes('rendez-vous') ||
      lower.includes('disponible') ||
      lower.includes('démonstration') ||
      lower.includes('demo') ||
      lower.includes('jeudi') ||
      lower.includes('vendredi')
    ) {
      return `Bonjour ${params.prospectName}, avec grand plaisir ! Je vous propose un créneau ce jeudi à 11h00 (heure de Dakar) ou vendredi à 15h00 pour une démonstration ciblée. Quel moment vous conviendrait le mieux ?`;
    }

    return `Bonjour ${params.prospectName}, merci pour votre retour. Nous serions ravis d'approfondir ce point ensemble. Quelle serait la meilleure façon de caler un court échange cette semaine ?`;
  },
};
