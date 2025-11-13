// src/features/social/services/socialApi.ts
import { api } from '@/services/api'; // <-- CORREÇÃO: O caminho mudou de '@/lib/api'
import { UserSearchResult } from '@/types/social.types';

/**
 * Chama o endpoint do backend para pesquisar usuários.
 */
export const searchUsers = async (
  query: string,
): Promise<UserSearchResult[]> => {
  // Se a query for vazia, nem faz a requisição
  if (!query.trim()) {
    return [];
  }

  const { data } = await api.get('/social/search-users', {
    params: { q: query },
  });
  return data;
};