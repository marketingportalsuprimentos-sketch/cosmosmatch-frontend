// frontend/src/features/admin/hooks/useAdminQueries.ts
import { useQuery } from '@tanstack/react-query';
import * as adminApi from '../services/adminApi';

/**
 * Hook para buscar a lista paginada de utilizadores
 */
export const useGetUsersList = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['admin', 'users', { page, limit }],
    queryFn: () => adminApi.getUsersList(page, limit),
    placeholderData: (previousData) => previousData,
    retry: false, // Não tentar de novo em caso de erro (ex: 403 Forbidden)
  });
};

/**
 * Hook para buscar as estatísticas do dashboard
 */
export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboardStats'],
    queryFn: adminApi.getDashboardStats,
    retry: false,
  });
};

// --- INÍCIO DA ADIÇÃO (Plano do Mapa V2) ---
/**
 * Hook para buscar todas as coordenadas de utilizadores para o mapa
 */
export const useGetUserCoordinates = () => {
  return useQuery({
    queryKey: ['admin', 'coordinates'],
    queryFn: adminApi.getUserCoordinates,
    retry: false,
  });
};
// --- FIM DA ADIÇÃO ---