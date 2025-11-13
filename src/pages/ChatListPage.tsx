// src/pages/ChatListPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetLikesReceived,
  useMarkLikesAsRead,
  useGetUnreadLikesCount,
} from '@/features/profile/hooks/useProfile';
import { useGetConversations } from '@/features/chat/hooks/useChatQueries';
import { useHideConversation } from '@/features/chat/hooks/useChatMutations';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiMessageCircle,
  FiHeart,
  FiLoader,
  FiLock,
  FiTrash,
  FiSearch, // 1. Importar o Ícone
} from 'react-icons/fi';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Tab = 'messages' | 'likes';

// (Helper toPublicUrl: Sem alterações)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const backendOrigin = apiUrl.replace(/\/api\/?$/, '');
const defaultAvatar = '/default-avatar.png';
const toPublicUrl = (path?: string | null) => {
  if (!path) return defaultAvatar;
  if (/^https?:\/\//i.test(path)) return path;
  return `${backendOrigin}/${path}`;
};

export function ChatListPage() {
  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const { user: loggedInUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const { mutate: hideConversation, isPending: isHiding } =
    useHideConversation();

  // (Hooks: Sem alterações)
  const {
    data: likesReceived,
    isLoading: isLoadingLikes,
    error: likesError,
  } = useGetLikesReceived();
  const { mutate: markAsRead } = useMarkLikesAsRead();
  const { data: unreadData } = useGetUnreadLikesCount();
  const unreadCount = unreadData?.count || 0;
  const {
    data: conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useGetConversations();

  // (Handlers: Sem alterações)
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'likes') {
      markAsRead();
    }
  };

  const handleHideClick = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedConvoId(conversationId);
    setIsModalOpen(true);
  };

  const onConfirmHide = () => {
    if (selectedConvoId) {
      hideConversation(selectedConvoId);
    }
    setIsModalOpen(false);
    setSelectedConvoId(null);
  };

  // (Função renderLikesList: Sem alterações)
  const renderLikesList = () => {
    if (isLoadingLikes) {
      return (
        <div className="flex justify-center items-center pt-10">
          <FiLoader className="animate-spin text-purple-400 text-4xl" />
        </div>
      );
    }
    if (likesError) {
      return (
        <div className="text-center text-red-400 pt-8">
          <h3 className="font-semibold">Erro ao carregar os likes.</h3>
          <p className="text-sm">{likesError.message}</p>
        </div>
      );
    }
    if (!likesReceived || likesReceived.length === 0) {
      return (
        <div className="text-center text-gray-500 pt-8">
          <FiHeart className="mx-auto text-4xl mb-2" />
          <h2 className="text-lg font-semibold">Sem likes ainda</h2>
          <p className="mt-2">
            Quando alguém curtir o seu perfil
            <br />
            essa pessoa aparecerá aqui.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {likesReceived.map((user) => (
          <Link
            to={`/profile/${user.id}`}
            key={user.id}
            className="flex items-center p-3 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
          >
            <img
              src={toPublicUrl(user.profile?.imageUrl)}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-purple-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
            <span className="font-semibold text-lg text-white">
              {user.name}
            </span>
          </Link>
        ))}
      </div>
    );
  };

  // (renderMessagesList: COM CORREÇÃO)
  const renderMessagesList = () => {
    if (isLoadingConversations) {
      return (
        <div className="flex justify-center items-center pt-10">
          <FiLoader className="animate-spin text-purple-400 text-4xl" />
        </div>
      );
    }

    if (conversationsError) {
      return (
        <div className="text-center text-red-400 pt-8">
          <h3 className="font-semibold">Erro ao carregar as conversas.</h3>
          <p className="text-sm">{conversationsError.message}</p>
        </div>
      );
    }

    if (!conversations || conversations.length === 0) {
      return (
        <div className="text-center text-gray-500 pt-8">
          <FiMessageCircle className="mx-auto text-4xl mb-2" />
          <h2 className="text-lg font-semibold">Sem conversas</h2>
          <p className="mt-2">
            Quando você enviar ou receber uma mensagem,
            <br />
            ela aparecerá aqui.
          </p>
        </div>
      );
    }

    const isPaywallActive =
      loggedInUser?.subscription?.status === 'FREE' &&
      (loggedInUser?.subscription?.freeContactsUsed ?? 0) >= 3;

    return (
      <div className="space-y-3">
        {conversations?.map((convo) => {
          const otherParticipant = convo.participants.find(
            (p) => p.userId !== loggedInUser?.id,
          );
          if (!otherParticipant) return null;
          const lastMessage = convo.messages[0];
          let timeAgo = '';
          if (lastMessage) {
            try {
              timeAgo = formatDistanceToNowStrict(
                new Date(lastMessage.createdAt),
                { addSuffix: true, locale: ptBR },
              );
            } catch (e) {
              console.error('Data inválida', lastMessage.createdAt);
            }
          }
          const myParticipantData = convo.participants.find(
            (p) => p.userId === loggedInUser?.id,
          );
          const hasUnread = myParticipantData?.hasUnread ?? false;
          const isLastMessageFromOther =
            lastMessage?.senderId !== loggedInUser?.id;

          // --- INÍCIO DA CORREÇÃO (Bug do Blur) ---
          // Removemos a verificação 'hasUnread'. O blur deve aparecer
          // se o paywall estiver ativo e a mensagem for recebida,
          // independentemente de ter sido lida ou não.
          const showAsBlocked =
            isPaywallActive && isLastMessageFromOther;
          // --- FIM DA CORREÇÃO ---

          const messageContent = lastMessage ? lastMessage.content : '...';
          let textStyle = 'text-gray-400';
          if (hasUnread && !showAsBlocked) {
            // Só deixamos o texto branco se a msg for nova
            // E NÃO estiver bloqueada
            textStyle = 'text-white font-medium';
          }

          return (
            <div
              key={convo.id}
              className="flex items-center p-3 bg-gray-800 rounded-lg shadow-md"
            >
              <Link
                to={`/chat/${convo.id}`}
                className="flex-1 flex items-center overflow-hidden"
              >
                <div className="relative mr-4">
                  <img
                    src={toPublicUrl(otherParticipant.user.profile?.imageUrl)}
                    alt={otherParticipant.user.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultAvatar;
                    }}
                  />
                  {/*
                    Esta lógica (bolinha azul) está correta.
                    Ela só deve aparecer se a msg for nova E não estiver bloqueada.
                  */}
                  {hasUnread && !showAsBlocked && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-indigo-500 border-2 border-gray-800" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg text-white truncate">
                      {otherParticipant.user.name}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {timeAgo}
                    </span>
                  </div>
                  {/*
                    Esta é a lógica do blur.
                    Agora 'showAsBlocked' está correto.
                  */}
                  {showAsBlocked ? (
                    <div className="flex items-center space-x-2">
                      <FiLock className="text-purple-400 text-sm flex-shrink-0" />
                      <p className="text-sm truncate text-gray-400 blur-sm select-none">
                        {messageContent}
                      </p>
                    </div>
                  ) : (
                    <p className={`text-sm truncate ${textStyle}`}>
                      {messageContent}
                    </p>
                  )}
                </div>
              </Link>

              <button
                onClick={(e) => handleHideClick(e, convo.id)}
                className="p-2 ml-2 text-gray-500 hover:text-red-400 transition-colors rounded-full"
                aria-label="Esconder conversa"
              >
                <FiTrash className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // (Helper getTabClassName: Sem alterações)
  const getTabClassName = (tabName: Tab) => {
    const isActive = tabName === activeTab;
    return `flex-1 py-3 text-center font-bold text-lg cursor-pointer transition-all
            ${
              isActive
                ? 'border-b-4 border-purple-500 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`;
  };

  // (Return: Modificado)
  return (
    <div className="p-4 text-white max-w-lg mx-auto">
      {/* --- INÍCIO DA ADIÇÃO: Cabeçalho com Busca --- */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Mensagens</h1>
        <Link
          to="/search"
          className="p-3 bg-gray-800 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          aria-label="Pesquisar usuários"
        >
          <FiSearch className="w-5 h-5" />
        </Link>
      </div>
      {/* --- FIM DA ADIÇÃO --- */}

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        <div
          onClick={() => handleTabClick('messages')}
          className={getTabClassName('messages')}
        >
          <FiMessageCircle className="inline-block mr-2" />
          Mensagens
        </div>
        <div
          onClick={() => handleTabClick('likes')}
          className={getTabClassName('likes')}
        >
          <FiHeart className="inline-block mr-2" />
          Likes Recebidos
          {unreadCount > 0 && (
            <span className="ml-2 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo das Tabs (Sem alterações) */}
      <div>
        {activeTab === 'messages' && renderMessagesList()}
        {activeTab === 'likes' && renderLikesList()}
      </div>

      {/* Modal (Sem alterações) */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onConfirmHide}
        title="Esconder Conversa"
        confirmText="Esconder"
        isLoading={isHiding}
      >
        Tem a certeza de que quer esconder esta conversa? Ela reaparecerá se
        receber uma nova mensagem.
      </ConfirmationModal>
    </div>
  );
}