// src/features/discovery/services/discoveryApi.ts
// (COLE ESTA VERSÃO CORRETA)

import { api } from '@/services/api';

export type DiscoveryProfile = {
  userId: string;
  name: string; 
  profile: {
    imageUrl: string | null;
    currentCity: string | null;
    age: number;
    sunSign: string | null;
  };
  compatibility: {
    score: number;
  };
};

type LocationFilter = { lat: number; lng: number } | null;


// --- INÍCIO DA CORREÇÃO (Erro 400) ---

export async function getDiscoveryQueue(locationFilter: LocationFilter) {
  
  // 1. Se locationFilter existir, 'params' será { lat, lng }.
  //    Se locationFilter for nulo, 'params' será 'undefined'.
  const params = locationFilter 
    ? { lat: locationFilter.lat, lng: locationFilter.lng }
    : undefined;

  // 2. Passamos a URL base ('/discovery') e o objeto 'params'.
  //
  //    O Axios agora fará o correto:
  //    - Se 'params' for undefined, chama: /discovery (SEM O "?")
  //    - Se 'params' tiver dados, chama: /discovery?lat=...&lng=...
  const { data } = await api.get<DiscoveryProfile[]>(
    '/discovery', 
    { params: params } // <-- ESTA É A FORMA CORRETA
  );
  
  return data;
}
// --- FIM DA CORREÇÃO ---


// ---- Ações de descoberta (Sem alterações) ----

export type LikeResponse = {
  matched: boolean;
  matchId?: string;
};

export async function likeProfile(targetUserId: string) {
  const { data } = await api.post<LikeResponse>(
    `/discovery/like/${targetUserId}`
  );
  return data;
}

export async function sendIcebreaker(targetUserId: string, content: string) {
  const { data } = await api.post<{ matched: boolean }>(
    `/discovery/icebreaker/${targetUserId}`, 
    {
      content: content,
    }
  );
  return data;
}