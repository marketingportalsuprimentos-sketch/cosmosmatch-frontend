// frontend/src/features/profile/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';
import * as profileApi from '../services/profileApi';
import type {
  Profile,
  UpdateProfileDto,
  ProfilePhoto,
  ProfilePhotoComment,
  ProfilePhotoLike,
  CreateProfilePhotoCommentDto,
  BasicUserInfo,
  PowerAspect, // <-- ADICIONADO
} from '@/types/profile.types';
import { useAuth } from '@/contexts/AuthContext';
// --- INÍCIO DA ADIÇÃO (Paywall) ---
import { toast } from '@/lib/toast'; // Importar o toast
// --- FIM DA ADIÇÃO ---

// --- INÍCIO DA ALTERAÇÃO (Gamificação / Cartas de Poder) ---
// Tipo para os dados do Mapa Astral (espelha o retorno do backend)
export interface NatalChartData {
  natalChart: Profile['natalChart'];
  numerologyMap: Profile['numerologyMap'];
  powerAspects: PowerAspect[] | null; // <-- ESTA LINHA CORRIGE O BUILD
}
// --- FIM DA ALTERAÇÃO ---


// --- Hook: GET my profile ---
export const useGetMyProfile = () => {
  return useQuery<Profile, Error>({
    queryKey: ['myProfile'],
    queryFn: profileApi.getMyProfile,
  });
};

// --- INÍCIO DA ADIÇÃO (Ideia 3: Vibração do Dia) ---
/**
 * Hook para buscar o número do dia pessoal (para o card no feed).
 */
export const useGetPersonalDayVibration = () => {
  return useQuery<{ dayNumber: number }, Error>({
    queryKey: ['personalDayVibration'],
    queryFn: profileApi.getPersonalDayVibration,
    staleTime: 1000 * 60 * 15, // Cache de 15 minutos
    refetchOnWindowFocus: false, // Não precisa re-buscar a cada foco
  });
};
// --- FIM DA ADIÇÃO ---


// --- Hook: UPDATE profile ---
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, UpdateProfileDto>({
    mutationFn: profileApi.updateProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['myProfile'], updatedProfile);
      console.log('Hook useUpdateProfile: Perfil atualizado no cache:', updatedProfile);
      // --- ADIÇÃO ---
      // Invalida o cache do mapa astral, pois os dados (cartas) mudaram
      queryClient.invalidateQueries({ queryKey: ['myNatalChart'] });
      // --- FIM DA ADIÇÃO ---
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil (useUpdateProfile):', error);
      toast.error('Erro ao atualizar o perfil.'); // Adicionado feedback
    }
  });
};

// --- Hook: UPDATE avatar (COM COMPRESSÃO) ---
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, File>({
    mutationFn: async (imageFile: File) => {
      // ... (lógica de compressão)
      console.log(
        `Compressão do AVATAR iniciada... Tamanho original: ${(
          imageFile.size / 1024 / 1024
        ).toFixed(2)} MB`
      );
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true };
      try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log(
          `Compressão do AVATAR concluída. Tamanho novo: ${(
            compressedFile.size / 1024 / 1024
          ).toFixed(2)} MB`
        );
        const baseName = imageFile.name.replace(/\.[^/.]+$/, "");
        const safeFileName = `${baseName}.png`;
        return profileApi.updateAvatar(compressedFile, safeFileName);
      } catch (error) {
        console.error('Erro ao comprimir o avatar:', error);
        throw error;
      }
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['myProfile'], updatedProfile);
      console.log('Hook useUpdateAvatar: Avatar atualizado no cache:', updatedProfile);
    },
    onError: (error) => {
      console.error('Erro ao atualizar avatar (useUpdateAvatar):', error);
      toast.error('Erro ao enviar o avatar.'); // Adicionado feedback
    }
  });
};

// --- Hook: GET public profile ---
export const useGetPublicProfile = (userId: string | undefined) => {
  return useQuery<Profile & { compatibility: any | null }, Error>({
    queryKey: ['publicProfile', userId],
    queryFn: () => profileApi.getPublicProfile(userId!),
    enabled: !!userId,
  });
};

// --- INÍCIO DA ADIÇÃO (Gamificação) ---
/**
 * Hook para buscar os dados do Mapa Astral pelo endpoint seguro.
 */
