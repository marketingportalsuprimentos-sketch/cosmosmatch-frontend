// src/features/auth/components/LoginForm.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks/useAuthMutations';
import { LoginDto } from '@/types/auth.types';
import { toast } from 'sonner'; // Atualizado para 'sonner' conforme padrão anterior
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Para atualizar o estado global se reativar
  
  // Estado para controlar o Modal de Quarentena
  const [quarantineCredentials, setQuarantineCredentials] = useState<LoginDto | null>(null);

  // Hook de Login padrão
  const { mutate: login, isPending: isLoggingIn } = useLogin();

  // Hook Manual para Reativação (Chama a rota que criamos no AuthController)
  const { mutate: reactivate, isPending: isReactivating } = useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await api.post('/auth/reactivate', data);
      return response.data;
    },
    onSuccess: (data) => {
      // 1. Salva o Token
      localStorage.setItem('cosmosmatch_token', data.accessToken);
      
      // 2. Atualiza o Contexto de Auth manualmente (para o utilizador entrar na hora)
      setUser(data.user);
      
      // 3. Feedback e Redirecionamento
      toast.success(data.message || 'Conta restaurada com sucesso!');
      setQuarantineCredentials(null);
      navigate('/feed');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao restaurar conta. Tente novamente.');
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginDto) => {
    login(data, {
      onError: (error: any) => {
        // --- AQUI ESTÁ A MÁGICA ---
        // Verifica se o erro é especificamente o de Quarentena
        const errorMessage = error?.response?.data?.message;
        
        if (errorMessage === 'ACCOUNT_IN_QUARANTINE') {
          // Guarda as credenciais e abre o modal
          setQuarantineCredentials(data);
        } else {
          // Erro normal (senha errada, etc)
          const msg = error?.response?.data?.message || 'Erro ao entrar. Verifique seus dados.';
          toast.error(msg);
        }
      },
    });
  };

  const handleConfirmReactivation = () => {
    if (quarantineCredentials) {
      reactivate(quarantineCredentials);
    }
  };

  const handleCancelReactivation = () => {
    setQuarantineCredentials(null);
    toast.info('Reativação cancelada. A conta permanece agendada para exclusão.');
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-300">
            Endereço de email
          </label>
          <div className="mt-2">
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isLoggingIn || isReactivating}
              {...register('email')}
              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">
              Senha
            </label>
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>
          <div className="mt-2">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoggingIn || isReactivating}
              {...register('password')}
              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoggingIn || isReactivating}
            className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 transition-all"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" /> Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </div>
      </form>

      {/* --- MODAL DE QUARENTENA --- */}
      {quarantineCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-yellow-600/50 rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
            {/* Efeito de brilho de fundo */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-500/20 blur-2xl rounded-full"></div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-yellow-500/10 p-3 rounded-full mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Conta em Quarentena</h3>
              
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                Esta conta está agendada para exclusão. Se não fizer nada, ela será apagada permanentemente em breve.
                <br /><br />
                <span className="font-semibold text-yellow-400">Deseja restaurar sua conta agora?</span>
              </p>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleConfirmReactivation}
                  disabled={isReactivating}
                  className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isReactivating ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" /> Restaurando...
                    </>
                  ) : (
                    'Sim, Restaurar Conta'
                  )}
                </button>
                
                <button
                  onClick={handleCancelReactivation}
                  disabled={isReactivating}
                  className="w-full py-3 bg-transparent border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <XMarkIcon className="h-5 w-5" />
                  Não, manter excluída
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}