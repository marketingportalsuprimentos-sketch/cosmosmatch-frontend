// src/features/chat/hooks/useChatMutations.ts
// (COLE ISTO NO SEU ARQUIVO)

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import * as chatApi from '../services/chatApi'; 
import { useAuth } from '@/contexts/AuthContext';


interface CreateConversationVars {
  targetUserId: string;
  content: string;
  contextPhotoId?: string;
  contextPostId?: string;
}

export const useCreateOrGetConversation = () => {
  const queryClient = useQueryClient();
  
  // --- INÍCIO DA CORREÇÃO (Bug do Blur) ---
  // 1. Chamar o 'useAuth' e obter a nossa NOVA função
  const { user, incrementFreeContactsUsed } = useAuth();
  // --- FIM DA CORREÇÃO ---

  return useMutation({
    mutationFn: (vars: CreateConversationVars) =>
      chatApi.createOrGetConversation(vars),
    
    onSuccess: (data: chatApi.Conversation, variables: CreateConversationVars) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // (Lógica Híbrida - Sem alterações)
      if (variables.contextPhotoId) {
        queryClient.invalidateQueries({ 
          queryKey: ['galleryComments', variables.contextPhotoId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['galleryPhotos', variables.targetUserId] 
        });
      }
      if (variables.contextPostId) {
        queryClient.invalidateQueries({ 
          queryKey: ['postComments', variables.contextPostId] 
        });
        queryClient.invalidateQueries({ queryKey: ['feed'] });
      }

      // --- INÍCIO DA CORREÇÃO (Bug do Blur) ---
      // 2. Verificar se devemos incrementar
      if (
        user && 
        user.subscription && 
        user.subscription.status === 'FREE' && 
        variables.targetUserId !== user.id
      ) {
        // 3. Chamar a nossa nova função segura!
        incrementFreeContactsUsed();
      }
      // --- FIM DA CORREÇÃO ---

      toast.success('Mensagem enviada!');
    },
    onError: (error: any) => {
      if (error?.response?.status === 402) return;
      console.error('Erro ao iniciar conversa:', error);
      toast.error('Não foi possível enviar a sua mensagem.');
    },
  });
};


// --- INÍCIO DA CORREÇÃO (Bug do Blur) ---

interface SendMessageVars {
  conversationId: string;
  content: string;
}
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  // 1. Chamar o 'useAuth' e obter a nossa NOVA função
  const { user, incrementFreeContactsUsed } = useAuth(); 

  return useMutation({
    mutationFn: ({ conversationId, content }: SendMessageVars) =>
      chatApi.sendMessage(conversationId, content),
    onSuccess: (
      newMessage: chatApi.Message,
      variables: SendMessageVars,
    ) => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      // 2. Adicionar a MESMA lógica de atualização
      if (
        user && 
        user.subscription && 
        user.subscription.status === 'FREE'
      ) {
        // 3. Chamar a nossa nova função segura!
        incrementFreeContactsUsed();
      }
    },
    onError: (error: any) => {
      if (error?.response?.status === 402) return;
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar a mensagem.');
    },
  });
};
// --- FIM DA CORREÇÃO ---


// (O resto do ficheiro - useHideConversation, useDeleteMessage, etc. - Sem alterações)
// ...
export const useHideConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.hideConversation,
    onMutate: async (conversationId: string) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      const previousConversations = queryClient.getQueryData<
        chatApi.Conversation[]
      >(['conversations']);
      if (previousConversations) {
        const newConversations = previousConversations.filter(
          (convo) => convo.id !== conversationId,
        );
        queryClient.setQueryData(['conversations'], newConversations);
      }
      return { previousConversations };
    },
    onError: (err, variables, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(
          ['conversations'],
          context.previousConversations,
        );
      }
      toast.error('Não foi possível esconder a conversa.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unreadMessageCount'] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Mensagem apagada');
    },
    onError: (error: any) => {
      if (error?.response?.status === 403) {
        toast.error('Você não pode apagar esta mensagem.');
      } else {
        toast.error('Erro ao apagar a mensagem.');
      }
    },
  });
};

interface HideMessageVars {
  messageId: string;
  conversationId: string; 
}
export const useHideMessageForMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId }: HideMessageVars) =>
      chatApi.hideMessageForMe(messageId),

    onMutate: async ({ messageId, conversationId }: HideMessageVars) => {
      const queryKey = ['conversation', conversationId];
      await queryClient.cancelQueries({ queryKey });
      const previousConversation =
        queryClient.getQueryData<chatApi.Conversation>(queryKey);

      if (previousConversation) {
        const newConversation = {
          ...previousConversation,
          messages: previousConversation.messages.filter(
            (msg) => msg.id !== messageId,
          ),
        };
        queryClient.setQueryData(queryKey, newConversation);
      }
      return { previousConversation };
    },
    onError: (err, variables, context) => {
      if (context?.previousConversation) {
        queryClient.setQueryData(
          ['conversation', variables.conversationId],
          context.previousConversation,
        );
      }
      toast.error('Não foi possível esconder a mensagem.');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};