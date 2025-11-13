// src/features/profile/components/GalleryCommentSheet.tsx
// (COLE ISTO NO SEU ARQUIVO)

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

// --- INÍCIO DA CORREÇÃO (Bug do Reload) ---
// 1. Importar o 'useQueryClient'
import { useQueryClient } from '@tanstack/react-query'; 
// --- FIM DA CORREÇÃO ---

import { useGetGalleryPhotoComments } from '@/features/profile/hooks/useProfile';
import { useCreateOrGetConversation } from '@/features/chat/hooks/useChatMutations';
import { ProfilePhotoComment } from '@/types/profile.types';

import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// (Funções auxiliares 'toPublicUrl', 'useTimeAgo' - sem alterações)
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
  if (isNaN(date.getTime())) return dateString;
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

// CommentItem (sem alterações)
function CommentItem({
  comment,
  shouldBlur,
  onClick,
}: {
  comment: ProfilePhotoComment;
  shouldBlur: boolean;
  onClick: () => void;
}) {
  const timeAgo = useTimeAgo(comment.createdAt);
  const avatarUrl = toPublicUrl(comment.user.profile?.imageUrl);

  return (
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


// Componente principal da Gaveta
export function GalleryCommentSheet({
  photoId,
  photoUserId, // ID do dono da foto (para o hook)
  onClose,
}: {
  photoId: string;
  photoUserId: string;
  onClose: () => void;
}) {
  const [newComment, setNewComment] = useState('');

  // --- INÍCIO DA CORREÇÃO (Bug do Reload) ---
  // 2. Chamar o 'useQueryClient'
  const queryClient = useQueryClient();
  // --- FIM DA CORREÇÃO ---

  // Lógica do Blur (sem alterações)
  const { user: loggedInUser } = useAuth();
  const navigate = useNavigate();
  const isPaywallActive =
    loggedInUser?.subscription?.status === 'FREE' &&
    (loggedInUser?.subscription?.freeContactsUsed ?? 0) >= 3;
  
  // Hook para LER comentários (sem alterações)
  const {
    data: comments,
    isLoading,
    isError,
  } = useGetGalleryPhotoComments(photoId);

  // Hook para ENVIAR MENSAGEM (sem alterações)
  const { mutate: createOrGetConversation, isPending } = useCreateOrGetConversation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isPending) return;

    createOrGetConversation(
      {
        targetUserId: photoUserId, 
        content: newComment.trim(),
        contextPhotoId: photoId,
      },
      {
        // --- INÍCIO DA CORREÇÃO (Bug do Reload) ---
        onSuccess: () => {
          setNewComment(''); 
          
          // 3. Invalidar a query da lista de comentários
          //    Isto força o 'useGetGalleryPhotoComments' a buscar de novo
          console.log(`Invalidando query: ['photoComments', ${photoId}]`);
          queryClient.invalidateQueries({ queryKey: ['photoComments', photoId] });
        },
        // --- FIM DA CORREÇÃO ---
        onError: (error: any) => { 
          console.error("Erro ao iniciar conversa:", error);
        },
      },
    );
  };

  // Handler do clique no blur (sem alterações)
  const handleCommentClick = (isBlurred: boolean) => {
    if (isBlurred) {
      onClose();
      navigate('/premium');
    }
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-8" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-8" />
        </Transition.Child>

        {/* Conteúdo da Gaveta */}
        <div className="fixed inset-x-0 bottom-0 z-9">
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
              {/* Header */}
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

              {/* Lista de Comentários */}
              <div className="flex-1 overflow-y-auto px-4">
                {isLoading && <p className="text-gray-400 text-center py-6">A carregar...</p>}
                {isError && <p className="text-red-400 text-center py-6">Erro ao carregar comentários.</p>}
                {!isLoading && !isError && comments?.length === 0 && (
                  <p className="text-gray-500 text-center py-10">Sê o primeiro a comentar ✨</p>
                )}
                {!isLoading && !isError && comments && (
                  <div>
                    {comments.map((comment) => {
                      const isMe = comment.user.id === loggedInUser?.id;
                      const shouldBlur = isPaywallActive && !isMe;
                      return (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          shouldBlur={shouldBlur}
                          onClick={() => handleCommentClick(shouldBlur)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer (Input de Comentário) */}
              <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900 p-4">
                {isPaywallActive ? (
                  <div className="p-2 text-center">
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/premium');
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
                      disabled={isPending}
                      className="w-full flex-1 rounded-full border-none bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isPending}
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