// src/pages/ChatConversationPage.tsx
// (COLE ISTO NO SEU ARQUIVO)

import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetConversationById,
} from '@/features/chat/hooks/useChatQueries';
// 1. IMPORTAR O NOVO HOOK
import {
  useSendMessage,
  useDeleteMessage,
  useHideMessageForMe, // <-- Adicionado
} from '@/features/chat/hooks/useChatMutations';
import {
  FiArrowLeft,
  FiLoader,
  FiAlertCircle,
  FiSend,
  FiStar,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

// (Helper de URL - Sem alterações)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const backendOrigin = apiUrl.replace(/\/api\/?$/, '');
const defaultAvatar = '/default-avatar.png';

const toPublicUrl = (path?: string | null) => {
  if (!path) return defaultAvatar;
  if (/^https?:\/\//i.test(path)) return path;
  return `${backendOrigin}/${path}`;
};
// --- Fim do Helper ---

export function ChatConversationPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user: loggedInUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // (Estado do Modal - Sem alterações)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [deleteAction, setDeleteAction] = useState<'unsend' | 'hide' | null>(
    null,
  );

  // (Hooks de busca e envio - Sem alterações)
  const {
    data: conversation,
    isLoading,
    error,
    isSuccess,
  } = useGetConversationById(conversationId!);

  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: deleteMessage, isPending: isDeleting } = useDeleteMessage();
  const { mutate: hideMessage, isPending: isHiding } = useHideMessageForMe();

  // (Outros dados - Sem alterações)
  const otherParticipant = conversation?.participants.find(
    (p) => p.userId !== loggedInUser?.id,
  )?.user;

  // ESTA LÓGICA ESTÁ CORRETA (Sem alterações)
  const isPaywallActive =
    loggedInUser?.subscription?.status === 'FREE' &&
    (loggedInUser?.subscription?.freeContactsUsed ?? 0) >= 3;

  // (Effects - Sem alterações)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['unreadMessageCount'] });
    }
  }, [isSuccess, queryClient]);

  // (handleSubmit - Sem alterações)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || isSending) {
      return;
    }
    sendMessage(
      { conversationId, content: newMessage.trim() },
      {
        onSuccess: () => {
          setNewMessage('');
        },
      },
    );
  };

  // --- INÍCIO DA CORREÇÃO (Lógica do Blur) ---
  /**
   * Chamado ao clicar em QUALQUER mensagem
   * 1. Aceita um novo argumento 'isBlurred'
   */
  const handleMessageClick = (
    messageId: string,
    isMe: boolean,
    isBlurred: boolean, // <-- ADICIONADO
  ) => {
    // 2. Se a mensagem estiver em blur, redireciona para o premium
    if (isBlurred) {
      navigate('/premium');
      return;
    }

    // 3. Se não estiver em blur, faz a ação normal (apagar/esconder)
    setSelectedMessageId(messageId);
    setDeleteAction(isMe ? 'unsend' : 'hide');
    setIsModalOpen(true);
  };

  /**
   * Chamado ao fechar o modal
   */
  const onCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMessageId(null);
    setDeleteAction(null);
  };

  /**
   * Chamado ao confirmar a ação no modal
   */
  const onConfirmAction = () => {
    if (!selectedMessageId || !deleteAction) return;

    if (deleteAction === 'unsend') {
      deleteMessage(selectedMessageId, {
        onSuccess: () => {
          onCloseModal();
        },
      });
    }
    else if (deleteAction === 'hide') {
      hideMessage(
        { messageId: selectedMessageId, conversationId: conversationId! },
        {
          onSuccess: () => {
            onCloseModal();
          },
        },
      );
    }
  };
  // --- FIM DA CORREÇÃO ---

  // --- Renderização (Loading, Erro) (Sem alterações) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-white">
        <FiLoader className="animate-spin text-purple-400 text-4xl" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="p-4 text-center text-red-400">
        <FiAlertCircle className="mx-auto text-4xl mb-2" />
        <h2 className="text-lg font-semibold">Erro ao carregar a conversa</h2>
        <p className="mt-2">
          {error?.message || 'Não foi possível encontrar esta conversa.'}
        </p>
        <button
          onClick={() => navigate('/chat')}
          className="mt-4 px-4 py-2 bg-purple-600 rounded-md text-white"
        >
          Voltar para a Caixa de Entrada
        </button>
      </div>
    );
  }
  // --- Fim da Renderização (Loading, Erro) ---

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-gray-900 text-white">
      {/* 1. Cabeçalho do Chat (Sem alterações) */}
      <header className="flex items-center p-3 border-b border-gray-700 bg-gray-800 shadow-md sticky top-0 z-10">
        <button onClick={() => navigate('/chat')} className="mr-3 p-2">
          <FiArrowLeft className="text-2xl" />
        </button>
        {otherParticipant && (
          <Link
            to={`/profile/${otherParticipant.id}`}
            className="flex-1 flex items-center min-w-0"
          >
            <img
              src={toPublicUrl(otherParticipant.profile?.imageUrl)}
              alt={otherParticipant.name}
              className="w-10 h-10 rounded-full object-cover mr-3"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
            <span className="font-semibold text-lg truncate">
              {otherParticipant.name}
            </span>
          </Link>
        )}
      </header>

      {/* 2. Lista de Mensagens (COM ATUALIZAÇÃO) */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation?.messages.map((message) => {
          const isMe = message.senderId === loggedInUser?.id;
          // ESTA LÓGICA ESTÁ CORRETA (Sem alterações)
          const shouldBlurMessage = isPaywallActive && !isMe;

          return (
            <div
              key={message.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                // --- INÍCIO DA CORREÇÃO (Lógica do Blur) ---
                // 4. Passa o 'shouldBlurMessage' para o handler
                onClick={() =>
                  handleMessageClick(message.id, isMe, shouldBlurMessage)
                }
                // --- FIM DA CORREÇÃO ---
                className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-md cursor-pointer transition-colors ${
                  isMe
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                }`}
              >
                <p
                  className={`text-sm ${
                    // ESTA LÓGICA ESTÁ CORRETA (Sem alterações)
                    shouldBlurMessage ? 'blur-sm select-none' : ''
                  }`}
                >
                  {message.content}
                </p>
                <span className="text-xs opacity-70 block text-right mt-1">
                  {format(new Date(message.createdAt), 'HH:mm', {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* 3. Caixa de Envio (Sem alterações) */}
      <footer className="p-3 border-t border-gray-700 bg-gray-800 sticky bottom-0">
        {/* ESTA LÓGICA ESTÁ CORRETA (Sem alterações) */}
        {isPaywallActive ? (
          <div className="p-2 text-center">
            <button
              onClick={() => navigate('/premium')}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-full flex items-center justify-center space-x-2 hover:bg-purple-700 transition-colors"
            >
              <FiStar />
              <span>Assine o Premium para ler e responder</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-3 bg-gray-700 rounded-full border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSending}
            />
            <button
              type="submit"
              className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-700 disabled:bg-gray-600 transition-colors"
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? (
                <FiLoader className="animate-spin text-2xl" />
              ) : (
                <FiSend className="text-2xl" />
              )}
            </button>
          </form>
        )}
      </footer>

      {/* (Modal Dinâmico - Sem alterações) */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onConfirm={onConfirmAction}
        title={
          deleteAction === 'unsend' ? 'Apagar Mensagem' : 'Esconder Mensagem'
        }
        confirmText={
          deleteAction === 'unsend' ? 'Apagar para Todos' : 'Apagar para Mim'
        }
        isLoading={isDeleting || isHiding}
      >
        {deleteAction === 'unsend'
          ? 'Tem a certeza de que quer apagar esta mensagem para todos? Esta ação não pode ser desfeita.'
          : 'Tem a certeza de que quer esconder esta mensagem? Ela será removida apenas da sua vista.'}
      </ConfirmationModal>
    </div>
  );
}