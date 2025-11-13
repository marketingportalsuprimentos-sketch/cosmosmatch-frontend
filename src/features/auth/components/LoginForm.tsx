// src/features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// --- INÍCIO DA CORREÇÃO ---
// 1. O nome do hook foi corrigido de 'useAuthMutations' para 'useLogin'
import { useLogin } from '../hooks/useAuthMutations'; //
// --- FIM DA CORREÇÃO ---
import { LoginDto } from '@/types/auth.types';
import { toast } from '@/lib/toast';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export function LoginForm() { //
  // --- INÍCIO DA CORREÇÃO ---
  // 2. Usamos o 'useLogin'
  const { mutate: login, isPending: isLoggingIn } = useLogin(); //
  // --- FIM DA CORREÇÃO ---

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginDto) => { //
    try {
      login(data); // 3. Chamamos o 'login' (que é o 'mutate')
    } catch (error) {
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
      console.error(error);
    }
  };

  return (
    // O JSX (Aparência) abaixo é idêntico ao ficheiro que você enviou
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-300"
        >
          Endereço de email
        </label>
        <div className="mt-2">
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isLoggingIn}
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
          <label
            htmlFor="password"
            className="block text-sm font-medium leading-6 text-gray-300"
          >
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
            disabled={isLoggingIn}
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
          disabled={isLoggingIn}
          className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
        >
          {isLoggingIn ? 'A entrar...' : 'Entrar'}
        </button>
      </div>
    </form>
  );
}