export const useGetMyNatalChart = () => {
  // O tipo de retorno <NatalChartData> agora está correto
  return useQuery<NatalChartData, Error>({
    queryKey: ['myNatalChart'],
    queryFn: profileApi.getMyNatalChart,
    staleTime: 1000 * 60 * 60, // Fica em cache por 1 hora
  });
};
// --- FIM DA ADIÇÃO ---


// --- Hook: GET gallery photos ---
export const useGetGalleryPhotos = (targetUserId?: string) => {
  const { user: loggedInUser } = useAuth();
  const userIdToFetch = targetUserId ?? loggedInUser?.id;
  const queryKey = ['galleryPhotos', userIdToFetch];

  return useQuery<ProfilePhoto[], Error>({
    queryKey: queryKey,
    queryFn: () => profileApi.getGalleryPhotos(userIdToFetch!),
    enabled: !!userIdToFetch,
    staleTime: 1000 * 60,
  });
};


// --- Hook: ADD photo to gallery (COM COMPRESSÃO) ---
export const useAddPhotoToGallery = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const loggedInUserId = user?.id;

  return useMutation<ProfilePhoto, Error, File>({
    mutationFn: async (imageFile: File) => {
      // ... (lógica de compressão)
      console.log(
        `Compressão da FOTO DE GALERIA iniciada... Tamanho original: ${(
          imageFile.size / 1024 / 1024
        ).toFixed(2)} MB`
      );
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log(
          `Compressão da FOTO DE GALERIA concluída. Tamanho novo: ${(
            compressedFile.size / 1024 / 1024
          ).toFixed(2)} MB`
        );
        const baseName = imageFile.name.replace(/\.[^/.]+$/, "");
        const safeFileName = `${baseName}.png`;
        return profileApi.addPhotoToGallery(compressedFile, safeFileName);
      } catch (error) {
        console.error('Erro ao comprimir a foto da galeria:', error);
        throw error;
      }
    },
    onSuccess: (_newPhoto) => {
      console.log('Foto adicionada com sucesso. Invalidando query da galeria do utilizador logado.');
      queryClient.invalidateQueries({ queryKey: ['galleryPhotos', loggedInUserId] });
    },
    onError: (error) => {
      console.error('Erro ao adicionar foto à galeria:', error);
      toast.error('Erro ao enviar a foto.'); // Adicionado feedback
    }
  });
};

// --- Hook: DELETE photo from gallery (com Otimistic Update) ---
interface DeletePhotoContext {
  previousPhotos?: ProfilePhoto[];
}
export const useDeletePhotoFromGallery = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const loggedInUserId = user?.id;

  return useMutation<void, Error, string, DeletePhotoContext>({
    mutationFn: profileApi.deletePhotoFromGallery,
    onMutate: async (photoIdToDelete) => {
       // ... (lógica de optimistic update)
       await queryClient.cancelQueries({ queryKey: ['galleryPhotos', loggedInUserId] });
       const previousPhotos = queryClient.getQueryData<ProfilePhoto[]>(['galleryPhotos', loggedInUserId]);
       queryClient.setQueryData<ProfilePhoto[]>(['galleryPhotos', loggedInUserId], (old) =>
         old?.filter((photo) => photo.id !== photoIdToDelete)
       );
       console.log(`Otimistic delete da foto ${photoIdToDelete}.`);
       return { previousPhotos };
    },
    onError: (err, photoId, context) => {
      // ... (lógica de rollback)
      console.error(`Erro ao deletar foto ${photoId} (rollback):`, err);
      toast.error('Erro ao apagar a foto.'); // Adicionado feedback
      if (context?.previousPhotos) {
        queryClient.setQueryData(['galleryPhotos', loggedInUserId], context.previousPhotos);
      }
    },
    onSettled: (_data, _error, photoId, _context) => {
      console.log(`Invalidação da galeria após tentativa de delete da foto ${photoId}.`);
      queryClient.invalidateQueries({ queryKey: ['galleryPhotos', loggedInUserId] });
    },
  });
};

// ... (hooks de like/comment de galeria) ...

// --- INÍCIO DA ADIÇÃO (Hook para Buscar Comentários) ---
/**
 * Hook para buscar os comentários de uma foto específica da galeria.
 */
export const useGetGalleryPhotoComments = (photoId: string | null) => {
  return useQuery<ProfilePhotoComment[], Error>({
    queryKey: ['photoComments', photoId], // A queryKey inclui o photoId
    queryFn: () => profileApi.getGalleryPhotoComments(photoId!), // O '!' assume que só chamaremos quando photoId não for null
    enabled: !!photoId, // Só executa a query se photoId for válido
  });
};
// --- FIM DA ADIÇÃO ---


