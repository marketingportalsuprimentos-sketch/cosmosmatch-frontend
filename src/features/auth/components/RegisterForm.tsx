import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiArrowRight, FiAtSign, FiCheck, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { RegisterDto, registerSchema } from '@/types/auth.types';
import { useRegister } from '../hooks/useAuthMutations';

const inputBase =
  'block w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:bg-white/[0.065] focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60';

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate: registerUser, isPending: isRegistering } = useRegister({
    setError,
  });

  const onSubmit = (data: RegisterDto) => {
    const userData = {
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
    };

    registerUser(userData as RegisterDto);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
          <FiUser className="text-violet-300" />
          Nome completo
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Ex.: Cássio Batista"
          disabled={isRegistering}
          {...register('name')}
          className={inputBase}
        />
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Digite seu nome completo, como consta no documento.
        </p>
        {errors.name && (
          <p className="mt-2 text-sm font-medium text-rose-400">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="username" className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
          <FiAtSign className="text-fuchsia-300" />
          Seu @ no CosmosMatch
        </label>

        <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.045] transition focus-within:border-violet-400/60 focus-within:bg-white/[0.065] focus-within:ring-4 focus-within:ring-violet-500/10">
          <span className="grid w-12 shrink-0 place-items-center border-r border-white/10 text-sm font-bold text-fuchsia-300">
            @
          </span>
          <input
            id="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="cassio"
            disabled={isRegistering}
            {...register('username')}
            className="block min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
          <FiCheck className="mt-0.5 shrink-0 text-emerald-400" />
          <span>
            Esse será seu identificador público no app. Use letras, números e _. Ex.: @cassio
          </span>
        </div>

        {errors.username && (
          <p className="mt-2 text-sm font-medium text-rose-400">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
          <FiMail className="text-cyan-300" />
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          disabled={isRegistering}
          {...register('email')}
          className={inputBase}
        />
        {errors.email && (
          <p className="mt-2 text-sm font-medium text-rose-400">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
            <FiLock className="text-violet-300" />
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            disabled={isRegistering}
            {...register('password')}
            className={inputBase}
          />
          {errors.password && (
            <p className="mt-2 text-sm font-medium text-rose-400">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
            <FiLock className="text-violet-300" />
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a senha"
            disabled={isRegistering}
            {...register('confirmPassword')}
            className={inputBase}
          />
          {errors.confirmPassword && (
            <p className="mt-2 text-sm font-medium text-rose-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isRegistering}
        className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(124,58,237,0.28)] transition hover:-translate-y-0.5 hover:from-fuchsia-400 hover:to-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRegistering ? (
          'Criando sua conta...'
        ) : (
          <>
            Criar minha conta
            <FiArrowRight />
          </>
        )}
      </button>
    </form>
  );
}
