// frontend/src/features/auth/services/authApi.ts
// (COLE ISTO NO SEU ARQUIVO)

import { api } from '@/services/api';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthResponse, // Este 'AuthResponse' agora está correto (porque auth.types.ts foi corrigido)
} from '@/types/auth.types';

// --- INÍCIO DA ADIÇÃO (Tipagem para a nova rota) ---
// Este DTO corresponde ao que o backend espera
export interface UpdateUnverifiedEmailDto {
  newEmail: string;
  password: string;
}
// --- FIM DA ADIÇÃO ---

export const login = async (credentials: LoginDto): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
};

export const register = async (
  credentials: RegisterDto,
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/register', credentials);
  return data;
};

export const forgotPassword = async (payload: ForgotPasswordDto) => {
  const { data } = await api.post('/auth/forgot-password', payload);
  return data;
};

export const resetPassword = async (payload: ResetPasswordDto) => {
  const { data } = await api.post('/auth/reset-password', payload);
  return data;
};

/**
 * Envia o token de verificação (do link do email) para o backend
 */
export const verifyEmail = async (token: string): Promise<AuthResponse> => {
  const { data } = await api.get<AuthResponse>('/auth/verify-email', {
    params: { token }, // Envia como ?token=...
  });
  return data;
};

/**
 * Pede ao backend para reenviar o email de verificação
 */
export const resendVerificationEmail = async (): Promise<{ message: string }> => {
  // Apenas chama a rota POST. O token de autorização é adicionado
  // automaticamente pelo interceptor do 'api.ts'.
  
  // --- INÍCIO DA CORREÇÃO (Erro 404) ---
  // A rota foi atualizada para corresponder ao backend
  const { data } = await api.post<{ message: string }>(
    '/auth/resend-verification-email', 
  );
  // --- FIM DA CORREÇÃO ---

  return data;
};

/**
 * Pede ao backend para ATUALIZAR o email não verificado
 */
export const updateUnverifiedEmail = async (
  payload: UpdateUnverifiedEmailDto,
): Promise<{ message: string }> => {
  // Chama a nova rota PATCH que criámos
  const { data } = await api.patch<{ message: string }>(
    '/auth/update-unverified-email',
    payload,
  );
  return data;
};