// --- Hook: COMMENT on gallery photo ---
export const useCommentOnGalleryPhoto = (photoUserId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    ProfilePhotoComment,
    Error,
    CreateProfilePhotoCommentDto & { photoId: string }
  >({
    mutationFn: ({ photoId, content }) =>
      profileApi.commentOnGalleryPhoto(photoId, { content }),
    onSuccess: (newComment, variables) => {
      console.log(`Comentário adicionado à foto ${variables.photoId}.`);
      // Invalida a query dos comentários para forçar o refetch (lista atualizada)
      queryClient.invalidateQueries({ queryKey: ['photoComments', variables.photoId] });
      
      // Atualiza o contador de comentários na galeria (atualização otimista)
      if (photoUserId) {
        queryClient.setQueryData<ProfilePhoto[]>(['galleryPhotos', photoUserId], (oldData) =>
          oldData?.map(photo => 
            photo.id === variables.photoId
              ? { ...photo, commentsCount: (photo.commentsCount ?? 0) + 1 }
              : photo
          )
        );
      }
    },
    // --- INÍCIO DA ATUALIZAÇÃO (Paywall) ---
    onError: (error: any, variables) => { // 'any' para podermos ler 'response'
      // 1. Se for o erro 402 (Paywall), NÃO FAÇA NADA.
      // O interceptor global (api.ts) vai apanhar e o AppLayout vai mostrar o modal.
      if (error?.response?.status === 402) {
        return; // Sai da função e não mostra o toast de erro.
      }
      
      // 2. Para todos os outros erros (500, 404, etc.), mostre o toast genérico.
      console.error(`Erro ao comentar na foto ${variables.photoId}:`, error);
      toast.error('Não foi possível enviar o seu comentário.');
    },
    // --- FIM DA ATUALIZAÇÃO ---
  });
};

// --- Hook: LIKE gallery photo ---
export const useLikeGalleryPhoto = (photoUserId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<ProfilePhotoLike, Error, string>({
    mutationFn: profileApi.likeGalleryPhoto,
    onSuccess: (newLike, photoId) => {
       console.log(`Like processado para foto ${photoId}.`, newLike);
       if (photoUserId) {
         queryClient.invalidateQueries({ queryKey: ['galleryPhotos', photoUserId] });
       }
    },
    onError: (error, photoId) => {
      console.error(`Erro ao processar like da foto ${photoId}:`, error);
      toast.error('Erro ao processar o like.'); // Adicionado feedback
    }
  });
};


// --- Hook: UNLIKE gallery photo ---
export const useUnlikeGalleryPhoto = (photoUserId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: profileApi.unlikeGalleryPhoto,
    onSuccess: (_data, photoId) => {
      console.log(`Unlike processado para foto ${photoId}.`);
       if (photoUserId) {
          queryClient.invalidateQueries({ queryKey: ['galleryPhotos', photoUserId] });
       }
    },
    onError: (error, photoId) => {
      console.error(`Erro ao remover like da foto ${photoId}:`, error);
      toast.error('Erro ao remover o like.'); // Adicionado feedback
    }
  });
};


// --- Hooks de Conexão (Follow) ---

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const loggedInUserId = user?.id;

  return useMutation<void, Error, string>({
    mutationFn: profileApi.followUser,
    onSuccess: (_, userId) => {
      
      // --- INÍCIO DA CORREÇÃO ---
      // Deleta o cache da Discovery para forçar um refetch limpo
      queryClient.removeQueries({ queryKey: ['discoveryQueue'] });
      // --- FIM DA CORREÇÃO ---

      queryClient.invalidateQueries({ queryKey: ['following', loggedInUserId] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] }); // Invalida o perfil para atualizar contagens
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const loggedInUserId = user?.id;

  // --- INÍCIO DA CORREÇÃO DO TYPO ---
  // O 'G' extra foi removido da linha abaixo
  return useMutation<void, Error, string>({
  // --- FIM DA CORREÇÃO DO TYPO ---
    mutationFn: profileApi.unfollowUser,
    onSuccess: (_, userId) => {

      // --- INÍCI
      // Deleta o cache da Discovery para forçar um refetch limpo
      queryClient.removeQueries({ queryKey: ['discoveryQueue'] });
      // --- FIM DA CORREÇÃO ---

      queryClient.invalidateQueries({ queryKey: ['following', loggedInUserId] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] }); // Invalida o perfil para atualizar contagens
    },
  });
};


