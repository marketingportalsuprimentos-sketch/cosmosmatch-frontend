// src/features/chat/hooks/useChatQueries.ts
// (COLE ISTO NO SEU ARQUIVO)

import { useQuery } from '@tanstack/react-query'; 
import * as chatApi from '../services/chatApi';
import type { Conversation } from '../services/chatApi';

/**
 * Hook para buscar a lista de conversas do utilizador logado.
 */
export const useGetConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
    // --- INÍCIO DA CORREÇÃO (Bug da Lista de Chat) ---
    // REMOVIDO: staleTime: 1000 * 60 * 5,
    // O 'staleTime' estava a impedir o 'invalidateQueries'
    // (dos hooks de mutação) de funcionar imediatamente.
    // Queremos que a lista de chats recarregue assim que
    // uma nova conversa é iniciada.
    // --- FIM DA CORREÇÃO ---
  });
};

/**
 * Hook para buscar a CONTAGEM de conversas não lidas.
 */
export const useGetUnreadMessageCount = () => {
  return useQuery<{ count: number }, Error>({
    queryKey: ['unreadMessageCount'],
    queryFn: chatApi.getUnreadMessageCount,
    refetchInterval: 30000,
  });
};

/**
 * Hook para buscar UMA conversa específica (o histórico de mensagens).
 * @param conversationId O ID da conversa a ser buscada.
 */
export const useGetConversationById = (conversationId: string) => {
  return useQuery<Conversation, Error>({
    queryKey: ['conversation', conversationId],
    queryFn: () => chatApi.getConversationById(conversationId),
    enabled: !!conversationId,
    
    // Deixamos o staleTime aqui, pois só queremos recarregar
    // a conversa ativa se ela for invalidada.
    staleTime: 1000 * 60 * 5, 
  });
};