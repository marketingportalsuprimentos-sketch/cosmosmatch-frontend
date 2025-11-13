// src/features/discovery/hooks/useDiscoveryQueue.ts
// (COLE ISTO NO SEU ARQUIVO)

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDiscoveryQueue } from '@/features/discovery/services/discoveryApi';
import type { DiscoveryProfile } from '@/features/discovery/services/discoveryApi';
import { useGetMyProfile } from '@/features/profile/hooks/useProfile';

const REFETCH_THRESHOLD = 5;

type LocationFilter = { lat: number; lng: number } | null;

type Profile = {
  user?: { name?: string | null };
  birthDate?: string | null;
  gender?: string | null;
  photos?: { url: string }[];
  birthTime?: string | null;
  birthCity?: string | null;
  imageUrl?: string | null; 
};

function isComplete(p?: Profile | null): p is Profile {
  // (Função sem alterações)
  if (!p) return false;
  const okName = !!p.user?.name;
  const okGender = !!p.gender;
  const okPhoto = !!p.imageUrl; 
  const okBirthDate = !!p.birthDate;
  const okBirthTime = !!p.birthTime;
  const okBirthCity = !!p.birthCity;
  return okName && okGender && okPhoto && okBirthDate && okBirthTime && okBirthCity;
}


export function useDiscoveryQueue({ locationFilter }: { locationFilter: LocationFilter }) {
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<DiscoveryProfile[]>([]);
  const [requiresProfile, setRequiresProfile] = useState(false);

  // Perfil do usuário (Sem alterações)
  const profileQ = useGetMyProfile();

  // useEffect para checar o perfil (Sem alterações)
  useEffect(() => {
    if (!profileQ.isLoading && profileQ.data) {
      if (!isComplete(profileQ.data)) {
        console.warn('useDiscoveryQueue: Perfil detectado como incompleto.');
        setRequiresProfile(true);
      } else {
        console.log('useDiscoveryQueue: Perfil detectado como completo.');
        setRequiresProfile(false);
      }
    } else if (!profileQ.isLoading && !profileQ.data) {
      console.warn('useDiscoveryQueue: Perfil não encontrado após carregar.');
      setRequiresProfile(true);
    }
  }, [profileQ.data, profileQ.isLoading]);


  // Discovery – só busca se perfil completo
  const discoveryQ = useQuery<DiscoveryProfile[]>({
    queryKey: ['discoveryQueue', locationFilter],
    
    queryFn: async () => {
      // (Esta função está correta, sem alterações)
      try {
        return await getDiscoveryQueue(locationFilter);
      } catch (err: any) {
        const status = err?.response?.status;
        const msg = (err?.response?.data?.message ?? '').toString().toLowerCase();
        
        if (status === 400 && msg.includes('incomplete profile')) {
          setRequiresProfile(true);
          queryClient.setQueryData(['discoveryQueue', locationFilter], []);
          const e = new Error('INCOMPLETE_PROFILE') as any;
          e.code = 'INCOMPLETE_PROFILE';
          throw e;
        }
        throw err;
      }
    },
    enabled: isComplete(profileQ.data),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // --- INÍCIO DA CORREÇÃO (Bug da Fila) ---
  /**
   * Efeito 1: Limpar a fila
   * Quando o 'locationFilter' mudar, a fila local (queue)
   * DEVE ser limpa. Isto força o Efeito 2 (abaixo) a
   * construir uma fila nova, em vez de adicionar à antiga.
   */
  useEffect(() => {
    console.log('Filtro de localização mudou, limpando fila...');
    setQueue([]);
  }, [locationFilter]);
  // --- FIM DA CORREÇÃO ---


  /**
   * Efeito 2: Preencher a fila
   * Este efeito preenche a fila quando novos dados
   * chegam do 'discoveryQ' (a busca da API).
   */
  useEffect(() => {
    const fetched = discoveryQ.data ?? [];
    if (fetched.length > 0) {
      setQueue((prev) => {
        // Se 'prev' foi limpo (pelo Efeito 1),
        // isto irá simplesmente construir a nova fila.
        const ids = new Set(prev.map((p) => p.userId));
        const fresh = fetched.filter((p) => !ids.has(p.userId));
        return [...prev, ...fresh];
      });
      // Limpa os dados da query para evitar re-mesclagem
      queryClient.setQueryData(['discoveryQueue', locationFilter], undefined);
    }
  }, [discoveryQ.data, queryClient, locationFilter]); 

  // Consumir atual e reabastecer (Sem alterações)
  const removeCurrentProfile = () => {
    setQueue((prev) => {
      const next = prev.slice(1);
      if (next.length < REFETCH_THRESHOLD && !discoveryQ.isFetching && discoveryQ.isSuccess) {
        discoveryQ.refetch();
      }
      return next;
    });
  };

  const currentProfile = queue.length > 0 ? queue[0] : null;
  const isQueueEmpty = queue.length === 0;

  // Lógica de Loading/Error (Sem alterações)
  const isLoading = profileQ.isLoading || discoveryQ.isLoading;
  const isError =
    profileQ.isError ||
    (discoveryQ.isError && (discoveryQ.error as any)?.code !== 'INCOMPLETE_PROFILE');
  const error =
    (profileQ.error as any) || (discoveryQ.error as any) || null;

  return useMemo(
    () => ({
      currentProfile,
      isQueueEmpty,
      removeCurrentProfile,
      isFetching: discoveryQ.isFetching,
      isLoading,
      isError,
      error,
      requiresProfile,
      refetchQueue: discoveryQ.refetch,
    }),
    [
      currentProfile,
      isQueueEmpty,
      discoveryQ.isFetching,
      isLoading,
      isError,
      error,
      requiresProfile,
    ]
  );
}