// src/pages/LoginPage.tsx
import { LoginForm } from '../features/auth/components/LoginForm';
import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    // --- INÍCIO DA CORREÇÃO ---
    // Trocado 'min-h-full' por 'min-h-screen' para forçar
    // o 'div' a ocupar a altura inteira da tela.
    <div className="flex min-h-screen flex-1 flex-col justify-center bg-gray-900 px-6 py-12 lg:px-8">
    {/* --- FIM DA CORREÇÃO --- */}
      
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        
        {/* Logo (opcional, mantido comentado) */}
        {/* <img
          className="mx-auto h-12 w-auto" 
          src="/logo.png" 
          alt="CosmosMatch"
        /> */}
        
        {/* Título "CosmosMatch" na cor do botão */}
        <h2 className="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-indigo-500">
          CosmosMatch
        </h2>
        
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <LoginForm />
        
        <p className="mt-10 text-center text-sm text-gray-400">
          Não é membro?{' '}
          <Link
            to="/register"
            className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300"
          >
            {/* --- CORREÇÃO --- */}
            Crie sua conta
            {/* --- FIM DA CORREÇÃO --- */}
          </Link>
        </p>
      </div>
    </div>
  );
}

// Adicionamos 'export default' para corresponder ao router
export default LoginPage;