// src/services/api.ts

import axios, { AxiosError } from 'axios';
// --- INÍCIO DA ADIÇÃO ---
// Importamos o router que foi exportado do seu index.tsx
import { router } from '@/router';
// --- FIM DA ADIÇÃO ---

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

// --- INÍCIO DA ATUALIZAÇÃO (Lógica do Paywall) ---

// A interface e a função triggerPaywallEvent são REMOVIDAS
// interface PaywallErrorData { ... }
// const triggerPaywallEvent = (data: PaywallErrorData) => { ... };

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 402) {
      const errorData = error.response.data as { message: string };
      console.warn('PAYWALL INTERCEPTOR: Limite atingido. Redirecionando...', errorData.message);
      
      // Em vez de disparar um evento, navegamos DIRETAMENTE para a página Premium.
      router.navigate('/premium');
    }
    // --- INÍCIO DA ADIÇÃO (Fase 3: Período de Tolerância) ---
    else if (error.response?.status === 403) {
      const errorData = error.response.data as { message: string };
      // Esta é a mensagem exata que o nosso 'jwt-auth.guard.ts' envia
      const verificationMessage = 'Por favor, verifique o seu email para continuar a usar a aplicação.';
      
      if (errorData.message === verificationMessage) {
        console.warn('VERIFICATION INTERCEPTOR: Email não verificado e período de tolerância expirado. Redirecionando...');
        // Redireciona para uma nova página que vamos criar
        router.navigate('/please-verify');
      }
    }
    // --- FIM DA ADIÇÃO ---
    return Promise.reject(error);
  },
);
// --- FIM DA ATUALIZAÇÃO ---