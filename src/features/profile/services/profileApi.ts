// src/features/profile/services/profileApi.ts
import { api } from '@/services/api';
import type {
  Profile,
  UpdateProfileDto,
  CompatibilityResult,
  ProfilePhoto,
  ProfilePhotoLike,
  ProfilePhotoComment,
  CreateProfilePhotoCommentDto,
  BasicUserInfo,
} from '@/types/profile.types';
// --- INÍCIO DA ADIÇÃO (Gamificação) ---
import type { NatalChartData } from '../hooks/useProfile'; // Vamos importar o tipo do hook
// --- FIM DA ADIÇÃO ---


// Função Get My Profile (Corrigida)
export const getMyProfile = async (): Promise<Profile> => {
  const { data } = await api.get<Profile>('/profile/me');
  return data;
};

// --- INÍCIO DA ADIÇÃO (Ideia 3: Vibração do Dia) ---
/**
 * Busca o número do dia pessoal (para o card no feed).
 */
export const getPersonalDayVibration = async (): Promise<{ dayNumber: number }> => {
  const { data } = await api.get<{ dayNumber: number }>(
    '/profile/me/personal-day',
  );
  return data;
};
// --- FIM DA ADIÇÃO ---

// Função Update Profile (Correta)
export const updateProfile = async (
  profileData: UpdateProfileDto
): Promise<Profile> => {
  const { data } = await api.patch<Profile>('/profile', profileData);
  return data;
};

// Função Update Avatar (Corrigida)
export const updateAvatar = async (
  avatarFile: File,
  fileName: string
): Promise<Profile> => {
  const formData = new FormData();
  formData.append('file', avatarFile, fileName);
  const { data } = await api.post<Profile>('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Função Get Public Profile (Correta)
export const getPublicProfile = async (
  userId: string
): Promise<Profile & { compatibility: CompatibilityResult | null }> => {
  const { data } = await api.get<Profile & {
    compatibility: CompatibilityResult | null;
  }>(`/profile/${userId}`);
  return data;
};

// --- CORREÇÃO: Função Get Gallery Photos ---
export const getGalleryPhotos = async (userId: string): Promise<ProfilePhoto[]> => {
  const url = `/profile/${userId}/gallery`;
  const { data } = await api.get<ProfilePhoto[]>(url);
  return data;
};

// Função Add Photo To Gallery (Corrigida)
export const addPhotoToGallery = async (
  photoFile: File,
  fileName: string
): Promise<ProfilePhoto> => {
  const formData = new FormData();
  formData.append('file', photoFile, fileName);
  const { data } = await api.post<ProfilePhoto>('/profile/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// Função Delete Photo From Gallery (Correta)
export const deletePhotoFromGallery = async (photoId: string): Promise<void> => {
  await api.delete(`/profile/gallery/${photoId}`);
};

// Dar like numa foto da galeria (Correta)
export const likeGalleryPhoto = async (
  photoId: string
): Promise<ProfilePhotoLike> => {
  const { data } = await api.post<ProfilePhotoLike>(
    `/profile/gallery/${photoId}/like`
  );
  return data;
};

// Tirar o like de uma foto da galeria (Correta)
export const unlikeGalleryPhoto = async (photoId: string): Promise<void> => {
  await api.delete(`/profile/gallery/${photoId}/like`);
};

// Comentar numa foto da galeria (Correta)
export const commentOnGalleryPhoto = async (
  photoId: string,
  commentData: CreateProfilePhotoCommentDto
): Promise<ProfilePhotoComment> => {
  const { data } = await api.post<ProfilePhotoComment>(
    `/profile/gallery/${photoId}/comment`,
    commentData
  );
  return data;
};

// --- INÍCIO DA ADIÇÃO (Função para Buscar Comentários) ---
/**
 * Busca os comentários de uma foto específica da galeria.
 */
export const getGalleryPhotoComments = async (
  photoId: string
): Promise<ProfilePhotoComment[]> => {
  const { data } = await api.get<ProfilePhotoComment[]>(
    `/profile/gallery/${photoId}/comments`
  );
  return data;
};
// --- FIM DA ADIÇÃO ---


// ----- INÍCIO DA ADIÇÃO (Passo 1.2) -----
// Novas funções para o SocialModule (Block/Follow)

// --- Funções de Conexão (Follow) ---
export const followUser = async (userId: string): Promise<void> => {
  await api.post(`/social/follow/${userId}`);
};

export const unfollowUser = async (userId: string): Promise<void> => {
  await api.delete(`/social/unfollow/${userId}`);
};

export const getFollowers = async (userId: string): Promise<BasicUserInfo[]> => {
  const { data } = await api.get<BasicUserInfo[]>(`/social/${userId}/followers`);
  return data;
};

export const getFollowing = async (userId: string): Promise<BasicUserInfo[]> => {
  const { data } = await api.get<BasicUserInfo[]>(`/social/${userId}/following`);
  return data;
};

// --- Funções de Bloqueio ---
export const blockUser = async (userId: string): Promise<void> => {
  await api.post(`/social/block/${userId}`);
};

export const unblockUser = async (userId: string): Promise<void> => {
  await api.delete(`/social/unblock/${userId}`);
};

export const getMyBlockedList = async (): Promise<BasicUserInfo[]> => {
  const { data } = await api.get<BasicUserInfo[]>('/social/block/list');
  return data;
};
// ----- FIM DA ADIÇÃO -----

// --- Likes da Descoberta ---

/**
 * Dá "like" (Tipo 1) em um usuário.
 */
export const likeUser = async (userId: string): Promise<void> => {
  await api.post(`/social/like/${userId}`);
};

/**
 * Busca a lista de usuários que deram "like" no usuário logado.
 * (Limitado a 200 pelo backend)
 */
export const getLikesReceived = async (): Promise<BasicUserInfo[]> => {
  const { data } = await api.get<BasicUserInfo[]>('/social/likes/received');
  return data;
};

// --- INÍCIO DA ADIÇÃO (Likes Não Lidos) ---

/**
 * Busca a CONTAGEM de "likes" (Tipo 1) não lidos.
 */
export const getUnreadLikesCount = async (): Promise<{ count: number }> => {
  const { data } = await api.get<{ count: number }>('/social/likes/unread-count');
  return data;
};

/**
 * Marca todos os "likes" (Tipo 1) não lidos como lidos.
 */
export const markLikesAsRead = async (): Promise<{ updatedCount: number }> => {
  const { data } = await api.post<{ updatedCount: number }>('/social/likes/mark-as-read');
  return data;
};
// --- FIM DA ADIÇÃO ---

// --- INÍCIO DA ADIÇÃO (Gamificação) ---
/**
 * Busca os dados do Mapa Astral pelo novo endpoint seguro.
 */
export const getMyNatalChart = async (): Promise<NatalChartData> => {
  const { data } = await api.get<NatalChartData>('/astrology/my-natal-chart');
  return data;
};
// --- FIM DA ADIÇÃO ---