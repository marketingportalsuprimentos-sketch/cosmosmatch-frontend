// src/features/feed/services/feedApi.ts
// (COLE ISTO NO SEU ARQUIVO)

import { api } from '@/services/api';

export enum MediaType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
}

// --- INÍCIO DA ATUALIZAÇÃO ---
export interface FeedPost {
  id: string;
  content: string | null;
  imageUrl: string;
  mediaType: MediaType;
  videoDuration: number | null;
  createdAt: string;
  expiresAt: string;
  authorId: string;
  
  // Novos campos do backend (baseados no schema.prisma e no 'post.service.ts')
  likesCount: number;
  commentsCount: number;
  
  // Campo de estado (calculado no 'post.service.ts')
  isLikedByMe: boolean; 
  
  // Campos antigos removidos
  // userHasLiked: boolean; // REMOVIDO
  // _count: { likes: number; comments: number }; // REMOVIDO
}
// --- FIM DA ATUALIZAÇÃO ---

export interface CreatedPost {
  id: string;
  content: string | null;
  imageUrl: string;
  mediaType: MediaType;
  videoDuration: number | null;
  expiresAt: string;
  authorId: string;
}

export interface FeedDeck {
  author: { id: string; name: string; profile?: { imageUrl?: string | null } };
  posts: FeedPost[];
}

// --- INÍCIO DA ADIÇÃO (Post Público) ---
// O tipo do post público que inclui os dados do autor
export interface PublicPost extends FeedPost {
  author: {
    id: string;
    name: string;
    profile: {
      imageUrl: string | null;
    } | null;
  };
}
// --- FIM DA ADIÇÃO ---


export interface PostComment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
  user: { id: string; name: string; profile?: { imageUrl?: string | null } };
}

interface CreateCommentData { content: string; }

export const getFeedPage = async (pageParam = 1): Promise<FeedDeck | null> => {
  try {
    const { data } = await api.get<FeedDeck | null>(`/post/feed?page=${pageParam}`);
    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

export const createPost = async (formData: FormData): Promise<CreatedPost> => {
  // NÃO definir headers aqui — o Axios monta boundary automaticamente.
  const { data } = await api.post<CreatedPost>('/post', formData);
  return data;
};

export const likePost = async (postId: string) => {
  const { data } = await api.post<{ success: boolean }>(`/post/${postId}/like`);
  return data;
};

export const unlikePost = async (postId: string) => {
  const { data } = await api.delete<{ success: boolean }>(`/post/${postId}/like`);
  return data;
};

export const commentOnPost = async (postId: string, payload: CreateCommentData) => {
  const { data } = await api.post<PostComment>(`/post/${postId}/comment`, payload);
  return data;
};

export const getPostComments = async (postId: string) => {
  const { data } = await api.get<PostComment[]>(`/post/${postId}/comments`);
  return data;
};

// --- INÍCIO DA ADIÇÃO (Post Público) ---
/**
 * Busca um único post pelo ID. (Endpoint público)
 */
export const getPostById = async (postId: string): Promise<PublicPost> => {
  const { data } = await api.get<PublicPost>(`/post/${postId}`);
  return data;
};
// --- FIM DA ADIÇÃO ---

// --- INÍCIO DA ADIÇÃO (Apagar Post) ---
/**
 * Apaga um post (apenas o dono).
 */
export const deletePost = async (
  postId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/post/${postId}`);
  return response.data;
};
// --- FIM DA ADIÇÃO ---