export const useGetFollowers = (userId: string | undefined) => {
  const { user: loggedInUser } = useAuth();
  const idToFetch = userId === 'me' ? loggedInUser?.id : userId;
  
  return useQuery<BasicUserInfo[], Error>({
    queryKey: ['followers', idToFetch],
    queryFn: () => profileApi.getFollowers(idToFetch!),
    enabled: !!idToFetch,
  });
};

export const useGetFollowing = (
  userId: string | undefined,
  options: { enabled?: boolean } = { enabled: true }
) => {
  const { user: loggedInUser } = useAuth();
  const idToFetch = userId === 'me' ? loggedInUser?.id : userId;
  
  return useQuery<BasicUserInfo[], Error>({
    queryKey: ['following', idToFetch],
    queryFn: () => profileApi.getFollowing(idToFetch!),
    enabled: !!idToFetch && options.enabled,
  });
};

// --- Hooks de Bloqueio ---

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const loggedInUserId = user?.id;

  return useMutation<void, Error, string>({
    mutationFn: profileApi.blockUser,
    onSuccess: (_, userId) => {
      
      // --- INÍC
      // Deleta o cache da Discovery para forçar um refetch limpo
      queryClient.removeQueries({ queryKey: ['discoveryQueue'] });
      // --- FIM DA CORREÇÃO ---

      // Limpa a lista de bloqueados (para a futura página de "bloqueados")
      queryClient.invalidateQueries({ queryKey: ['blockedList'] });

      // Limpa as listas de conexões (para atualizar botões de "seguir", etc.)
      queryClient.invalidateQueries({ queryKey: ['following', loggedInUserId] });
      queryClient.invalidateQueries({ queryKey: ['followers', loggedInUserId] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] }); // Invalida o perfil para atualizar contagens
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: profileApi.unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedList'] });
    },
  });
};

export const useGetMyBlockedList = () => {
  return useQuery<BasicUserInfo[], Error>({
    queryKey: ['blockedList'], 
    queryFn: profileApi.getMyBlockedList,
  });
};

// --- Hooks de Likes (Descoberta) ---

/**
 * Hook de Mutação para dar "like" (Tipo 1) em um usuário.
 */
export const useLikeUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: profileApi.likeUser,
    onSuccess: () => {
      // Remove o perfil da fila de Descoberta
      queryClient.removeQueries({ queryKey: ['discoveryQueue'] });
      
      // Invalida o contador de "não lidos" (do outro usuário)
      // O app do outro usuário irá buscar esta atualização.
      // E invalida o *nosso* contador, caso isso gere um "match".
      queryClient.invalidateQueries({ queryKey: ['unreadLikesCount'] });
    },
    onError: (error) => {
      console.error('Erro ao dar like no usuário:', error);
    },
  });
};

/**
 * Hook de Query para buscar a lista de "Likes Recebidos".
 */
export const useGetLikesReceived = () => {
  return useQuery<BasicUserInfo[], Error>({
    queryKey: ['likesReceived'],
    queryFn: profileApi.getLikesReceived,
  });
};

// --- Hooks de Likes Não Lidos ---

/**
 * Hook de Query para buscar a CONTAGEM de "likes" (Tipo 1) não lidos.
 */
export const useGetUnreadLikesCount = () => {
  return useQuery<{ count: number }, Error>({
    queryKey: ['unreadLikesCount'],
    queryFn: profileApi.getUnreadLikesCount,
  });
};

/**
 * Hook de Mutação para marcar todos os "likes" (Tipo 1) como lidos.
 */
export const useMarkLikesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.markLikesAsRead,
    
    // --- ESTA É A CORREÇÃO ---
    // O 'onSuccess' agora SÓ invalida a query.
    // Ele espera o backend confirmar antes de zerar o contador.
    onSuccess: (data) => {
      console.log(`Marcado(s) ${data.updatedCount} like(s) como lido(s).`);
      // Força a atualização do contador (que deve ir para 0)
      queryClient.invalidateQueries({ queryKey: ['unreadLikesCount'] });
      
      // A linha 'setQueryData' (o bug) foi REMOVIDA.
    },
    // --- FIM DA CORREÇÃO ---
    onError: (error) => {
      console.error('Erro ao marcar likes como lidos:', error);
    }
  });
};