// frontend/src/features/auth/hooks/useAuthMutations.ts
// (COLE ISTO NO SEU ARQUIVO)

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
import type { UseFormSetError } from 'react-hook-form';
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
export const useRegister = (options: {
  setError: UseFormSetError<RegisterDto>;
}) => {
  // ... (sem alterações - esta parte já estava correta)
  const { setError } = options; 

  const { setUser } = useAuth();
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

        console.log(
          '[useRegister] Redirecionando para /please-verify (Nova Lógica)',
        );
        navigate('/please-verify'); 

      } catch (error) {
        console.error('[useRegister] Erro no fluxo de onSuccess:', error);
        toast.error(
          'Registo bem-sucedido, mas falha ao definir o utilizador. Por favor, faça login.',
        );
        navigate('/login');
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Erro ao tentar registar.';
      console.error('[useRegister] Erro no registo:', message);

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
 * Hook para a mutação de LOGIN
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const getProfileMutation = useGetProfile();

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),

    // --- INÍCIO DA CORREÇÃO (A "Confusão") ---
    onSuccess: async (data: AuthResponse) => {
      // 1. Definimos o token e o utilizador IMEDIATAMENTE.
      // O 'user' do contexto é necessário para a 'PleaseVerifyPage'
      localStorage.setItem('cosmosmatch_token', data.accessToken);
      setUser(data.user);
      console.log('[useLogin] Login OK. Token e Utilizador definidos no contexto.');

      try {
        // 2. Tentamos buscar o perfil completo.
        //    (Isto VAI falhar com 403 se o user não estiver verificado)
        console.log('[useLogin] A tentar buscar perfil completo...');
        const profile = await getProfileMutation.mutateAsync();
        console.log('[useLogin] Perfil encontrado (utilizador verificado):', profile);

        // 3. Se passou, o utilizador está VERIFICADO.
        //    (Segue o fluxo normal)
        const isProfileComplete =
          profile.birthDate &&
          profile.birthTime &&
          profile.birthCity &&
          profile.gender;

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

      } catch (error: any) {
        // 4. Se falhou, verificamos PORQUÊ.
        const status = error.response?.status;
        const message = error.response?.data?.message || '';
        
        // 5. Se for o Erro 403 de verificação, é ESPERADO.
        //    NÃO mostramos um alerta. O 'api.ts' (interceptor)
        //    já está a tratar do redirecionamento para /please-verify.
        if (status === 403 && message.includes('verifique o seu email')) {
          console.warn('[useLogin] Erro 403 (verificação) esperado. Interceptor vai redirecionar.');
          // Não fazemos nada. O utilizador será redirecionado.
        } else {
          // 6. Se for qualquer OUTRO erro (500, 404, etc.), aí sim
          //    é um erro real e mostramos o alerta.
          console.error('[useLogin] Erro inesperado no fluxo de onSuccess:', error);
          toast.error('Login bem-sucedido, mas falha ao carregar o seu perfil.');
          navigate('/login');
        }
      }
    },
    // --- FIM DA CORREÇÃO ---
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

/**
 * Hook para a mutação de VERIFY EMAIL (Clicar no link)
 */
export const useVerifyEmail = () => {
  // ... (sem alterações)
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const getProfileMutation = useGetProfile(); 

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),

    onSuccess: async (data: AuthResponse) => {
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

/**
 * Hook para a mutação de RESEND VERIFICATION EMAIL (Botão na página de bloqueio)
 */
export const useResendVerificationEmail = () => {
  // ... (sem alterações)
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

/**
 * Hook para a mutação de UPDATE UNVERIFIED EMAIL (Corrigir email)
 */
export const useUpdateUnverifiedEmail = () => {
  // ... (sem alterações)
  const { user, setUser } = useAuth(); 

  return useMutation({
    mutationFn: (variables: UpdateUnverifiedEmailDto) =>
      authApi.updateUnverifiedEmail(variables),

    onSuccess: (data, variables) => {
      toast.success(data.message || 'Email atualizado com sucesso!');
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
    },
  });
};