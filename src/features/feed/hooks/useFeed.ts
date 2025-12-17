// frontend/src/features/feed/hooks/useFeed.ts

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
  InfiniteData,
} from '@tanstack/react-query';
import * as feedApi from '../services/feedApi';
import { toast } from 'sonner';
import { FeedDeck } from '../services/feedApi';

export const useGetFeed = () => {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = 0 }) => {
      // Chama a função getFeed corrigida passando skip/take
      const data = await feedApi.getFeed({ skip: pageParam, take: 1 });
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.author) {
        return undefined;
      }
      return allPages.length;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => feedApi.createPost(formData),
    onSuccess: () => {
      toast.success('Post criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Não foi possível criar o post.';
      toast.error(msg);
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: feedApi.likePost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedDeck | null>>(['feed']);

      queryClient.setQueryData<InfiniteData<FeedDeck | null>>(['feed'], (old) => {
        if (!old || !old.pages) return old;
        
        const newPages = old.pages.map((deck) => {
          if (!deck) return deck;
          const postExists = deck.posts.some(p => p.id === postId);
          if (!postExists) return deck;

          return {
            ...deck,
            posts: deck.posts.map((post) => {
              if (post.id === postId) {
                return { 
                  ...post, 
                  isLikedByMe: true, 
                  likesCount: post.isLikedByMe ? post.likesCount : post.likesCount + 1 
                };
              }
              return post;
            }),
          };
        });

        return { ...old, pages: newPages };
      });

      return { previousFeed };
    },
    onError: (err, newPost, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
      toast.error('Erro ao curtir.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: feedApi.unlikePost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedDeck | null>>(['feed']);

      queryClient.setQueryData<InfiniteData<FeedDeck | null>>(['feed'], (old) => {
        if (!old || !old.pages) return old;

        const newPages = old.pages.map((deck) => {
          if (!deck) return deck;
          const postExists = deck.posts.some(p => p.id === postId);
          if (!postExists) return deck;

          return {
            ...deck,
            posts: deck.posts.map((post) => {
              if (post.id === postId) {
                return { 
                  ...post, 
                  isLikedByMe: false, 
                  likesCount: Math.max(0, post.isLikedByMe ? post.likesCount - 1 : post.likesCount)
                };
              }
              return post;
            }),
          };
        });

        return { ...old, pages: newPages };
      });
      return { previousFeed };
    },
    onError: (err, newPost, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
      toast.error('Erro ao descurtir.');
    },
    // CORREÇÃO: Removido o ponto e vírgula que causava o erro e adicionado chaves para segurança
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });
};

export const useCommentOnPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      feedApi.commentOnPost(postId, { content }),
    onSuccess: (newComment, variables) => {
      queryClient.invalidateQueries({ queryKey: ['postComments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: any) => {
      if (error?.response?.status === 402) return;
      toast.error('Não foi possível enviar o comentário.');
    },
  });
};

export const useGetPostComments = (postId: string | null) => {
  return useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => feedApi.getPostComments(postId!),
    enabled: !!postId,
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: feedApi.deletePost,
    onSuccess: () => {
      toast.success('Post apagado.');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => toast.error('Erro ao apagar post.'),
  });
};