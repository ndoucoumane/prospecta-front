import { apiGet, apiPost, executeWithPermission } from './client';
import type { Conversation, Message, Channel } from '../types';
import type {
  ConversationItemResponse,
  ConversationDetailResponse,
  ConversationMessageDto,
  SendMessageRequest,
  AiReplySuggestionResponse,
  PageResponse,
  ChannelType,
} from '../types/api';
import { initialConversations, initialMessages } from './mockData';

const CONV_KEY = 'prospecta_conversations';
const MSG_KEY = 'prospecta_messages';

function loadLocalConversations(): Conversation[] {
  const stored = localStorage.getItem(CONV_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...initialConversations];
    }
  }
  localStorage.setItem(CONV_KEY, JSON.stringify(initialConversations));
  return [...initialConversations];
}

function saveLocalConversations(convs: Conversation[]) {
  localStorage.setItem(CONV_KEY, JSON.stringify(convs));
}

function loadLocalMessages(): Record<string, Message[]> {
  const stored = localStorage.getItem(MSG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { ...initialMessages };
    }
  }
  localStorage.setItem(MSG_KEY, JSON.stringify(initialMessages));
  return { ...initialMessages };
}

function saveLocalMessages(messages: Record<string, Message[]>) {
  localStorage.setItem(MSG_KEY, JSON.stringify(messages));
}

export function mapBackendToConversation(dto: ConversationItemResponse): Conversation {
  return {
    id: dto.id,
    prospectId: dto.prospectId,
    prospectName: dto.prospectName,
    companyName: dto.companyName,
    channel: (dto.channel?.toLowerCase() as Channel) || 'whatsapp',
    lastMessage: dto.lastMessage,
    lastMessageAt: dto.lastMessageAt,
    unread: dto.unread ?? false,
  };
}

export function mapBackendToMessage(
  dto: ConversationMessageDto,
  conversationId: string
): Message {
  return {
    id: dto.id,
    conversationId,
    sender: dto.direction === 'INBOUND' ? 'prospect' : 'user',
    content: dto.content,
    channel: (dto.channel?.toLowerCase() as Channel) || 'whatsapp',
    timestamp: dto.sentAt,
    status: 'delivered',
  };
}

export const conversationsApi = {
  // ==========================================================================
  // Direct Backend REST Endpoints (/api/v1/conversations)
  // ==========================================================================

  /**
   * GET /api/v1/conversations
   */
  async getAll(params?: {
    channel?: ChannelType;
    status?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<ConversationItemResponse>> {
    return apiGet<PageResponse<ConversationItemResponse>>('/api/v1/conversations', {
      channel: params?.channel,
      status: params?.status,
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sort: params?.sort ?? 'lastMessageAt,desc',
    });
  },

  /**
   * GET /api/v1/conversations/{id}
   */
  async getById(id: string): Promise<ConversationDetailResponse> {
    return apiGet<ConversationDetailResponse>(`/api/v1/conversations/${id}`);
  },

  /**
   * POST /api/v1/conversations/{id}/messages
   * Répondre au prospect sur le canal de la conversation
   */
  async postMessage(
    conversationId: string,
    payload: SendMessageRequest
  ): Promise<ConversationMessageDto> {
    return executeWithPermission('conversation:send', async () => {
      return apiPost<ConversationMessageDto>(
        `/api/v1/conversations/${conversationId}/messages`,
        payload
      );
    });
  },

  /**
   * POST /api/v1/conversations/{id}/ai/reply
   * Assistant IA Copilot : Suggérer une réponse intelligente
   */
  async getAiReplySuggestion(conversationId: string): Promise<AiReplySuggestionResponse> {
    return executeWithPermission('conversation:ai_reply', async () => {
      return apiPost<AiReplySuggestionResponse>(
        `/api/v1/conversations/${conversationId}/ai/reply`
      );
    });
  },

  // ==========================================================================
  // High-Level UI Adapted Methods
  // ==========================================================================

  async getConversations(channel?: Channel | 'all'): Promise<Conversation[]> {
    try {
      const channelParam =
        channel && channel !== 'all' ? (channel.toUpperCase() as ChannelType) : undefined;
      const res = await this.getAll({ channel: channelParam, size: 50 });
      if (res?.items && res.items.length > 0) {
        return res.items.map(mapBackendToConversation);
      }
    } catch {
      // Fallback
    }

    let list = loadLocalConversations();
    if (channel && channel !== 'all') {
      list = list.filter((c) => c.channel === channel);
    }
    return list;
  },

  async getConversationById(id: string): Promise<Conversation | null> {
    try {
      const detail = await this.getById(id);
      if (detail) {
        return {
          id: detail.id,
          prospectId: detail.prospectId,
          prospectName: detail.prospectName,
          companyName: detail.companyName,
          channel: (detail.channel.toLowerCase() as Channel) || 'whatsapp',
          lastMessage: detail.messages?.[detail.messages.length - 1]?.content || '',
          lastMessageAt: detail.messages?.[detail.messages.length - 1]?.sentAt || '',
          unread: false,
        };
      }
    } catch {
      // Fallback
    }
    const list = loadLocalConversations();
    return list.find((c) => c.id === id) || null;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const detail = await this.getById(conversationId);
      if (detail?.messages) {
        return detail.messages.map((m) => mapBackendToMessage(m, conversationId));
      }
    } catch {
      // Fallback
    }
    const map = loadLocalMessages();
    return map[conversationId] || [];
  },

  async sendMessage(
    conversationId: string,
    content: string,
    channel: Channel = 'whatsapp'
  ): Promise<Message> {
    try {
      const dto = await this.postMessage(conversationId, { content });
      return mapBackendToMessage(dto, conversationId);
    } catch {
      // Fallback
      const map = loadLocalMessages();
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        sender: 'user',
        content,
        channel,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      if (!map[conversationId]) map[conversationId] = [];
      map[conversationId].push(newMsg);
      saveLocalMessages(map);

      // Update conversation preview
      const convs = loadLocalConversations();
      const c = convs.find((item) => item.id === conversationId);
      if (c) {
        c.lastMessage = content;
        c.lastMessageAt = newMsg.timestamp;
        saveLocalConversations(convs);
      }
      return newMsg;
    }
  },
};
