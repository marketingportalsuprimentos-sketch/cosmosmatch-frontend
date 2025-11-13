// src/features/payment/hooks/usePaymentMutations.ts

import { useMutation } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import * as paymentApi from '../services/paymentApi';
import { AxiosError } from 'axios';

/**
 * Hook para criar uma nova subscrição.
 * Quando chamado, ele lida com a lógica de redirecionamento.
 */
export const useCreateSubscription = () => {
  return useMutation({
    mutationFn: paymentApi.createSubscription,

    onSuccess: (data) => {
      // Sucesso! O backend devolveu a URL do Asaas.
      const { checkoutUrl } = data;
      
      if (checkoutUrl) {
        toast.success('A redirecionar para o checkout...');
        // Redireciona o utilizador para o site do Asaas
        window.location.href = checkoutUrl;
      } else {
        toast.error('Não foi possível obter a URL de pagamento.');
      }
    },

    onError: (err: AxiosError | Error) => {
      // 'any' para acesso fácil
      const error = err as any;
      
      // Se o backend devolver um erro (ex: "Utilizador já é premium")
      const message = error?.response?.data?.message || 
                      'Erro ao iniciar o processo de pagamento.';
      
      console.error('Erro ao criar subscrição:', message);
      toast.error(message);
    },
  });
};