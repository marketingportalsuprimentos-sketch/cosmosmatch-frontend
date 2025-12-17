// frontend/src/features/auth/hooks/useAuthMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as authApi from '../services/authApi';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  UserProfile,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateUnverifiedEmailDto,
} from '@/types/auth.types';
import type { UseFormSetError } from 'react-hook-form';
import { toast } from '@/lib/toast';
import { api } from '@/services/api';

// --- Tipos Locais para as Mutações ---
interface UpdateEmailVars {
  userId: string;
  data: UpdateUnverifiedEmailDto;
}

// Hook interno para buscar o perfil
const useGetProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.get<UserProfile>('/profile/me').then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['my-profile'], data);
    },
    onError: () => {
      // toast.error('Não foi possível carregar os dados do seu perfil.'); // Opcional, para não spamar erro
    },
  });
};

/**
 * REGISTO
 */
export const useRegister = (options: {
  setError: UseFormSetError<RegisterDto>;
}) => {
  const { setError } = options; 
  const { setUser } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),

    onSuccess: async (data: AuthResponse) => {
      localStorage.setItem('cosmosmatch_token', data.accessToken);
      setUser(data.user);
      // Redireciona sempre para verificar, onde a lógica de 3 dias decide se mostra o botão "Continuar"
      navigate('/please-verify'); 
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao tentar registar.';
      toast.error(message);
      if (message.toLowerCase().includes('utilizador')) {
        setError('username', { type: 'server', message: message });
      } else if (message.toLowerCase().includes('email')) {
        setError('email', { type: 'server', message: message });
      }
    },
  });
};

/**
 * LOGIN
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const getProfileMutation = useGetProfile();

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),

    onSuccess: async (data: AuthResponse) => {
      localStorage.setItem('cosmosmatch_token', data.accessToken);
      setUser(data.user);

      try {
        // Tenta buscar o perfil
        const profile = await getProfileMutation.mutateAsync();
        
        // Se o perfil tem os dados do mapa astral
        const isProfileComplete =
          profile.birthDate &&
          profile.birthTime &&
          profile.birthCity;

        if (isProfileComplete) {
          navigate('/discovery');
        } else {
          // Se não tem mapa astral, manda para onboarding
          navigate('/onboarding');
        }

      } catch (error: any) {
        const status = error.response?.status;
        
        // Se for erro de verificação (403), o axios interceptor ou o Router já devem lidar com isso.
        // Mas se quisermos ser explícitos:
        if (status === 403) {
           navigate('/please-verify');
        } else {
           // Se falhar o perfil por outro motivo, assume que precisa de setup
           navigate('/onboarding');
        }
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Email ou password inválidos.';
      toast.error(message);
    },
  });
};

/**
 * ESQUECI A SENHA
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => authApi.forgotPassword(data),
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao enviar o email.';
      toast.error(message);
    },
  });
};

/**
 * RESETAR A SENHA
 */
export const useResetPassword = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: ResetPasswordDto) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
      navigate('/login');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao alterar a senha.';
      toast.error(message);
    },
  });
};

/**
 * VERIFICAR EMAIL (Link)
 */
export const useVerifyEmail = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const getProfileMutation = useGetProfile(); 

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),

    onSuccess: async (data: AuthResponse) => {
      try {
        localStorage.setItem('cosmosmatch_token', data.accessToken);
        setUser(data.user);
        
        const profile = await getProfileMutation.mutateAsync();
        toast.success('Email verificado com sucesso!');

        const isProfileComplete = profile.birthDate && profile.birthTime && profile.birthCity;

        if (isProfileComplete) {
          navigate('/discovery');
        } else {
          navigate('/onboarding');
        }
      } catch (error) {
        toast.error('Verificado, mas falha ao carregar perfil.');
        navigate('/login');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Token inválido.';
      toast.error(message);
      navigate('/login');
    },
  });
};

/**
 * REENVIAR EMAIL DE VERIFICAÇÃO
 */
export const useResendVerificationEmail = () => {
  return useMutation({
    // Adaptação: Se a sua authApi não aceita ID, usamos api direta ou ajustamos aqui.
    // Assumindo que o Backend é: POST /auth/resend-verification/:userId
    mutationFn: async (userId?: string) => {
       if (userId) {
         await api.post(`/auth/resend-verification/${userId}`);
       } else {
         // Fallback se não tiver ID (talvez use token)
         await authApi.resendVerificationEmail(); 
       }
    },
    onSuccess: () => {
      toast.success('Email de verificação reenviado!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao reenviar o email.';
      toast.error(message);
    },
  });
};

/**
 * ATUALIZAR EMAIL NÃO VERIFICADO (Corrigir email)
 */
export const useUpdateUnverifiedEmail = () => {
  const { user, setUser } = useAuth(); 

  return useMutation({
    // CORREÇÃO: Recebe userId explicitamente para montar a URL correta
    mutationFn: async ({ userId, data }: UpdateEmailVars) => {
      const response = await api.patch(`/auth/unverified-email/${userId}`, data);
      return response.data;
    },

    onSuccess: (data, variables) => {
      toast.success(data.message || 'Email atualizado! Verifique o novo endereço.');
      // Atualiza o contexto localmente para refletir na UI imediatamente
      if (user) {
        setUser({ ...user, email: variables.data.newEmail });
      }
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao atualizar o email.';
      toast.error(message);
    },
  });
};