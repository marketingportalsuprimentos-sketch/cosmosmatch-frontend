// frontend/src/features/auth/components/RegisterForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// --- INÍCIO DA ATUALIZAÇÃO (Fase 2: Frontend) ---
// 1. Removemos o 'z' local e importamos o schema CORRETO de auth.types
import {
  RegisterDto,
  registerSchema,
} from '@/types/auth.types';
// --- FIM DA ATUALIZAÇÃO ---
import { useRegister } from '../hooks/useAuthMutations';
import { toast } from '@/lib/toast';

// 2. O schema local foi REMOVIDO daqui, pois já o importamos de auth.types

export function RegisterForm() {
  // --- INÍCIO DA CORREÇÃO (Erro TS2339) ---
  // A propriedade correta é 'isPending', nós a renomeamos para 'isRegistering'
  // --- INÍCIO DA ATUALIZAÇÃO (Fase 2.1: Erro no Campo) ---
  // 1. Extraímos 'setError' do useForm (na linha 27)
  // 2. Passamos 'setError' para o useRegister
  const {
    register,
    handleSubmit,
    setError, // <-- 1. EXTRAÍDO
    formState: { errors },
  } = useForm<RegisterDto>({
    // 3. O resolver agora usa o schema importado (que tem o username)
    resolver: zodResolver(registerSchema),
  });
  
  const { mutate: registerUser, isPending: isRegistering } = useRegister({
    setError, // <-- 2. PASSADO PARA O HOOK
  });
  // --- FIM DA ATUALIZAÇÃO ---
  // --- FIM DA CORREÇÃO ---


  // 4. A sua lógica de onSubmit foi atualizada
  const onSubmit = (data: RegisterDto) => {
    // 'data' agora contém 'username' graças ao react-hook-form e ao zodResolver
    const userData = {
      name: data.name,
      // --- INÍCIO DA ATUALIZAÇÃO ---
      username: data.username, // <-- Adicionámos o username ao envio
      // --- FIM DA ATUALIZAÇÃO ---
      email: data.email,
      password: data.password,
    };
    
    // --- INÍCIO DA ATUALIZAÇÃO (Fase 2.1: Limpeza) ---
    // O try/catch foi removido. O 'onError' do useRegister
    // (no ficheiro useAuthMutations.ts) agora trata todos os erros.
    registerUser(userData as RegisterDto);
    // --- FIM DA ATUALIZAÇÃO ---
  };

  return (
    // 5. O JSX foi atualizado com o novo campo
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium leading-6 text-gray-300"
        >
          Nome (Exibição)
        </label>
        <div className="mt-2">
          <input
            id="name"
            type="text"
            autoComplete="name"
            disabled={isRegistering}
            {...register('name')}
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>
      </div>

      {/* --- INÍCIO DA ADIÇÃO (Fase 2: Frontend JSX) --- */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium leading-6 text-gray-300"
        >
          Nome de Utilizador (o seu @)
        </label>
        <div className="mt-2">
          <input
            id="username"
            type="text"
            autoComplete="username"
            disabled={isRegistering}
            {...register('username')}
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
          <span className="text-xs text-gray-400">
            (Apenas letras, números e _. Ex: joao_silva)
          </span>
          {errors.username && (
            <p className="mt-2 text-sm text-red-400">
              {errors.username.message}
            </p>
          )}
        </div>
      </div>
      {/* --- FIM DA ADIÇÃO --- */}

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
            disabled={isRegistering}
            {...register('email')}
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium leading-6 text-gray-300"
        >
          Senha
        </label>
        <div className="mt-2">
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={isRegistering}
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
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium leading-6 text-gray-300"
        >
          Confirmar Senha
        </label>
        <div className="mt-2">
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={isRegistering}
            {...register('confirmPassword')}
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
          />
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isRegistering}
          className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
        >
          {isRegistering ? 'A criar conta...' : 'Criar conta'}
        </button>
      </div>
    </form>
  );
}