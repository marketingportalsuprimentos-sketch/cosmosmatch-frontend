// src/pages/ForgotPasswordPage.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema, ForgotPasswordDto } from '@/types/auth.types';
import { useForgotPassword } from '@/features/auth/hooks/useAuthMutations';

const ForgotPasswordPage = () => {
  // Estado para controlar a exibição da mensagem de sucesso
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordDto>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordDto) => {
    forgotPassword(data, {
      onSuccess: () => {
        // Se a API funcionar, mostramos a mensagem de sucesso
        setIsSuccess(true);
      },
      // O hook 'useForgotPassword' já trata o 'onError' (mostra o toast.error)
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-400">Recuperar Senha</h1>
          <p className="mt-2 text-gray-400">
            {isSuccess
              ? 'Verifique a sua caixa de entrada.'
              : 'Digite seu email para receber o link de recuperação.'}
          </p>
        </div>

        {isSuccess ? (
          // --- ESTADO DE SUCESSO ---
          <div className="bg-gray-800 p-6 rounded-lg text-center shadow-lg">
            <p className="text-white">
              Se este email estiver registrado, enviaremos um link com as
              instruções para redefinir sua senha.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block w-full rounded-md bg-indigo-600 px-4 py-2 text-center font-semibold text-white hover:bg-indigo-700"
            >
              Voltar para o Login
            </Link>
          </div>
        ) : (
          // --- FORMULÁRIO INICIAL ---
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={`mt-1 block w-full rounded-md border-0 bg-gray-700 px-3 py-2 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${
                  errors.email ? 'ring-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'A enviar...' : 'Enviar Link de Recuperação'}
              </button>
            </div>
          </form>
        )}

        {!isSuccess && (
          <p className="text-center text-sm text-gray-400">
            Lembrou-se da senha?{' '}
            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Fazer login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;