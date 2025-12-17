// src/features/feed/services/feedApi.ts

import { api } from '@/services/api';

// --- ENUMS ---

export enum MediaType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
}

export enum ReportReason {
  DISLIKE = 'DISLIKE',
  BULLYING = 'BULLYING',
  SELF_HARM = 'SELF_HARM',
  VIOLENCE = 'VIOLENCE',
  RESTRICTED_ITEMS = 'RESTRICTED_ITEMS',
  NUDITY = 'NUDITY',
  SPAM_SCAM = 'SPAM_SCAM',
  FALSE_INFO = 'FALSE_INFO',
}

// --- INTERFACES ---

export interface FeedPost {
  id: string;
  content: string | null;
  imageUrl: string;
  mediaType: MediaType;
  videoDuration: number | null;
  createdAt: string;
  expiresAt: string;
  authorId: string;
  
  // Campos de interação
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean; 

  // --- NOVO CAMPO: Essencial para o efeito Blur ---
  isHidden?: boolean; 
}

export interface FeedDeck {
  author: { 
    id: string; 
    name: string; 
    profile?: { imageUrl?: string | null } 
  };
  posts: FeedPost[];
}

export interface CreatedPost {
  id: string;
  content: string | null;
  imageUrl: string;
  mediaType: MediaType;
  videoDuration: number | null;
  expiresAt: string;
  authorId: string;
}

export interface PostComment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
  user: { id: string; name: string; profile?: { imageUrl?: string | null } };
}

export interface PublicPost extends FeedPost {
  author: {
    id: string;
    name: string;
    profile: { imageUrl: string | null } | null;
  };
}

interface CreateCommentData { content: string; }
interface ReportPostData { reason: ReportReason; }


// --- FUNÇÕES DE API ---

// 1. Feed e Posts
export const getFeed = async (params: { skip: number; take: number }): Promise<FeedDeck | null> => {
  try {
    const { data } = await api.get<FeedDeck | null>('/post/feed', { 
      params: { 
        skip: params.skip, 
        take: params.take 
      } 
    });
    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

export const createPost = async (formData: FormData): Promise<CreatedPost> => {
  const { data } = await api.post<CreatedPost>('/post', formData);
  return data;
};

export const deletePost = async (postId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/post/${postId}`);
  return response.data;
};

export const getPostById = async (postId: string): Promise<PublicPost> => {
  const { data } = await api.get<PublicPost>(`/post/${postId}`);
  return data;
};

// 2. Interações (Like/Comment)
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

// 3. Denúncias e Moderação
export const reportPost = async (postId: string, payload: ReportPostData) => {
  const { data } = await api.post<{ success: boolean }>(`/post/${postId}/report`, payload);
  return data;
};

// --- NOVA FUNÇÃO: Restaurar Post (Para usar no botão do Admin) ---
export const restorePost = async (postId: string) => {
  const { data } = await api.patch<{ success: boolean }>(`/post/${postId}/restore`);
  return data;
};