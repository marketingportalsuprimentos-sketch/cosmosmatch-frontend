// src/pages/RegisterPage.tsx
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center bg-gray-900 px-6 py-12 lg:px-8">
      
      {/* 1. Título "CosmosMatch" */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-indigo-500">
          CosmosMatch
        </h2>
      </div>

      {/* 2. Formulário de Registo */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <RegisterForm />
        
        {/* AVISO LEGAL (Adicionado de volta) */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Ao se cadastrar, você concorda com nossos{' '}
          <Link to="/terms" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Termos de Uso
          </Link>
          {' '}e{' '}
          <Link to="/privacy" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Política de Privacidade
          </Link>.
        </p>

        {/* 3. Link para "Entrar" */}
        <p className="mt-10 text-center text-sm text-gray-400">
          Já é membro?{' '}
          <Link
            to="/login"
            className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300"
          >
            Entre na sua conta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;