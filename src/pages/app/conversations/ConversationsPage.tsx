import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  Bot,
  Mail,
  Phone,
  MessageSquare,
  Search,
  ArrowLeft,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/ui/LoadingState';
import { conversationsApi, aiApi } from '../../../api';
import { useToast } from '../../../app/providers/ToastProvider';
import type { Channel } from '../../../types';

export const ConversationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeChannel, setActiveChannel] = useState<Channel | 'all'>('all');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingAIReply, setIsGeneratingAIReply] = useState(false);

  // Load conversations list
  const { data: conversations, isLoading: isConvsLoading } = useQuery({
    queryKey: ['conversations', activeChannel],
    queryFn: () => conversationsApi.getConversations(activeChannel),
  });

  // Set default selected conversation once loaded
  React.useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConvId) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  // Load messages for selected conversation
  const { data: messages, isLoading: isMsgsLoading } = useQuery({
    queryKey: ['messages', selectedConvId],
    queryFn: () => conversationsApi.getMessages(selectedConvId || ''),
    enabled: !!selectedConvId,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({
      conversationId,
      content,
      channel,
    }: {
      conversationId: string;
      content: string;
      channel: Channel;
    }) => conversationsApi.sendMessage(conversationId, content, channel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConvId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageInput('');
      showToast('Message envoyé.');
    },
  });

  const selectedConv = conversations?.find((c) => c.id === selectedConvId);

  // Filter conversations by search
  const filteredConvs = (conversations || []).filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.prospectName.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  // 42. Channel Badges: simple, discreet indicators
  const renderChannelBadge = (channel: Channel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
            <Phone className="w-2.5 h-2.5" /> WhatsApp
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
            <Mail className="w-2.5 h-2.5" /> Email
          </span>
        );
      case 'sms':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
            <MessageSquare className="w-2.5 h-2.5" /> SMS
          </span>
        );
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConv) return;
    sendMutation.mutate({
      conversationId: selectedConv.id,
      content: messageInput.trim(),
      channel: selectedConv.channel,
    });
  };

  // 43. AI Reply Assistant: Generate new response
  const handleRegenerateAIReply = async () => {
    if (!selectedConv) return;
    setIsGeneratingAIReply(true);
    try {
      const reply = await aiApi.generateConversationReply({
        lastMessage: selectedConv.lastMessage,
        prospectName: selectedConv.prospectName,
        companyName: selectedConv.companyName,
      });
      setMessageInput(reply);
      showToast('Réponse IA insérée dans l\'éditeur pour révision.');
    } catch {
      showToast('Impossible de générer une suggestion.', 'error');
    } finally {
      setIsGeneratingAIReply(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Boîte de réception unifiée pour tous vos échanges prospects (WhatsApp & Email).
        </p>
      </div>

      {/* 41. Main Layout: Two Columns (List + Thread) */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px] max-h-[780px]">
        {/* Left Column (md:col-span-4 lg:col-span-4): Inbox list */}
        <div
          className={`border-r border-gray-200 flex flex-col h-full ${
            selectedConvId ? 'hidden md:flex md:col-span-5 lg:col-span-4' : 'col-span-12'
          }`}
        >
          {/* Channel filter tabs & search */}
          <div className="p-3 border-b border-gray-200 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer les conversations..."
                className="w-full h-8 pl-8 pr-2.5 text-xs bg-gray-50 border border-gray-300 rounded focus:bg-white focus:outline-none focus:border-blue-600 text-gray-900"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setActiveChannel('all')}
                className={`px-2 py-1 rounded transition-colors ${
                  activeChannel === 'all'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setActiveChannel('whatsapp')}
                className={`px-2 py-1 rounded transition-colors ${
                  activeChannel === 'whatsapp'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setActiveChannel('email')}
                className={`px-2 py-1 rounded transition-colors ${
                  activeChannel === 'email'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Email
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {isConvsLoading ? (
              <LoadingState message="Chargement des conversations..." type="skeleton" rows={4} />
            ) : filteredConvs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">
                Aucune conversation trouvée.
              </p>
            ) : (
              filteredConvs.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-3 cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-2 border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-semibold text-gray-900 truncate">
                        {conv.prospectName}
                      </span>
                      {renderChannelBadge(conv.channel)}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mb-1">
                      {conv.companyName}
                    </p>
                    <p className="text-gray-600 line-clamp-1 leading-relaxed">
                      {conv.lastMessage}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (md:col-span-7 lg:col-span-8): Active Thread & AI Assistant */}
        <div
          className={`flex flex-col h-full bg-white ${
            selectedConvId ? 'col-span-12 md:col-span-7 lg:col-span-8' : 'hidden md:flex md:col-span-7 lg:col-span-8'
          }`}
        >
          {selectedConv ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="md:hidden text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Retour à la liste"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-gray-900">
                      {selectedConv.prospectName}
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      {selectedConv.companyName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {renderChannelBadge(selectedConv.channel)}
                </div>
              </div>

              {/* Messages History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/40">
                {isMsgsLoading ? (
                  <LoadingState message="Chargement des messages..." />
                ) : !messages || messages.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-10">
                    Aucun message dans cette conversation.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-3 rounded-lg text-xs leading-relaxed border ${
                            isUser
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-800 border-gray-200'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isUser && <CheckCheck className="w-3 h-3 text-blue-600" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* 43. AI Reply Assistant: Suggested Reply Box */}
              {selectedConv.suggestedReply && (
                <div className="border-t border-b border-blue-200 bg-blue-50/50 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                      <span>Réponse suggérée</span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      Modifiable avant envoi
                    </span>
                  </div>

                  <p className="text-gray-700 italic bg-white p-2 rounded border border-blue-100">
                    "{selectedConv.suggestedReply}"
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRegenerateAIReply}
                      isLoading={isGeneratingAIReply}
                      leftIcon={<RotateCcw className="w-3 h-3" />}
                    >
                      Autre suggestion
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMessageInput(selectedConv.suggestedReply || '');
                        showToast('Réponse insérée dans le champ de saisie.');
                      }}
                    >
                      Utiliser la réponse
                    </Button>
                  </div>
                </div>
              )}

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Écrire un message via ${selectedConv.channel.toUpperCase()}...`}
                    className="flex-1 bg-gray-50 text-gray-900 text-xs rounded-md border border-gray-300 p-2.5 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 leading-relaxed"
                  />
                  <Button
                    type="submit"
                    size="md"
                    disabled={!messageInput.trim() || sendMutation.isPending}
                    isLoading={sendMutation.isPending}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Envoyer
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-gray-400">
              Sélectionnez une conversation pour afficher les messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
