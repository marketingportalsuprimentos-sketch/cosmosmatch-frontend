// src/features/payment/services/paymentApi.ts

import { api } from '@/services/api';

/**
 * Resposta esperada do backend (da rota POST /payment/subscribe)
 */
interface SubscriptionResponse {
  checkoutUrl: string;
}

/**
 * Chama o backend para criar uma nova subscrição no Asaas
 * e obter a URL de checkout.
 */
export const createSubscription = async (): Promise<SubscriptionResponse> => {
  const { data } = await api.post<SubscriptionResponse>('/payment/subscribe');
  return data;
};