// frontend/src/pages/PleaseVerifyPage.tsx
import { useState } from 'react';
import {
  FiMail,
  FiLogOut,
  FiLoader,
  FiEdit2,
  FiArrowRight,
  FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import {
  useResendVerificationEmail,
  useUpdateUnverifiedEmail,
} from '@/features/auth/hooks/useAuthMutations';
import { useNavigate } from 'react-router-dom';

export function PleaseVerifyPage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  // === ESTADO LOCAL (para os formulários) ===
  const [showCorrectForm, setShowCorrectForm] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  // === MUTAÇÃO 1: Reenviar Email ===
  const { mutate: resendEmail, isPending: isResending } =
    useResendVerificationEmail();

  // === MUTAÇÃO 2: Corrigir Email ===
  const {
    mutate: correctEmail,
    isPending: isCorrecting,
    error: correctError,
  } = useUpdateUnverifiedEmail();

  // === Handlers ===
  const handleResendClick = () => {
    if (isResending || isCorrecting) return;
    resendEmail();
  };

  const handleCorrectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isResending || isCorrecting || !user) return;
    
    correctEmail({ newEmail, password });
    
    if (!correctError) {
      setShowCorrectForm(false);
      setPassword('');
    }
  };

  const handleContinue = () => {
    // --- INÍCIO DA CORREÇÃO (O erro 404 está aqui) ---
    // O botão estava a apontar para o sítio errado.
    // O caminho correto é /profile/edit.
    navigate('/profile/edit');
    // --- FIM DA CORREÇÃO ---
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <FiMail className="h-16 w-16 text-indigo-400" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Verifique o seu email
          </h1>
          <p className="mt-4 text-gray-400">
            Enviámos um link de verificação para:
          </p>
          <p className="text-lg font-bold text-indigo-300">{user?.email}</p>

          <p className="mt-2 text-gray-400">
            Pode continuar para o seu perfil, mas precisará de verificar o email
            para aceder a todas as funcionalidades.
          </p>

          {/* Formulário de Correção (Condicional) */}
          {showCorrectForm ? (
            <form
              onSubmit={handleCorrectSubmit}
              className="mt-6 w-full animate-fadeIn"
            >
              <h3 className="text-lg font-semibold text-white">
                Corrigir email
              </h3>
              <div className="mt-4 space-y-4 text-left">
                <div>
                  <label
                    htmlFor="newEmail"
                    className="block text-sm font-medium leading-6 text-gray-300"
                  >
                    Novo endereço de email
                  </label>
                  <input
                    type="email"
                    id="newEmail"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-0 bg-gray-700 p-2 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-300"
                  >
                    Confirme a sua senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-0 bg-gray-700 p-2 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  />
                </div>
                {correctError && (
                  <div className="flex items-center text-sm text-red-400">
                    <FiAlertCircle className="mr-2 h-4 w-4" />
                    {(correctError as any).response?.data?.message ||
                      'Erro ao atualizar'}
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCorrectForm(false)}
                    disabled={isCorrecting}
                    className="flex-1 rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCorrecting || isResending}
                    className="flex flex-1 items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:opacity-50"
                  >
                    {isCorrecting ? (
                      <FiLoader className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <FiMail className="mr-2 h-5 w-5" />
                    )}
                    {isCorrecting
                      ? 'A guardar...'
                      : 'Guardar e Reenviar'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Botões de Ação (Padrão) */
            <div className="mt-6 w-full space-y-4">
              <button
                onClick={handleContinue}
                className="flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400"
              >
                Continuar para o Perfil
                <FiArrowRight className="ml-2 h-5 w-5" />
              </button>

              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-800 px-2 text-gray-400">
                    Ou
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCorrectForm(true)}
                  disabled={isResending || isCorrecting}
                  className="flex flex-1 items-center justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 disabled:opacity-50"
                >
                  <FiEdit2 className="mr-2 h-5 w-5" />
                  Corrigir email
                </button>
                <button
                  onClick={handleResendClick}
                  disabled={isResending || isCorrecting}
                  className="flex flex-1 items-center justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 disabled:opacity-50"
                >
                  {isResending ? (
                    <FiLoader className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <FiMail className="mr-2 h-5 w-5" />
                  )}
                  {isResending ? 'A reenviar...' : 'Reenviar email'}
                </button>
              </div>

              <button
                onClick={logout}
                className="flex w-full items-center justify-center rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-gray-400 shadow-sm hover:text-white"
              >
                <FiLogOut className="mr-2 h-5 w-5" />
                Fazer Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PleaseVerifyPage;