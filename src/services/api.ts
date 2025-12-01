// src/services/api.ts
import axios, { AxiosError } from 'axios';

// REMOVIDO: import { router } from '@/router'; 
// (Não precisamos mais importar o router, pois vamos usar window.location)

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

// Interceptor de RESPONSE
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Caso 1: Pagamento Necessário (402) - Paywall
    if (error.response?.status === 402) {
      const errorData = error.response.data as { message: string };
      console.warn('PAYWALL INTERCEPTOR: Limite atingido. Redirecionando...', errorData?.message);
      
      // CORREÇÃO: Redirecionamento nativo
      window.location.href = '/premium';
    }
    // Caso 2: Email não verificado (403)
    else if (error.response?.status === 403) {
      const errorData = error.response.data as { message: string };
      const verificationMessage = 'Por favor, verifique o seu email para continuar a usar a aplicação.';
      
      const isVerificationFixUrl = 
        error.config?.url?.endsWith('/auth/resend-verification-email') ||
        error.config?.url?.endsWith('/auth/update-unverified-email');

      if (errorData?.message === verificationMessage && !isVerificationFixUrl) {
        console.warn('VERIFICATION INTERCEPTOR: Bloqueio de segurança. Redirecionando...');
        
        // CORREÇÃO: Redirecionamento nativo
        window.location.href = '/please-verify';
      }
    }
    
    return Promise.reject(error);
  },
);