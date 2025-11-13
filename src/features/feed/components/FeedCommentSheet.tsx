// src/features/feed/components/FeedCommentSheet.tsx
// (COLE ISTO NO SEU ARQUIVO)

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

import { useGetPostComments } from '@/features/feed/hooks/useFeed';
import { useCreateOrGetConversation } from '@/features/chat/hooks/useChatMutations';
import { PostComment } from '../services/feedApi';

// --- INÍCIO DA ADIÇÃO (Lógica do Blur) ---
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// --- FIM DA ADIÇÃO ---


// (Funções 'toPublicUrl' e 'useTimeAgo' - Sem alterações)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const backendOrigin = apiUrl.replace(/\/api\/?$/, ''); 
const defaultAvatar = '/default-avatar.png';
const toPublicUrl = (path?: string | null) => {
  if (!path) return defaultAvatar; 
  if (/^https?:\/\//i.test(path)) return path; 
  return `${backendOrigin}/${path}`; 
};

function useTimeAgo(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `há ${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.round(hours / 24);
  return `há ${days}d`;
}

// --- INÍCIO DA CORREÇÃO (Lógica do Blur) ---
// O CommentItem agora precisa de saber se deve aplicar o 'blur'
// e o que fazer quando é clicado.
function CommentItem({
  comment,
  shouldBlur,
  onClick,
}: {
  comment: PostComment;
  shouldBlur: boolean;
  onClick: () => void;
}) {
  const timeAgo = useTimeAgo(comment.createdAt);
  const avatarUrl = toPublicUrl(comment.user.profile?.imageUrl);

  return (
    // 1. Adicionado o 'onClick'
    <div
      className={`flex items-start gap-3 py-3 ${
        shouldBlur ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <img
        src={avatarUrl} 
        alt={comment.user.name}
        className="h-9 w-9 rounded-full object-cover bg-gray-700"
        onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
      />
      <div className="flex-1 text-sm">
        <p className="text-gray-100">
          <span className="font-semibold">{comment.user.name}</span>
          <span className="ml-2 text-gray-400 text-xs">{timeAgo}</span>
        </p>
        {/* 2. Adicionada a classe de 'blur' */}
        <p
          className={`text-gray-300 mt-0.5 ${
            shouldBlur ? 'blur-sm select-none' : ''
          }`}
        >
          {comment.content}
        </p>
      </div>
    </div>
  );
}
// --- FIM DA CORREÇÃO ---

// Componente principal da Gaveta
export function FeedCommentSheet({
  postId,
  authorId,
  onClose,
}: {
  postId: string;
  authorId: string | undefined; 
  onClose: () => void;
}) {
  const [newComment, setNewComment] = useState('');

  // --- INÍCIO DA ADIÇÃO (Lógica do Blur) ---
  const { user: loggedInUser } = useAuth();
  const navigate = useNavigate();

  // 1. A mesma lógica do Paywall que está na página de chat
  const isPaywallActive =
    loggedInUser?.subscription?.status === 'FREE' &&
    (loggedInUser?.subscription?.freeContactsUsed ?? 0) >= 3;
  // --- FIM DA ADIÇÃO ---


  // Hook para LER comentários (mantido)
  const {
    data: comments,
    isLoading,
    isError,
  } = useGetPostComments(postId);

  const { mutate: createOrGetConversation, isPending } = useCreateOrGetConversation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isPending || !authorId) return;

    createOrGetConversation(
      {
        targetUserId: authorId,
        content: newComment.trim(),
        contextPostId: postId, 
      },
      {
        onSuccess: () => {
          setNewComment(''); 
        },
        onError: (error: any) => {
          console.error("Erro ao iniciar conversa:", error);
        }
      },
    );
  };

  // --- INÍCIO DA ADIÇÃO (Lógica do Blur) ---
  // 2. Handler para o clique no comentário
  const handleCommentClick = (isBlurred: boolean) => {
    // Se estiver em blur, redireciona para o premium
    if (isBlurred) {
      onClose(); // Fecha a gaveta
      navigate('/premium'); // Redireciona
    }
    // Caso contrário, não faz nada (no futuro, pode abrir o perfil do comentador)
  };
  // --- FIM DA ADIÇÃO ---

  // (Resto do JSX)
  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-5" onClose={onClose}>
        {/* ... (Overlay sem alterações) ... */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-5" /> 
        </Transition.Child>
        <div className="fixed inset-x-0 bottom-0 z-6">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="flex h-[75vh] max-h-[75vh] w-full max-w-xl mx-auto flex-col overflow-hidden rounded-t-2xl bg-gray-900 shadow-2xl">
              {/* ... (Header sem alterações) ... */}
              <div className="relative flex-shrink-0 border-b border-gray-700 px-4 py-3">
                <Dialog.Title className="text-center text-lg font-semibold text-white">
                  Comentários
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="absolute right-3 top-2.5 rounded-full p-2 text-gray-400 hover:bg-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Lista de Comentários (COM A LÓGICA DO BLUR) */}
              <div className="flex-1 overflow-y-auto px-4">
                {isLoading && <p className="text-gray-400 text-center py-6">A carregar...</p>}
                {isError && <p className="text-red-400 text-center py-6">Erro ao carregar comentários.</p>}
                {!isLoading && !isError && comments?.length === 0 && (
                  <p className="text-gray-500 text-center py-10">Sê o primeiro a comentar ✨</p>
                )}
                {!isLoading && !isError && comments && (
                  <div>
                    {/* --- INÍCIO DA CORREÇÃO (Lógica do Blur) --- */}
                    {comments.map((comment) => {
                      // 3. Verifica se é uma msg recebida e se o paywall está ativo
                      const isMe = comment.user.id === loggedInUser?.id;
                      const shouldBlur = isPaywallActive && !isMe;

                      return (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          shouldBlur={shouldBlur} // Passa o 'blur'
                          onClick={() => handleCommentClick(shouldBlur)} // Passa o 'click'
                        />
                      );
                    })}
                    {/* --- FIM DA CORREÇÃO --- */}
                  </div>
                )}
              </div>

              {/* Footer (Input de Mensagem) */}
              <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900 p-4">
                {/* 4. O formulário é escondido se o paywall estiver ativo */}
                {isPaywallActive ? (
                   <div className="p-2 text-center">
                    <button
                      onClick={() => {
                        onClose(); // Fecha a gaveta
                        navigate('/premium'); // Redireciona
                      }}
                      className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-full flex items-center justify-center space-x-2 hover:bg-purple-700 transition-colors"
                    >
                      <span>Assine o Premium para responder</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Enviar mensagem..." 
                      disabled={isPending || !authorId} 
                      className="w-full flex-1 rounded-full border-none bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isPending || !authorId}
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 text-white transition-colors duration-200 enabled:hover:bg-purple-400 disabled:opacity-50"
                    >
                      {isPending ? (
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      ) : (
                        <PaperAirplaneIcon className="h-5 w-5" />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}