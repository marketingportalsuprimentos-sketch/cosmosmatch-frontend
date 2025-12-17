// frontend/src/features/admin/hooks/useAdminMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../services/adminApi';
import { toast } from '@/lib/toast'; // Usando o seu toast existente

/**
 * Hook para banir um utilizador
 */
export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.banUser(userId),
    onSuccess: () => {
      toast.success('Utilizador banido com sucesso!');
      // Atualiza a lista de usuários automaticamente para refletir o status
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error: any) => {
      console.error(error);
      const msg = error?.response?.data?.message || 'Erro ao banir utilizador.';
      toast.error(msg);
    },
  });
};