// src/features/feed/hooks/useFeed.ts
// (COLE ISTO NO SEU ARQUIVO)

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
  type InfiniteData,
} from '@tanstack/react-query';
import * as feedApi from '../services/feedApi';
import type { FeedDeck } from '../services/feedApi'; 
// --- INÍCIO DA ADIÇÃO ---
import { toast } from '@/lib/toast'; // Importar o toast para erros
// --- FIM DA ADIÇÃO ---


/**
 * Hook para buscar o Feed de forma infinita (scroll vertical).
 */
export const useGetFeed = () => {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => feedApi.getFeedPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage ? allPages.length + 1 : undefined;
    },
  });
};

/**
 * Hook para criar um novo post.
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => feedApi.createPost(formData),
    onSuccess: (newPost) => {
      console.log('Novo post criado:', newPost);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error) => {
      console.error('Erro ao criar post:', error);
      toast.error('Não foi possível criar o post.'); // Adicionado feedback
    },
  });
};

/**
 * Hook para dar Like num post.
 */
export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => feedApi.likePost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousFeed = queryClient.getQueryData<
        InfiniteData<FeedDeck | null>
      >(['feed']);
      queryClient.setQueryData<InfiniteData<FeedDeck | null>>(
        ['feed'],
        (oldFeed) => {
          if (!oldFeed) return oldFeed;
          return {
            ...oldFeed,
            pages: oldFeed.pages.map((page) => {
              if (!page) return page;
              return {
                ...page,
                posts: page.posts.map((post) => {
                  if (post.id === postId) {
                    return {
                      ...post,
                      isLikedByMe: true,
                      likesCount: post.likesCount + 1,
                    };
                  }
                  return post;
                }),
              };
            }),
          };
        },
      );
      return { previousFeed };
    },
    onError: (err, postId, context) => {
      console.error(`Erro ao dar like no post ${postId}:`, err);
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
      toast.error('Erro ao curtir o post.'); // Adicionado feedback
    },
    onSettled: (data, error, postId) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

/**
 * Hook para remover o Like de um post.
 */
export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => feedApi.unlikePost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousFeed = queryClient.getQueryData<
        InfiniteData<FeedDeck | null>
      >(['feed']);
      queryClient.setQueryData<InfiniteData<FeedDeck | null>>(
        ['feed'],
        (oldFeed) => {
          if (!oldFeed) return oldFeed;
          return {
            ...oldFeed,
            pages: oldFeed.pages.map((page) => {
              if (!page) return page;
              return {
                ...page,
                posts: page.posts.map((post) => {
                  if (post.id === postId) {
                    return {
                      ...post,
                      isLikedByMe: false,
                      likesCount: Math.max(0, post.likesCount - 1),
                    };
                  }
                  return post;
                }),
              };
            }),
          };
        },
      );
      return { previousFeed };
    },
    onError: (err, postId, context) => {
      console.error(`Erro ao remover like do post ${postId}:`, err);
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
      toast.error('Erro ao remover o like.'); // Adicionado feedback
    },
    onSettled: (data, error, postId) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};


/**
 * Hook para comentar num post.
 */
export const useCommentOnPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      feedApi.commentOnPost(postId, { content }),
    onSuccess: (newComment, variables) => {
      console.log(`Comentário adicionado ao post ${variables.postId}:`, newComment);
      queryClient.invalidateQueries({ queryKey: ['postComments', variables.postId] });
      
      queryClient.setQueryData<InfiniteData<FeedDeck | null>>(
        ['feed'],
        (oldFeed) => {
           if (!oldFeed) return oldFeed;
            return {
              ...oldFeed,
              pages: oldFeed.pages.map(page => {
                if (!page) return page;
                return {
                  ...page,
                  posts: page.posts.map(post => {
                    if (post.id === variables.postId) {
                      return {
                        ...post,
                        commentsCount: post.commentsCount + 1,
                      };
                    }
                    return post;
                  }),
                };
              }),
            };
        }
      );
    },
    // --- INÍCIO DA ATUALIZAÇÃO (Correção do Bug) ---
    onError: (error: any, variables) => { // 'any' para podermos ler 'response'
      // 1. Se for o erro 402 (Paywall), NÃO FAÇA NADA.
      // O interceptor global (api.ts) vai apanhar e o AppLayout vai mostrar o modal.
      if (error?.response?.status === 402) {
        return; // Sai da função e não mostra o toast de erro.
      }
      
      // 2. Para todos os outros erros (500, 404, etc.), mostre o toast genérico.
      console.error(`Erro ao comentar no post ${variables.postId}:`, error);
      toast.error('Não foi possível enviar o seu comentário.');
    },
    // --- FIM DA ATUALIZAÇÃO ---
  });
};

/**
 * Hook para buscar os comentários de um post específico.
 */
export const useGetPostComments = (postId: string | null) => {
  return useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => feedApi.getPostComments(postId!),
    enabled: !!postId,
  });
};

// --- INÍCIO DA ADIÇÃO (Apagar Post) ---

/**
 * Hook para apagar um post.
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // A função 'deletePost' deve ser adicionada ao 'feedApi.ts'
    mutationFn: (postId: string) => feedApi.deletePost(postId),
    onSuccess: (data, postId) => {
      toast.success(data.message || 'Post apagado com sucesso!');
      
      // Invalidar o feed para forçar o refetch e
      // fazer o post "sumir" da UI.
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (error: any, postId) => {
      console.error(`Erro ao apagar o post ${postId}:`, error);
      toast.error(error?.response?.data?.message || 'Não foi possível apagar o post.');
    },
  });
};
// --- FIM DA ADIÇÃO ---