// src/services/api.ts
// (COLE ISTO NO SEU ARQUIVO)

import axios, { AxiosError } from 'axios';
// Importamos o router que foi exportado do seu index.tsx
import { router } from '@/router';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  withCredentials: true,
});

// Interceptor de REQUEST
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cosmosmatch_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 402) {
      const errorData = error.response.data as { message: string };
      console.warn('PAYWALL INTERCEPTOR: Limite atingido. Redirecionando...', errorData.message);
      
      router.navigate('/premium');
    }
    // --- INÍCIO DA CORREÇÃO (O "Beco sem Saída") ---
    else if (error.response?.status === 403) {
      const errorData = error.response.data as { message: string };
      // Esta é a mensagem exata que o nosso 'jwt-auth.guard.ts' envia
      const verificationMessage = 'Por favor, verifique o seu email para continuar a usar a aplicação.';
      
      // 1. Verificamos se o URL do pedido é um dos URLs de "correção".
      // (Tive de adivinhar os URLs com base nos nomes dos hooks, 
      // ajuste se o seu 'authApi.ts' usar URLs diferentes)
      const isVerificationFixUrl = 
        error.config?.url?.endsWith('/auth/resend-verification-email') ||
        error.config?.url?.endsWith('/auth/update-unverified-email');

      // 2. SÓ redirecionamos se a mensagem for a correta E
      //    NÃO for um dos URLs de correção.
      if (errorData.message === verificationMessage && !isVerificationFixUrl) {
        console.warn('VERIFICATION INTERCEPTOR: Email não verificado e período de tolerância expirado. Redirecionando...');
        // Redireciona para a nova página que vamos criar
        router.navigate('/please-verify');
      }
    }
    // --- FIM DA CORREÇÃO ---
    return Promise.reject(error);
  },
);