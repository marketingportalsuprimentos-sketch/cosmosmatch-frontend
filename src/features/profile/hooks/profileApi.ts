// src/features/profile/services/profileApi.ts

// --- CORREÇÃO: Usar alias @ para importar api ---
import { api } from '@/services/api'; 
import type {
  Profile, UpdateProfileDto, CompatibilityResult, ProfilePhoto,
  ProfilePhotoLike, ProfilePhotoComment, CreateProfilePhotoCommentDto
} from '@/types/profile.types'; // Corrigido caminho relativo assumindo types na raiz src

// --- CORREÇÃO: Implementação de getMyProfile ativada ---
export const getMyProfile = async (): Promise<Profile> => { 
  const { data } = await api.get<Profile>('/profile'); 
  return data; 
};
// --- FIM DA CORREÇÃO ---

// Função Update Profile (implementação assumida como correta)
export const updateProfile = async (profileData: UpdateProfileDto): Promise<Profile> => { 
  const { data } = await api.patch<Profile>('/profile', profileData); 
  return data; 
};

// Função Update Avatar (implementação assumida como correta)
export const updateAvatar = async (avatarFile: File): Promise<Profile> => { 
  const formData = new FormData(); 
  formData.append('avatarFile', avatarFile, avatarFile.name); 
  const { data } = await api.patch<Profile>('/profile/avatar', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' }, 
  }); 
  return data; 
};

// Função Get Public Profile (implementação assumida como correta)
export const getPublicProfile = async (userId: string): Promise<Profile & { compatibility: CompatibilityResult | null }> => { 
  const { data } = await api.get<Profile & { compatibility: CompatibilityResult | null }>(`/profile/${userId}`); 
  return data; 
};

// Função Get Gallery Photos (implementação assumida como correta)
export const getGalleryPhotos = async (userId?: string): Promise<ProfilePhoto[]> => { 
  let url = '/profile/me/gallery'; 
  if (userId) { url = `/profile/${userId}/gallery`; } 
  const { data } = await api.get<ProfilePhoto[]>(url); 
  return data; 
};

// Função Add Photo To Gallery (implementação assumida como correta)
export const addPhotoToGallery = async (photoFile: File): Promise<ProfilePhoto> => { 
  const formData = new FormData(); 
  formData.append('galleryPhoto', photoFile, photoFile.name); 
  const { data } = await api.post<ProfilePhoto>('/profile/gallery', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' }, 
  }); 
  return data; 
};

// Função Delete Photo From Gallery (implementação assumida como correta)
export const deletePhotoFromGallery = async (photoId: string): Promise<void> => { 
  await api.delete(`/profile/gallery/${photoId}`); 
};

// Dar like numa foto da galeria
export const likeGalleryPhoto = async (photoId: string): Promise<ProfilePhotoLike> => {
  const { data } = await api.post<ProfilePhotoLike>(`/profile/gallery/${photoId}/like`);
  return data;
};

// Tirar o like de uma foto da galeria
export const unlikeGalleryPhoto = async (photoId: string): Promise<void> => {
  await api.delete(`/profile/gallery/${photoId}/like`);
};

// Comentar numa foto da galeria
export const commentOnGalleryPhoto = async (photoId: string, commentData: CreateProfilePhotoCommentDto): Promise<ProfilePhotoComment> => {
  const { data } = await api.post<ProfilePhotoComment>(`/profile/gallery/${photoId}/comment`, commentData);
  return data;
};

// REMOVIDO '}' extra no final