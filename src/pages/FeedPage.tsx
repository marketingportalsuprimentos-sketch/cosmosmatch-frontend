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
import { ReportPostModal } from '@/features/feed/components/ReportPostModal'; 
import { toast } from 'sonner';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { api } from '@/services/api';

import {
  UserPlusIcon,
  UserMinusIcon,
  HeartIcon as HeartIconSolid,
  ChatBubbleOvalLeftEllipsisIcon,
  ShareIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  EyeSlashIcon,
  LockClosedIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import {
  useGetFollowing,
  useFollowUser,
  useUnfollowUser,
} from '@/features/profile/hooks/useProfile';
import { PersonalDayCard } from '@/features/feed/components/PersonalDayCard';

// Definição do Tipo de Deck
type FeedDeck = {
  author: {
    id: string;
    name: string;
    profile?: { imageUrl?: string | null };
  };
  posts: FeedPost[];
};

// --- Componentes Auxiliares ---

const LoadingFeed = () => (
  <div className="flex flex-1 items-center justify-center text-white h-screen bg-black">
    <div className="flex flex-col items-center">
        <svg className="animate-spin h-8 w-8 text-purple-400 mb-3" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p>A carregar o feed cósmico... ✨</p>
    </div>
  </div>
);

const EmptyFeed = ({ isError }: { isError?: boolean }) => (
  <div className="flex flex-1 items-center justify-center text-center text-gray-400 px-4 h-screen bg-black">
    <p>
      {isError
        ? 'Ocorreu um erro ao carregar o feed. Tente novamente mais tarde.'
        : 'Nenhuma publicação encontrada ainda. Que tal criar a primeira?'}
    </p>
  </div>
);

const PostMedia = ({ post, url }: { post: FeedPost; url: string }) => {
  const placeholder = '/placeholder-image.png';
  const mediaClasses = 'block w-full h-full object-contain select-none bg-black';

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
        onError={(e) => { (e.target as HTMLVideoElement).src = placeholder; }}
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
      onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
      draggable="false"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

// --- BARRAS SEGMENTADAS ---
const FeedProgressBars = ({
  total,
  current,
  duration,
  isPaused
}: {
  total: number;
  current: number;
  duration: number;
  isPaused: boolean;
}) => {
  return (
    // CORREÇÃO: Mudamos z-20 para z-[60] para ficar ACIMA do Blur
    <div className="absolute top-3 left-0 right-0 z-[60] flex gap-1 pointer-events-none px-4">
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx === current;
        const isPast = idx < current;

        return (
          <div key={idx} className="h-1 flex-1 rounded-full overflow-hidden bg-white/30">
            {isPast ? (
              <div className="h-full w-full bg-white" />
            ) : isActive ? (
              <motion.div
                className="h-full bg-white"
                style={{ willChange: 'width' }}
                initial={{ width: '0%' }}
                animate={{ width: isPaused ? 'var(--radix-progress-value)' : '100%' }} 
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

// --- Componente Principal ---

export function FeedPage() {
  const PHOTO_DURATION_SECONDS = 5;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
  const { mutate: deletePostMutate, isPending: isDeletingPost } = useDeletePost();

  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [viewingCommentsForPostId, setViewingCommentsForPostId] = useState<string | null>(null);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Acesso seguro aos dados
  const currentDeckData = feedData?.pages ? feedData.pages[currentDeckIndex] : undefined;
  const currentPostData = currentDeckData?.posts ? currentDeckData.posts[currentPostIndex] : undefined;
  
  const isActionLoading = isLiking || isUnliking || isDeletingPost || isRestoring;

  // --- Handlers de Navegação ---
  const handleSwipeLeft = useCallback(() => {
    if (!currentDeckData) return;
    const nextPostIndex = currentPostIndex + 1;
    if (nextPostIndex < currentDeckData.posts.length) {
      setCurrentPostIndex(nextPostIndex);
    } else {
      handleSwipeUp(); 
    }
  }, [currentDeckData, currentPostIndex]); 

  const handleSwipeUp = useCallback(() => {
    const nextDeckIndex = currentDeckIndex + 1;
    if ((feedData?.pages && nextDeckIndex < feedData.pages.length) || hasNextPage) {
      if (hasNextPage && (!feedData?.pages || nextDeckIndex >= feedData.pages.length) && !isFetchingNextPage) {
        fetchNextPage();
      }
      setCurrentDeckIndex(nextDeckIndex);
      setCurrentPostIndex(0);
    }
  }, [currentDeckIndex, feedData?.pages, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  useEffect(() => {
    if (feedData?.pages && currentDeckIndex >= feedData.pages.length && !hasNextPage && !isFetchingNextPage) {
      setCurrentDeckIndex(Math.max(0, feedData.pages.length - 1));
      setCurrentPostIndex(0);
    }
  }, [feedData?.pages, currentDeckIndex, hasNextPage, isFetchingNextPage]);

  // Timer Automático
  useEffect(() => {
    const isPostHidden = currentPostData?.isHidden; 
    if (currentPostData && currentDeckData && !viewingCommentsForPostId && !reportingPostId && !isPaused && !isPostHidden) {
      let durationInSeconds = PHOTO_DURATION_SECONDS;
      if (currentPostData.mediaType === MediaType.VIDEO && currentPostData.videoDuration) {
        durationInSeconds = currentPostData.videoDuration;
      }

      const timerId = setTimeout(() => {
        const isLastPost = currentPostIndex === currentDeckData.posts.length - 1;
        if (isLastPost) {
          handleSwipeUp();
        } else {
          setCurrentPostIndex(prev => prev + 1);
        }
      }, durationInSeconds * 1000);

      return () => clearTimeout(timerId);
    }
  }, [currentPostIndex, currentDeckIndex, currentPostData, currentDeckData, handleSwipeUp, viewingCommentsForPostId, reportingPostId, isPaused]);

  // --- Lógica de UI ---
  const { user: loggedInUser, socket } = useAuth();
  const authorId = currentDeckData?.author?.id;
  const isOwner = loggedInUser?.id === authorId;
  const isAdmin = loggedInUser?.role === 'ADMIN';

  const { data: followingList, isLoading: isLoadingFollowing } = useGetFollowing(loggedInUser?.id, { enabled: !!loggedInUser?.id && !isOwner });
  const { mutate: followUser, isPending: isFollowing } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowing } = useUnfollowUser();

  const isAlreadyFollowing = followingList?.some(user => user.id === authorId);
  const isConnectLoading = isFollowing || isUnfollowing || isLoadingFollowing;

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnectLoading || !authorId || isOwner) return;
    isAlreadyFollowing ? unfollowUser(authorId) : followUser(authorId);
  };

  const handleLikeToggle = () => {
    if (!currentPostData || isActionLoading || currentPostData.isHidden) return;
    if (currentPostData.isLikedByMe) {
        unlikePostMutate(currentPostData.id);
    } else {
        likePostMutate(currentPostData.id);
    }
  };

  const handleCommentClick = () => {
    if (currentPostData && !currentPostData.isHidden) setViewingCommentsForPostId(currentPostData.id);
  };

  const handleShare = () => {
    if (!currentPostData || !currentDeckData?.author || currentPostData.isHidden) return;
    const postUrl = `${window.location.origin}/post/${currentPostData.id}`;
    if (navigator.share) {
      navigator.share({ title: 'CosmosMatch', text: `Post de ${currentDeckData.author.name}`, url: postUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(postUrl).then(() => toast.success('Link copiado!')).catch(() => toast.error('Erro ao copiar'));
    }
  };

  const handleDeletePost = () => {
    if (!currentPostData || isDeletingPost) return;
    setIsPaused(true);
    toast.warning('Apagar post?', {
      description: 'Irreversível.',
      action: { label: 'Apagar', onClick: () => deletePostMutate(currentPostData.id) },
      cancel: { label: 'Cancelar', onClick: () => {} },
      onDismiss: () => setIsPaused(false),
    });
  };

  const handleRestorePost = async () => {
    if (!currentPostData || !isAdmin) return;
    try {
        setIsRestoring(true);
        await api.patch(`/post/${currentPostData.id}/restore`);
        toast.success('Post restaurado com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['feed'] });
    } catch (error) {
        toast.error('Erro ao restaurar post.');
    } finally {
        setIsRestoring(false);
    }
  };

  // --- Sockets ---
  useEffect(() => {
    if (!socket) return;
    const handleNewPost = () => queryClient.invalidateQueries({ queryKey: ['feed'] });
    const handleDeletePostEvent = (del: {postId: string, authorId: string}) => {
       queryClient.setQueryData(['feed'], (old: InfiniteData<FeedDeck> | undefined) => {
         if (!old?.pages) return old;
         const newPages = old.pages.map(deck => {
            if (deck.author.id !== del.authorId) return deck;
            return { ...deck, posts: deck.posts.filter(p => p.id !== del.postId) };
         }).filter(deck => deck.posts.length > 0);
         return { ...old, pages: newPages };
       });
    };
    socket.on('feed:new_post', handleNewPost);
    socket.on('feed:delete_post', handleDeletePostEvent);
    return () => {
      socket.off('feed:new_post', handleNewPost);
      socket.off('feed:delete_post', handleDeletePostEvent);
    };
  }, [socket, queryClient]);

  // --- Render ---
  if (isLoadingFeed) return <LoadingFeed />;
  if (isError || !feedData?.pages?.[0]?.posts) return <EmptyFeed isError={isError} />;
  
  if (!currentDeckData || !currentDeckData.posts || currentDeckData.posts.length === 0) {
      return <EmptyFeed />;
  }
  
  if (!currentPostData) {
     return <LoadingFeed />;
  }

  const authorToDisplay = currentDeckData.author;
  const defaultAvatar = '/default-avatar.png';
  const authorAvatarUrl = authorToDisplay.profile?.imageUrl ?? defaultAvatar;
  const postMediaUrl = currentPostData.imageUrl ?? '/placeholder-image.png';
  const activeDuration = currentPostData.mediaType === MediaType.VIDEO && currentPostData.videoDuration ? currentPostData.videoDuration : PHOTO_DURATION_SECONDS;
  const isHidden = currentPostData.isHidden;

  return (
    <div {...swipeHandlers} className="flex min-h-screen flex-col bg-black text-white relative overflow-hidden">
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentDeckIndex}-${currentPostIndex}`}
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 px-4 bg-black flex items-center justify-center">
              <PostMedia post={currentPostData} url={postMediaUrl} />
              
              {/* --- EFEITO BLUR (Camada z-50) --- */}
              {isHidden && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl p-8 text-center border-2 border-red-500/20 m-4 rounded-3xl">
                    <EyeSlashIcon className="h-16 w-16 text-gray-400 mb-4 opacity-50" />
                    <h3 className="text-2xl font-bold text-white mb-2">Conteúdo Oculto</h3>
                    <p className="text-gray-300 mb-6">Este post está sob análise da moderação devido a denúncias da comunidade.</p>
                    
                    {isAdmin && (
                        <div className="mt-4 p-4 bg-gray-800/80 rounded-xl border border-gray-700 w-full">
                            <p className="text-xs text-yellow-400 mb-3 uppercase tracking-wider font-bold">Painel de Admin</p>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleRestorePost(); }}
                                disabled={isRestoring}
                                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                {isRestoring ? 'Processando...' : (
                                    <>
                                        <LockClosedIcon className="w-5 h-5" />
                                        Restaurar Conteúdo
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
              )}
            </div>

            <FeedProgressBars
              key={`progress-${currentDeckIndex}-${currentPostIndex}`}
              total={currentDeckData.posts.length}
              current={currentPostIndex}
              duration={activeDuration}
              isPaused={isHidden || isPaused}
            />

            {/* Header do Autor: CORREÇÃO z-10 para z-[60] */}
            <div className="pointer-events-none absolute top-6 left-0 right-0 z-[60] px-4">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3">
                <img
                  src={authorAvatarUrl}
                  alt={authorToDisplay.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 bg-gray-700"
                  onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                />
                <span className="font-semibold text-lg text-white drop-shadow-md truncate cursor-pointer hover:underline" style={{ pointerEvents: 'auto' }} onClick={(e) => { e.stopPropagation(); navigate(`/profile/${authorToDisplay.id}`); }}>
                  {authorToDisplay.name}
                </span>
                
                {isOwner ? (
                  <button style={{ pointerEvents: 'auto' }} onClick={(e) => { e.stopPropagation(); handleDeletePost(); }} disabled={isDeletingPost} className="p-2 text-gray-400 rounded-full hover:bg-black/50 hover:text-white">
                    {isDeletingPost ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : <XMarkIcon className="w-5 h-5" />}
                  </button>
                ) : (
                  !isHidden && (
                    <button style={{ pointerEvents: 'auto' }} onClick={(e) => { e.stopPropagation(); setReportingPostId(currentPostData.id); }} className="p-2 text-white/80 rounded-full hover:bg-black/40 hover:text-white">
                        <EllipsisVerticalIcon className="w-6 h-6 shadow-sm drop-shadow-md" />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Conteúdo/Legenda */}
            {currentPostData.content && !isHidden && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 pt-24 pb-4 px-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
                <p className="text-sm text-white drop-shadow-sm">{currentPostData.content}</p>
              </div>
            )}

            {/* Botões Laterais */}
            {!isHidden && (
                <div className="absolute right-4 bottom-[calc(4rem+1rem)] flex flex-col space-y-5 items-center z-20">
                {!isOwner && (
                    <button style={{ pointerEvents: 'auto' }} onClick={handleConnectClick} disabled={isConnectLoading} className={`text-white flex flex-col items-center p-2 rounded-full bg-black/40 backdrop-blur-sm disabled:opacity-50 ${isConnectLoading ? 'opacity-50' : ''} ${isAlreadyFollowing ? 'hover:text-gray-400' : 'hover:text-indigo-400'}`}>
                    {isAlreadyFollowing ? <UserMinusIcon className="h-7 w-7 text-gray-400" /> : <UserPlusIcon className="h-7 w-7" />}
                    </button>
                )}
                
                <button 
                    style={{ pointerEvents: 'auto' }} 
                    onClick={handleLikeToggle} 
                    disabled={isActionLoading} 
                    className={`text-white flex flex-col items-center p-2 rounded-full bg-black/40 backdrop-blur-sm disabled:opacity-50 transition-colors duration-200 ${!currentPostData.isLikedByMe ? 'hover:text-red-400' : ''}`}
                >
                    {currentPostData.isLikedByMe ? (
                        <HeartIconSolid className="h-7 w-7 text-red-500 transform scale-110" />
                    ) : (
                        <HeartIconOutline className="h-7 w-7" />
                    )}
                    <span className="text-xs font-semibold mt-1">{currentPostData.likesCount || 0}</span>
                </button>

                <button style={{ pointerEvents: 'auto' }} onClick={handleCommentClick} className="text-white flex flex-col items-center p-2 rounded-full bg-black/40 backdrop-blur-sm hover:text-blue-400">
                    <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7" />
                    <span className="text-xs font-semibold mt-1">{currentPostData.commentsCount || 0}</span>
                </button>
                <button style={{ pointerEvents: 'auto' }} onClick={handleShare} className="text-white flex flex-col items-center p-2 rounded-full bg-black/40 backdrop-blur-sm hover:text-green-400">
                    <ShareIcon className="h-7 w-7" />
                    <span className="text-xs font-semibold mt-1">Share</span>
                </button>
                </div>
            )}
          </motion.div>
        </AnimatePresence>

        <PersonalDayCard />
      </div>

      <AnimatePresence>
        {viewingCommentsForPostId && currentDeckData && (
          <FeedCommentSheet
            postId={viewingCommentsForPostId}
            authorId={currentDeckData.author.id}
            onClose={() => setViewingCommentsForPostId(null)}
          />
        )}
      </AnimatePresence>

      <ReportPostModal
        isOpen={!!reportingPostId}
        onClose={() => setReportingPostId(null)}
        postId={reportingPostId}
      />
    </div>
  );
}