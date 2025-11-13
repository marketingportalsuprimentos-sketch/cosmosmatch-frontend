// src/pages/ResetPasswordPage.tsx
import { useState, FormEvent, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPassword } from '@/features/auth/hooks/useAuthMutations';
import { toast } from '@/lib/toast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState<string | null>(null);

  const resetPasswordMutation = useResetPassword();

  // O estado 'password' refere-se ao campo "Nova Senha" no formulário
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error('Token de redefinição não encontrado na URL.');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Token inválido ou não encontrado.');
      navigate('/login');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Por favor, preencha ambos os campos.');
      return;
    }
    
    // O erro do backend diz 6 caracteres
    if (password.length < 6) { 
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    // ---
    // INÍCIO DA CORREÇÃO: Enviar 'newPassword' em vez de 'password'
    // ---
    try {
      // O DTO esperado é { token, newPassword }
      // O nosso estado 'password' contém o valor da nova senha.
      await resetPasswordMutation.mutateAsync({ token, newPassword: password });
      
      // O hook 'useResetPassword' já trata o toast de sucesso e o redirecionamento
    } catch (error) {
      // O hook 'useResetPassword' já trata o toast de erro
      console.error('Falha ao redefinir a senha:', error);
    }
    // ---
    // FIM DA CORREÇÃO
    // ---
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        A verificar o token...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">Redefinir Senha</h1>
        <p className="text-center text-gray-400">Insira a sua nova senha abaixo.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nova Senha */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Nova Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Campo Confirmar Senha */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300"
            >
              Confirmar Nova Senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Botão Submeter */}
          <div>
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {resetPasswordMutation.isPending
                ? 'Aguarde...'
                : 'Redefinir Minha Senha'}
            </button>
          </div>
        </form>

        {/* Link para Login (caso o token esteja errado) */}
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-400 hover:underline"
          >
            Lembrou-se da senha? Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;