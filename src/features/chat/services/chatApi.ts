// src/features/chat/services/chatApi.ts
// (COLE ISTO NO SEU ARQUIVO)

import { api } from '@/services/api';

// (Interfaces: Sem alterações)
export interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}
export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: {
    id: string;
    userId: string;
    conversationId: string;
    hasUnread: boolean;
    isHidden: boolean;
    user: {
      id: string;
      name: string;
      profile: {
        imageUrl: string | null;
      } | null;
    };
  }[];
  messages: Message[];
}

// --- INÍCIO DA ALTERAÇÃO (Sistema Híbrido) ---

// 1. Definir o tipo de payload que o hook vai enviar
interface CreateConversationPayload {
  targetUserId: string;
  content: string;
  contextPhotoId?: string; // <-- Opcional
  contextPostId?: string;  // <-- Opcional
}

export const createOrGetConversation = async (
  // 2. A função agora aceita um único objeto 'payload'
  payload: CreateConversationPayload,
): Promise<Conversation> => {
  // 3. O payload é enviado diretamente para o backend.
  // O backend vai precisar de 'contextPhotoId'/'contextPostId'
  // para criar o comentário público (o nosso sistema híbrido).
  const { data } = await api.post<Conversation>('/chat/conversations', payload);
  return data;
};
// --- FIM DA ALTERAÇÃO ---

export const getConversations = async (): Promise<Conversation[]> => {
  const { data } = await api.get<Conversation[]>('/chat/conversations');
  return data;
};

export const getUnreadMessageCount = async (): Promise<{ count: number }> => {
  const { data } = await api.get<{ count: number }>(
    '/chat/conversations/unread-count',
  );
  return data;
};

export const getConversationById = async (
  conversationId: string,
): Promise<Conversation> => {
  const { data } = await api.get<Conversation>(
    `/chat/conversations/${conversationId}`,
  );
  return data;
};

export const sendMessage = async (
  conversationId: string,
  content: string,
): Promise<Message> => {
  const { data } = await api.post<Message>(
    `/chat/conversations/${conversationId}/messages`,
    { content },
  );
  return data;
};

// (Fase 1: "Esconder Conversa" - Sem alterações)
export const hideConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.delete(`/chat/conversations/${conversationId}`);
};

// (Fase 1: "Unsend" - Sem alterações)
export const deleteMessage = async (messageId: string): Promise<void> => {
  await api.delete(`/chat/messages/${messageId}`);
};

// (Fase 2: "Apagar para Mim" - Sem alterações)
export const hideMessageForMe = async (messageId: string): Promise<void> => {
  await api.delete(`/chat/messages/${messageId}/hide`);
};