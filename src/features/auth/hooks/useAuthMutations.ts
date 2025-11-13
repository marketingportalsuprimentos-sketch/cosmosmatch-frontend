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
  UpdateUnverifiedEmailDto, // <-- Isto está correto (vem de auth.types.ts)
} from '@/types/auth.types';
// --- INÍCIO DA ADIÇÃO (Fase 2.1: Erro no Campo) ---
import type { UseFormSetError } from 'react-hook-form';
// --- FIM DA ADIÇÃO ---
import { toast } from '@/lib/toast';
import { api } from '@/services/api';

// Hook interno para buscar o perfil (usado após login/registo)
const useGetProfile = () => {
  // ... (sem alterações)
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.get<UserProfile>('/profile/me').then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['my-profile'], data);
    },
    onError: () => {
      toast.error('Não foi possível carregar os dados do seu perfil.');
    },
  });
};

/**
 * Hook para a mutação de REGISTO
 */
// --- INÍCIO DA ATUALIZAÇÃO (Fase 2.1: Erro no Campo) ---
// 1. O hook agora aceita 'setError' como argumento
export const useRegister = (options: {
  setError: UseFormSetError<RegisterDto>;
}) => {
  const { setError } = options; // <-- Extraímos a função
  // --- FIM DA ATUALIZAÇÃO ---

  const { setUser } = useAuth();
  // const getProfileMutation = useGetProfile(); // <-- Não precisamos mais disto aqui
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),

    onSuccess: async (data: AuthResponse) => {
      console.log('[useRegister] Registo bem-sucedido. A executar onSuccess...');
      try {
        localStorage.setItem('cosmosmatch_token', data.accessToken);
        console.log('[useRegister] Token salvo no localStorage.');

        setUser(data.user);
        console.log('[useRegister] Utilizador definido no AuthContext.');

        // --- INÍCIO DA CORREÇÃO (Fluxo de Verificação) ---
        // Em vez de verificar o perfil e navegar para /discovery ou /profile/edit,
        // vamos SEMPRE navegar para a página de verificação primeiro.
        // A página 'PleaseVerifyPage' é que vai ter o botão "Continuar"
        // que leva o utilizador para o onboarding (/onboarding-profile).

        console.log(
          '[useRegister] Redirecionando para /please-verify (Nova Lógica)',
        );
        navigate('/please-verify'); // <-- ESTA É A CORREÇÃO

        // --- FIM DA CORREÇÃO (Fluxo de Verificação) ---

      } catch (error) {
        console.error('[useRegister] Erro no fluxo de onSuccess:', error);
        toast.error(
          'Registo bem-sucedido, mas falha ao definir o utilizador. Por favor, faça login.',
        );
        navigate('/login');
      }
    },
    // --- INÍCIO DA ATUALIZAÇÃO (Fase 2.1: Erro no Campo) ---
    // 2. O 'onError' agora usa o 'setError'
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erro ao tentar registar.';
      console.error('[useRegister] Erro no registo:', message);

      // 3. Mostra o "popup do windows" (como você gosta)
      toast.error(message);

      // 4. E TAMBÉM define o erro no campo correto do formulário
      if (message.toLowerCase().includes('utilizador')) {
        setError('username', { type: 'server', message: message });
      } else if (message.toLowerCase().includes('email')) {
        setError('email', { type: 'server', message: message });
      }
    },
    // --- FIM DA ATUALIZAÇÃO ---
  });
};

/**
 * Hook para a mutação de LOGIN
 */
export const useLogin = () => {
  // ... (sem alterações)
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const getProfileMutation = useGetProfile();

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: async (data: AuthResponse) => {
      try {
        localStorage.setItem('cosmosmatch_token', data.accessToken);

        console.log('[useLogin] Login bem-sucedido. A buscar perfil completo...');
        const profile = await getProfileMutation.mutateAsync();
        console.log('[useLogin] Perfil encontrado:', profile);

        setUser(data.user);

        const isProfileComplete =
          profile.birthDate &&
          profile.birthTime &&
          profile.birthCity &&
          profile.gender;

        console.log('[useLogin] Verificando perfil para redirecionamento:', {
          birthDate: !!profile.birthDate,
          birthTime: !!profile.birthTime,
          birthCity: !!profile.birthCity,
          gender: !!profile.gender,
        });

        if (isProfileComplete) {
          console.log(
            '[useLogin] Perfil completo. Redirecionando para /discovery',
          );
          navigate('/discovery');
        } else {
          console.log(
            '[useLogin] Perfil incompleto. Redirecionando para /profile/edit',
          );
          navigate('/profile/edit');
        }
      } catch (error) {
        console.error('[useLogin] Erro no fluxo de onSuccess:', error);
        toast.error('Login bem-sucedido, mas falha ao carregar o seu perfil.');
        navigate('/login');
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Email ou password inválidos.';
      console.error('[useLogin] Erro no login:', message);
      toast.error(message);
    },
  });
};

