import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks/useAuthMutations';
import { LoginDto } from '@/types/auth.types';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiRefreshCw } from 'react-icons/fi';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const inputBase =
  'block w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:bg-white/[0.065] focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60';

export function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [quarantineCredentials, setQuarantineCredentials] = useState<LoginDto | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending: isLoggingIn } = useLogin();

  const { mutate: reactivate, isPending: isReactivating } = useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await api.post('/auth/reactivate', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('cosmosmatch_token', data.accessToken);
      setUser(data.user);
      toast.success(data.message || 'Conta restaurada com sucesso!');
      setQuarantineCredentials(null);
      navigate('/feed');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao restaurar conta. Tente novamente.');
    },
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
        const errorMessage = error?.response?.data?.message;

        if (errorMessage === 'ACCOUNT_IN_QUARANTINE') {
          setQuarantineCredentials(data);
        } else {
          const msg =
            error?.response?.data?.message ||
            'Erro ao entrar. Verifique seus dados.';
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

  const disabled = isLoggingIn || isReactivating;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200"
          >
            <FiMail className="text-cyan-300" />
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            disabled={disabled}
            {...register('email')}
            className={inputBase}
          />
          {errors.email && (
            <p className="mt-2 text-sm font-medium text-rose-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="flex items-center gap-2 text-sm font-bold text-slate-200"
            >
              <FiLock className="text-violet-300" />
              Senha
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-bold text-violet-300 transition hover:text-violet-200 sm:text-sm"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              disabled={disabled}
              {...register('password')}
              className={`${inputBase} pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={disabled}
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-50"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {errors.password && (
            <p className="mt-2 text-sm font-medium text-rose-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(124,58,237,0.28)] transition hover:-translate-y-0.5 hover:from-fuchsia-400 hover:to-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingIn ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              Entrar no CosmosMatch
              <FiArrowRight />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-600">
          <FiLock />
          <span>Acesso protegido à sua conta</span>
        </div>
      </form>

      {quarantineCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03050d]/90 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-[26px] border border-amber-400/20 bg-[#0d1224] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
                <ExclamationTriangleIcon className="h-7 w-7 text-amber-300" />
              </div>

              <span className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-300">
                Conta em quarentena
              </span>
              <h3 className="text-2xl font-black tracking-[-0.04em] text-white">
                Deseja restaurar sua conta?
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Esta conta está agendada para exclusão. Se você continuar, ela será
                reativada e você poderá acessar normalmente o CosmosMatch.
              </p>

              <div className="mt-7 flex w-full flex-col gap-3">
                <button
                  onClick={handleConfirmReactivation}
                  disabled={isReactivating}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 font-extrabold text-[#1d1203] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isReactivating ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Restaurando...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw />
                      Restaurar minha conta
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancelReactivation}
                  disabled={isReactivating}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-5 font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-60"
                >
                  <XMarkIcon className="h-5 w-5" />
                  Manter conta excluída
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
