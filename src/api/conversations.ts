import type { Conversation, Message, Channel } from '../types';
import { initialConversations, initialMessages } from './mockData';

const CONV_KEY = 'prospecta_conversations';
const MSG_KEY = 'prospecta_messages';

function loadConversations(): Conversation[] {
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

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(CONV_KEY, JSON.stringify(convs));
}

function loadMessages(): Record<string, Message[]> {
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

function saveMessages(messages: Record<string, Message[]>) {
  localStorage.setItem(MSG_KEY, JSON.stringify(messages));
}

export const conversationsApi = {
  async getConversations(channel?: Channel | 'all'): Promise<Conversation[]> {
    await new Promise((r) => setTimeout(r, 150));
    let list = loadConversations();
    if (channel && channel !== 'all') {
      list = list.filter((c) => c.channel === channel);
    }
    return list;
  },

  async getConversationById(id: string): Promise<Conversation | null> {
    await new Promise((r) => setTimeout(r, 100));
    const list = loadConversations();
    return list.find((c) => c.id === id) || null;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    await new Promise((r) => setTimeout(r, 150));
    const map = loadMessages();
    return map[conversationId] || [];
  },

  async sendMessage(conversationId: string, content: string, channel: Channel): Promise<Message> {
    await new Promise((r) => setTimeout(r, 250));
    const convs = loadConversations();
    const map = loadMessages();

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      sender: 'user',
      content,
      channel,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    if (!map[conversationId]) {
      map[conversationId] = [];
    }
    map[conversationId].push(newMessage);
    saveMessages(map);

    const convIndex = convs.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      convs[convIndex].lastMessage = content;
      convs[convIndex].lastMessageAt = newMessage.timestamp;
      convs[convIndex].unread = false;
      // remove used suggested reply
      delete convs[convIndex].suggestedReply;
      saveConversations(convs);
    }

    return newMessage;
  },

  async markAsRead(conversationId: string): Promise<void> {
    const convs = loadConversations();
    const conv = convs.find((c) => c.id === conversationId);
    if (conv) {
      conv.unread = false;
      saveConversations(convs);
    }
  },
};
