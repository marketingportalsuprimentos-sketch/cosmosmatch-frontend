// src/features/social/hooks/useSocialQueries.ts
import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../services/socialApi';
import { UserSearchResult } from '@/types/social.types';

/**
 * Hook do React Query para pesquisar usuários.
 * @param query O termo de busca (já "debounced").
 */
export const useSearchUsers = (query: string) => {
  return useQuery<UserSearchResult[], Error>({
    queryKey: ['searchUsers', query],
    queryFn: () => searchUsers(query),
    // Só ativa a busca se a query tiver 2+ caracteres
    enabled: !!query && query.length > 1,
    // Mantém os dados frescos por 1 minuto
    staleTime: 60000,
  });
};