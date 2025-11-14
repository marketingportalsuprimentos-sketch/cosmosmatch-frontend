// frontend/src/pages/FeedPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetFeed,
  useLikePost,
  useUnlikePost,
  useDeletePost,
} from '@/features/feed/hooks/useFeed';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence, motion } from 'framer-motion';
import { MediaType, FeedPost } from '@/features/feed/services/feedApi';
import { FeedCommentSheet } from '@/features/feed/components/FeedCommentSheet';
import { toast } from 'sonner';

import {
  UserPlusIcon,
  UserMinusIcon,
  HeartIcon as HeartIconSolid,
  ChatBubbleOvalLeftEllipsisIcon,
  ShareIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import {
  useGetFollowing,
  useFollowUser,
  useUnfollowUser,
} from '@/features/profile/hooks/useProfile';
import { PersonalDayCard } from '@/features/feed/components/PersonalDayCard';

// --- INÍCIO DA ADIÇÃO (Real-time Feed) ---
import { useQueryClient, InfiniteData } from '@tanstack/react-query';

// O tipo de dados que o 'useGetFeed' retorna (inferido do seu código)
type FeedDeck = {
  author: {
    id: string;
    name: string;
    profile?: { imageUrl: string };
  };
  posts: FeedPost[];
};
// --- FIM DA ADIÇÃO ---

// (Componente de Loading - Sem alterações)
const LoadingFeed = () => (
  <div className="flex flex-1 items-center justify-center text-white">
    <svg
      className="animate-spin h-8 w-8 text-purple-400 mr-3"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      ></path>
    </svg>
    A carregar o feed cósmico... ✨
  </div>
);

// (Componente EmptyFeed - Sem alterações)
const EmptyFeed = ({ isError }: { isError?: boolean }) => (
  <div className="flex flex-1 items-center justify-center text-center text-gray-400 px-4">
    <p>
      {isError
        ? 'Ocorreu um erro ao carregar o feed. Tente novamente mais tarde.'
        : 'Nenhuma publicação encontrada ainda. Que tal criar a primeira?'}
    </p>
  </div>
);

// (Componente PostMedia - Sem alterações)
const PostMedia = ({ post, url }: { post: FeedPost; url: string }) => {
  const placeholder = '/placeholder-image.png';
  const mediaClasses = 'block w-full h-full object-contain select-none';

  if (post.mediaType === MediaType.VIDEO) {
    return (
      <video
        key={post.id}
        src={url}
        autoPlay
        loop
        muted
        playsInline
        className={mediaClasses}
        onError={(e) => {
          (e.target as HTMLVideoElement).src = placeholder;
        }}
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
      />
    );
  }

  return (
    <img
      key={post.id}
      src={url}
      alt={`Post de ${post.authorId}`}
      className={mediaClasses}
      onError={(e) => {
        (e.target as HTMLImageElement).src = placeholder;
      }}
      draggable="false"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

// (Componente FeedProgressBars - Sem alterações)
const FeedProgressBars = ({
  total,
  current,
  duration,
}: {
  total: number;
  current: number;
  duration: number;
}) => {
  return (
    <div className="absolute top-3 left-0 right-0 z-20 flex gap-1 pointer-events-none px-4">
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx === current;
        const isPast = idx < current;

        return (
          <div
            key={idx}
            className="h-1 flex-1 rounded-full overflow-hidden bg-white/30"
          >
            {isPast ? (
              <div className="h-full w-full bg-white" />
            ) : isActive ? (
              <motion.div
                className="h-full bg-white"
                style={{ willChange: 'width' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: duration, ease: 'linear' }}
              />
            ) : (
              <div className="h-full w-0" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export function FeedPage() {
  const PHOTO_DURATION_SECONDS = 5;

  const navigate = useNavigate();
  // --- INÍCIO DA ADIÇÃO (Real-time Feed) ---
  const queryClient = useQueryClient();
  // --- FIM DA ADIÇÃO ---

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingFeed,
    isFetchingNextPage,
    isError,
  } = useGetFeed();

  const { mutate: likePostMutate, isPending: isLiking } = useLikePost();
  const { mutate: unlikePostMutate, isPending: isUnliking } = useUnlikePost();
  const { mutate: deletePostMutate, isPending: isDeletingPost } =
    useDeletePost();

  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);

  const [viewingCommentsForPostId, setViewingCommentsForPostId] =
    useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const currentDeckData = feedData?.pages?.[currentDeckIndex];
  const currentPostData = currentDeckData?.posts?.[currentPostIndex];
  const isActionLoading = isLiking || isUnliking || isDeletingPost;

  // (Handlers de Swipe - Sem alterações)
  const handleSwipeLeft = useCallback(() => {
    const nextPostIndex = currentPostIndex + 1;
    if (currentDeckData && nextPostIndex < currentDeckData.posts.length) {
      setCurrentPostIndex(nextPostIndex);
    }
  }, [currentDeckData, currentPostIndex]);

  const handleSwipeUp = useCallback(() => {
    const nextDeckIndex = currentDeckIndex + 1;
    if (
      (feedData?.pages && nextDeckIndex < feedData.pages.length) ||
      hasNextPage
    ) {
      if (
        hasNextPage &&
        (!feedData?.pages || nextDeckIndex >= feedData.pages.length) &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
      setCurrentDeckIndex(nextDeckIndex);
      setCurrentPostIndex(0);
    }
  }, [
    currentDeckIndex,
    feedData?.pages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const handleSwipeDown = useCallback(() => {
    const prevDeckIndex = currentDeckIndex - 1;
    if (prevDeckIndex >= 0) {
      setCurrentDeckIndex(prevDeckIndex);
      setCurrentPostIndex(0);
    }
  }, [currentDeckIndex]);

  const handleSwipeRight = useCallback(() => {
    const prevPostIndex = currentPostIndex - 1;
    if (prevPostIndex >= 0) {
      setCurrentPostIndex(prevPostIndex);
    }
  }, [currentPostIndex]);

  const swipeHandlers = useSwipeable({
    onSwipedUp: handleSwipeUp,
    onSwipedDown: handleSwipeDown,
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  // (useEffect de validação de índice - Sem alterações)
  useEffect(() => {
    if (
      feedData?.pages &&
      currentDeckIndex >= feedData.pages.length &&
      !hasNextPage &&
      !isFetchingNextPage
    ) {
      setCurrentDeckIndex(Math.max(0, feedData.pages.length - 1));
      setCurrentPostIndex(0);
    }
  }, [feedData?.pages, currentDeckIndex, hasNextPage, isFetchingNextPage]);

  // (useEffect do Temporizador - Sem alterações)
  useEffect(() => {
    if (
      currentPostData &&
      currentDeckData &&
      !viewingCommentsForPostId &&
      !isPaused
    ) {
      let durationInSeconds: number;
      if (
        currentPostData.mediaType === MediaType.VIDEO &&
        currentPostData.videoDuration &&
        currentPostData.videoDuration > 0
      ) {
        durationInSeconds = currentPostData.videoDuration;
      } else {
        durationInSeconds = PHOTO_DURATION_SECONDS;
      }

      const timerId = setTimeout(() => {
        const isLastPostInDeck =
          currentPostIndex === currentDeckData.posts.length - 1;

        if (isLastPostInDeck) {
          handleSwipeUp();
        } else {
          handleSwipeLeft();
        }
      }, durationInSeconds * 1000);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [
    currentPostIndex,
    currentDeckIndex,
    currentPostData,
    currentDeckData,
    handleSwipeLeft,
    handleSwipeUp,
    viewingCommentsForPostId,
    isPaused,
  ]);

  // (Handler de Like - Sem alterações)
  const handleLikeToggle = () => {
    if (!currentPostData || isActionLoading) return;
    if (currentPostData.isLikedByMe) {
      unlikePostMutate(currentPostData.id);
    } else {
      likePostMutate(currentPostData.id);
    }
  };

  // (Handler de Comentário - Sem alterações)
  const handleCommentClick = () => {
    if (currentPostData) {
      setViewingCommentsForPostId(currentPostData.id);
    }
  };

  // --- INÍCIO DA ATUALIZAÇÃO (Real-time Feed) ---
  // Apanhamos o 'socket' do contexto de autenticação
  const { user: loggedInUser, socket } = useAuth();
  // --- FIM DA ATUALIZAÇÃO ---
  const authorId = currentDeckData?.author?.id;
  const isOwner = loggedInUser?.id === authorId;

  const { data: followingList, isLoading: isLoadingFollowing } = useGetFollowing(
    loggedInUser?.id,
    { enabled: !!loggedInUser?.id && !isOwner },
  );

  const { mutate: followUser, isPending: isFollowing } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowing } = useUnfollowUser();

  const isAlreadyFollowing = followingList?.some(
    (user) => user.id === authorId,
  );
  const isConnectLoading =
    isFollowing || isUnfollowing || isLoadingFollowing;

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnectLoading || !authorId || isOwner) return;
    if (isAlreadyFollowing) {
      unfollowUser(authorId);
    } else {
      followUser(authorId);
    }
  };

  // (Handler de Partilha - Sem alterações)
  const handleShare = () => {
    if (!currentPostData || !currentDeckData?.author) return;

    const postUrl = `${window.location.origin}/post/${currentPostData.id}`;
    const authorName = currentDeckData.author.name;
    const shareText = `Veja este post de ${authorName} no CosmosMatch!`;
    const shareTitle = `Post de ${authorName}`;

    if (navigator.share) {
      navigator
        .share({
          title: shareTitle,
          text: shareText,
          url: postUrl,
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Erro ao partilhar:', err);
            toast.error('Ocorreu um erro ao tentar partilhar.');
          }
        });
    } else {
      navigator.clipboard
        .writeText(postUrl)
        .then(() => {
          toast.success('Link do post copiado para a área de transferência!');
        })
        .catch(() => {
          toast.error('Erro ao copiar o link.');
        });
    }
  };

  // (Handler de Apagar Post - Sem alterações)
  const handleDeletePost = () => {
    if (!currentPostData || isDeletingPost) return;

    setIsPaused(true);

    toast.warning('Apagar este post?', {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Apagar',
        onClick: () => deletePostMutate(currentPostData.id),
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {
          /* Faz nada, o onDismiss trata de retomar */
        },
      },
      duration: 5000, 
      onDismiss: () => setIsPaused(false),
    });
  };
  
  // --- INÍCIO DA ADIÇÃO (Real-time Feed) ---
  /**
   * Este useEffect regista os listeners do WebSocket.
   */
  useEffect(() => {
    // Se o socket não estiver pronto (a ligar ou falhou), não faz nada.
    if (!socket) {
      console.log('Socket.io: Aguardando conexão...');
      return;
    }

    console.log('Socket.io: Conectado e a ouvir eventos do feed.');

    /**
     * Ouve por 'feed:new_post'.
     * Quando um post novo é criado, invalidamos a query 'feed'.
     * O React-Query irá re-buscar a página 0.
     */
    const handleNewPost = (newPost: FeedPost) => {
      console.log('Socket.io: Evento [feed:new_post] recebido!', newPost);
      // Invalida a query 'feed'. Isto força o 'useGetFeed' a re-buscar a página 0.
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    };

    /**
     * Ouve por 'feed:delete_post'.
     * Quando um post é apagado, temos de o remover manualmente do cache.
     * Não podemos 'invalidar' pois o post pode estar numa página antiga.
     */
    const handleDeletePost = (deleted: {
      postId: string;
      authorId: string;
    }) => {
      console.log('Socket.io: Evento [feed:delete_post] recebido!', deleted);
      
      // 'setQueryData' atualiza o cache do react-query
      queryClient.setQueryData(
        ['feed'], // A key da nossa query
        (oldData: InfiniteData<FeedDeck> | undefined) => {
          // Se não houver dados em cache, não faz nada
          if (!oldData) return oldData;

          // 1. Mapeia todas as 'páginas' (decks)
          const newPages = oldData.pages
            .map((deck) => {
              // Se este deck não for do autor do post apagado,
              // retorna o deck intacto.
              if (deck.author.id !== deleted.authorId) {
                return deck;
              }

              // Se for o deck do autor, filtra os posts
              const newPosts = deck.posts.filter(
                (post) => post.id !== deleted.postId,
              );

              // Retorna o deck com a lista de posts atualizada
              return {
                ...deck,
                posts: newPosts,
              };
            })
            // 2. Filtra os decks que podem ter ficado vazios
            .filter((deck) => deck.posts.length > 0);

          // Retorna a estrutura de dados completa para o react-query
          return {
            ...oldData,
            pages: newPages,
          };
        },
      );
    };

    // Regista os listeners no socket
    socket.on('feed:new_post', handleNewPost);
    socket.on('feed:delete_post', handleDeletePost);

    // Função de cleanup (IMPORTANTE)
    // Remove os listeners quando o componente for desmontado
    return () => {
      console.log('Socket.io: A desligar listeners do feed.');
      socket.off('feed:new_post', handleNewPost);
      socket.off('feed:delete_post', handleDeletePost);
    };
  }, [socket, queryClient]); // Dependências: socket e queryClient
  // --- FIM DA ADIÇÃO ---


  // (Renderização de Loading/Empty - Sem alterações)
  if (isLoadingFeed) {
    return <LoadingFeed />;
  }
  if (
    isError ||
    !feedData ||
    feedData.pages.length === 0 ||
    !feedData.pages[0] ||
    feedData.pages[0].posts.length === 0
  ) {
    return <EmptyFeed isError={isError} />;
  }
  if (
    !currentDeckData &&
    (isFetchingNextPage || currentDeckIndex >= feedData.pages.length)
  ) {
    return <LoadingFeed />;
  }
  if (!currentDeckData || currentDeckData.posts.length === 0) {
    return <EmptyFeed />;
  }
  if (currentPostIndex >= currentDeckData.posts.length) {
    setCurrentPostIndex(0);
    return <LoadingFeed />;
  }

  const postToDisplay = currentDeckData.posts[currentPostIndex];
  const authorToDisplay = currentDeckData.author;

  const defaultAvatar = '/default-avatar.png';
  const placeholderImage = '/placeholder-image.png';
  const authorAvatarUrl = authorToDisplay?.profile?.imageUrl ?? defaultAvatar;
  const postMediaUrl = postToDisplay?.imageUrl ?? placeholderImage;

  const activePostDuration =
    postToDisplay.mediaType === MediaType.VIDEO && postToDisplay.videoDuration
      ? postToDisplay.videoDuration
      : PHOTO_DURATION_SECONDS;

  // (JSX - Sem alterações)
  return (
    <div
      {...swipeHandlers}
      className="flex min-h-screen flex-col bg-black text-white relative overflow-hidden"
    >
      <div className="relative flex-1">
        <AnimatePresence>
          <motion.div
            key={`${currentDeckIndex}-${currentPostIndex}`}
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. Mídia */}
            <div className="absolute inset-0 px-4">
              <PostMedia post={postToDisplay} url={postMediaUrl} />
            </div>

            {/* 2. Barras de Progresso */}
            {currentDeckData.posts.length >= 1 && (
              <FeedProgressBars
                key={`${currentDeckIndex}-${currentPostIndex}`}
                total={currentDeckData.posts.length}
                current={currentPostIndex}
                duration={activePostDuration}
              />
            )}

            {/* 3. Header do Autor */}
            <div className="pointer-events-none absolute top-6 left-0 right-0 z-10 px-4">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3">
                <img
                  src={authorAvatarUrl}
                  alt={authorToDisplay?.name || 'Avatar'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 bg-gray-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatar;
                  }}
                />

                <span
                  className="font-semibold text-lg text-white drop-shadow-md truncate cursor-pointer hover:underline"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (authorToDisplay?.id) {
                      navigate(`/profile/${authorToDisplay.id}`);
                    }
                  }}
                >
                  {authorToDisplay?.name || 'Utilizador'}
                </span>

                {isOwner && (
                  <button
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost();
                    }}
                    disabled={isDeletingPost}
                    className="p-2 text-gray-400 rounded-full hover:bg-black/50 hover:text-white disabled:opacity-50"
                    aria-label="Apagar post"
                  >
                    {isDeletingPost ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                    ) : (
                      <XMarkIcon className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 4. Gradiente e Legenda */}
            {postToDisplay.content && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 pt-24 pb-4 px-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                <p className="text-sm text-white drop-shadow-sm">
                  {postToDisplay.content}
                </p>
              </div>
            )}

            {/* 5. Botões de Ação */}
            <div className="absolute right-4 bottom-[calc(4rem+1rem)] flex flex-col space-y-5 items-center z-20">
              {!isOwner && (
                <button
                  style={{ pointerEvents: 'auto' }}
                  onClick={handleConnectClick}
                  disabled={isConnectLoading}
                  className={`text-white flex flex-col items-center p-2 rounded-full bg-black/40 backdrop-blur-sm transition-colors duration-150 disabled:opacity-50
                    ${isConnectLoading ? 'opacity-50' : ''}
                    ${
                      isAlreadyFollowing
                        ? 'hover:text-gray-400'
                        : 'hover:text-indigo-400'
                    }
                  `}
                >
                  {isAlreadyFollowing ? (
                    <UserMinusIcon className="h-7 w-7 text-gray-400" />
                  ) : (
                    <UserPlusIcon className="h-7 w-7" />
                  )}
                </button>
              )}

              <button
                style={{ pointerEvents: 'auto' }}
                onClick={handleLikeToggle}
                disabled={isActionLoading}
                className={`text-white flex flex-col items-center p-2 rounded-full bg-black/40 backdrop-blur-sm transition-colors duration-150 disabled:opacity-50
                  ${!postToDisplay.isLikedByMe ? 'hover:text-red-400' : ''}
                `}
              >
                {postToDisplay.isLikedByMe ? (
                  <HeartIconSolid className="h-7 w-7 text-red-500" />
                ) : (
                  <HeartIconOutline className="h-7 w-7" />
                )}
                <span className="text-xs font-semibold mt-1">
                  {postToDisplay.likesCount || 0}
                </span>
              </button>

              <button
                style={{ pointerEvents: 'auto' }}
                onClick={handleCommentClick}
                className="text-white flex flex-col items-center p-2 rounded-full bg-black/40 backdrop-blur-sm hover:text-blue-400 transition-colors duration-150"
              >
                <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7" />
                <span className="text-xs font-semibold mt-1">
                  {postToDisplay.commentsCount || 0}
                </span>
              </button>

              <button
                style={{ pointerEvents: 'auto' }}
                onClick={handleShare}
                className="text-white flex flex-col items-center p-2 rounded-full bg-black/40 backdrop-blur-sm hover:text-green-400 transition-colors duration-150"
              >
                <ShareIcon className="h-7 w-7" />
                <span className="text-xs font-semibold mt-1">
                  Compartilhar
                </span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Card Fixo */}
        <PersonalDayCard />

        {/* Loading next page */}
        {isFetchingNextPage && (
          <div className="absolute bottom-[calc(4rem+1rem)] left-1/2 -translate-x-1-2 text-xs bg-black/50 px-2 py-1 rounded animate-pulse">
            Carregando próximo...
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewingCommentsForPostId && (
          <FeedCommentSheet
            postId={viewingCommentsForPostId}
            authorId={currentDeckData?.author?.id}
            onClose={() => setViewingCommentsForPostId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}