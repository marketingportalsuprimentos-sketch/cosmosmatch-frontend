// frontend/src/pages/PleaseVerifyPage.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useResendVerificationEmail, 
  useUpdateUnverifiedEmail 
} from '@/features/auth/hooks/useAuthMutations'; 
import { FiMail, FiArrowRight, FiLogOut, FiEdit2, FiSave, FiX, FiLock } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';

export default function PleaseVerifyPage() {
  // CORREÇÃO: Trocamos 'signOut' por 'logout' para corresponder ao AuthContext
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  
  // Estados para edição de email
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');

  // Hooks
  const { mutate: resendEmail, isPending: isResending } = useResendVerificationEmail();
  const { mutate: updateEmail, isPending: isUpdating } = useUpdateUnverifiedEmail();

  // Atualiza o e-mail no formulário se o usuário mudar
  useEffect(() => {
    if (user?.email) {
      setNewEmail(user.email);
    }
  }, [user?.email]);

  // === LÓGICA DO PRAZO DE GRAÇA (3 DIAS / 72H) ===
  let isWithinGracePeriod = false;
  if (user?.createdAt) {
    const createdDate = new Date(user.createdAt);
    const now = new Date();
    // Diferença em horas
    const diffHours = Math.abs(now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours <= 72) {
      isWithinGracePeriod = true;
    }
  }

  const handleResend = () => {
    if (user?.id) {
      resendEmail(user.id, { 
        onSuccess: () => toast.success('Link reenviado para sua caixa de entrada!'),
        onError: () => toast.error('Erro ao reenviar. Tente novamente.'),
      });
    }
  };

  const handleUpdateEmail = () => {
    if (!newEmail || !password) {
      toast.error('Preencha o novo email e sua senha atual.');
      return;
    }

    if (user?.id) {
      updateEmail(
        { userId: user.id, data: { newEmail, password } },
        {
          onSuccess: () => {
            // 1. FECHA O MODO DE EDIÇÃO (Volta para a tela anterior)
            setIsEditing(false);
            
            // 2. Limpa a senha por segurança
            setPassword('');
            
            // 3. Feedback visual
            toast.success('Email atualizado! Enviamos um novo link.');
          }
        }
      );
    }
  };

  // CORREÇÃO: Usamos 'logout' aqui
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center space-y-6 border border-gray-700">
        
        <div className="flex justify-center">
          <div className="bg-purple-900/50 p-4 rounded-full border border-purple-500/30">
            <FiMail className="w-12 h-12 text-purple-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold">Verifique seu Email</h1>
        
        {/* === MODO VISUALIZAÇÃO (Tela Padrão) === */}
        {!isEditing ? (
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 animate-in fade-in zoom-in duration-300">
            <p className="text-gray-400 text-sm mb-1">Enviamos um link para:</p>
            {/* O email aqui atualiza sozinho via Contexto */}
            <p className="font-semibold text-white text-lg break-all">{user?.email}</p>
            
            <button 
              onClick={() => {
                setNewEmail(user?.email || '');
                setIsEditing(true);
              }}
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center justify-center gap-1 mx-auto mt-2 transition-colors"
            >
              <FiEdit2 className="w-3 h-3" /> O e-mail está errado?
            </button>
          </div>
        ) : (
          /* === MODO EDIÇÃO (Formulário) === */
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-3 animate-in fade-in zoom-in duration-300">
            <p className="text-sm text-white font-bold text-left">Corrigir Endereço:</p>
            
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Novo e-mail correto"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-purple-500 outline-none"
              />
              
              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirme sua senha atual"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-purple-500 outline-none pr-10"
                />
                <FiLock className="absolute right-3 top-3 text-gray-500" />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm transition-colors flex items-center justify-center gap-1"
              >
                <FiX /> Cancelar
              </button>
              <button
                onClick={handleUpdateEmail}
                disabled={isUpdating}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm transition-colors flex items-center justify-center gap-1 font-bold"
              >
                {isUpdating ? <span className="animate-pulse">Salvando...</span> : <><FiSave /> Salvar</>}
              </button>
            </div>
          </div>
        )}

        {/* === BOTÕES DE AÇÃO (Só aparecem quando NÃO está editando) === */}
        {!isEditing && (
          <div className="space-y-3 pt-2">
            
            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 shadow-lg mb-4"
            >
              {isResending ? 'Enviando...' : 'Reenviar Link'}
            </button>

            {/* --- PRAZO DE GRAÇA: Botão "Continuar" --- */}
            {isWithinGracePeriod ? (
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">
                  Você pode confirmar o email depois.
                </p>
                
                {/* BOTÃO CORRIGIDO PARA ONBOARDING */}
                <Link
                  to="/onboarding"
                  className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-gray-600"
                >
                  Continuar para o Perfil <FiArrowRight />
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-red-900/30">
                <p className="text-sm text-red-400 font-semibold bg-red-900/20 p-2 rounded border border-red-900/50">
                  🚫 Seu período de teste acabou. Verifique o email para continuar.
                </p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto mt-6"
            >
              <FiLogOut /> Sair / Trocar Conta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}