/**
 * Hook para a mutação de FORGOT PASSWORD (Esqueci a Senha)
 */
export const useForgotPassword = () => {
  // ... (sem alterações)
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => authApi.forgotPassword(data),
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Erro ao enviar o email de recuperação.';
      console.error('[useForgotPassword] Erro:', message);
      toast.error(message);
    },
  });
};

/**
 * Hook para a mutação de RESET PASSWORD (Resetar a Senha)
 */
export const useResetPassword = () => {
  // ... (sem alterações)
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordDto) => authApi.resetPassword(data),
    onSuccess: () => {
      console.log('[useResetPassword] Senha alterada com sucesso.');
      toast.success('Senha alterada com sucesso! Você pode fazer login agora.');
      navigate('/login');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Token inválido, expirado, ou erro ao alterar a senha.';
      console.error('[useResetPassword] Erro:', message);
      toast.error(message);
    },
  });
};

// --- INÍCIO DA ADIÇÃO (Fase 3: Verificação de Email) ---
/**
 * Hook para a mutação de VERIFY EMAIL (Clicar no link)
 */
export const useVerifyEmail = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const getProfileMutation = useGetProfile(); // Reutiliza a lógica de buscar perfil

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),

    onSuccess: async (data: AuthResponse) => {
      // Esta lógica é uma cópia do onSuccess do useLogin/useRegister
      try {
        localStorage.setItem('cosmosmatch_token', data.accessToken);
        console.log('[useVerifyEmail] Token salvo no localStorage.');

        console.log('[useVerifyEmail] A buscar perfil completo...');
        const profile = await getProfileMutation.mutateAsync();
        console.log('[useVerifyEmail] Perfil encontrado:', profile);

        setUser(data.user);
        console.log('[useVerifyEmail] Utilizador definido no AuthContext.');

        toast.success('Email verificado com sucesso! Bem-vindo(a).');

        const isProfileComplete =
          profile.birthDate &&
          profile.birthTime &&
          profile.birthCity &&
          profile.gender;

        if (isProfileComplete) {
          console.log(
            '[useVerifyEmail] Perfil completo. Redirecionando para /discovery',
          );
          navigate('/discovery');
        } else {
          console.log(
            '[useVerifyEmail] Perfil incompleto. Redirecionando para /profile/edit',
          );
          navigate('/profile/edit');
        }
      } catch (error) {
        console.error('[useVerifyEmail] Erro no fluxo de onSuccess:', error);
        toast.error(
          'Verificação bem-sucedida, mas falha ao carregar o seu perfil. Por favor, faça login.',
        );
        navigate('/login');
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Token de verificação inválido ou expirado.';
      console.error('[useVerifyEmail] Erro na verificação:', message);
      toast.error(message);
      navigate('/login'); // Se falhar, manda para o login
    },
  });
};
// --- FIM DA ADIÇÃO ---

// --- INÍCIO DA ADIÇÃO (Fase 3.1: Reenviar Verificação) ---
/**
 * Hook para a mutação de RESEND VERIFICATION EMAIL (Botão na página de bloqueio)
 */
export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: () => authApi.resendVerificationEmail(),
    onSuccess: (data) => {
      toast.success(data.message || 'Email de verificação reenviado!');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erro ao reenviar o email.';
      console.error('[useResendVerificationEmail] Erro:', message);
      toast.error(message);
    },
  });
};
// --- FIM DA ADIÇÃO ---

// --- INÍCIO DA ADIÇÃO (Solução: Corrigir Email) ---
/**
 * Hook para a mutação de UPDATE UNVERIFIED EMAIL (Corrigir email)
 */
export const useUpdateUnverifiedEmail = () => {
  const { user, setUser } = useAuth(); // Puxa o user e o setUser do contexto

  return useMutation({
    // 'variables' é o objeto (DTO) que passamos para 'correctEmail()'
    mutationFn: (variables: UpdateUnverifiedEmailDto) =>
      authApi.updateUnverifiedEmail(variables),

    onSuccess: (data, variables) => {
      // 'data' é a resposta da API ({ message: "..." })
      // 'variables' é o que enviámos ({ newEmail: "...", password: "..." })

      toast.success(data.message || 'Email atualizado com sucesso!');

      // ATUALIZA O CONTEXTO!
      // Isto atualiza o email na UI em tempo real
      if (user) {
        setUser({ ...user, email: variables.newEmail });
      }
      console.log(
        '[useUpdateUnverifiedEmail] Email atualizado no AuthContext.',
      );
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erro ao atualizar o email.';
      console.error('[useUpdateUnverifiedEmail] Erro:', message);
      toast.error(message);
      // O 'error' será capturado pelo 'correctError' na página e exibido no formulário
    },
  });
};
// --- FIM DA ADIÇÃO ---