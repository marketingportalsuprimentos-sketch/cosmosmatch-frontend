// frontend/src/components/auth/VerificationBanner.tsx

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export function VerificationBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  const isVerified = 
    (user as any)?.isEmailVerified === true || 
    (user as any)?.emailVerified === true || 
    (user as any)?.email_verified === true ||
    (user as any)?.verified === true;

  if (!isVisible || isVerified || !user) return null;

  let hoursRemaining = 0;
  if (user.createdAt) {
    const createdDate = new Date(user.createdAt);
    const deadline = new Date(createdDate.getTime() + 72 * 60 * 60 * 1000); 
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    hoursRemaining = Math.ceil(diffMs / (1000 * 60 * 60));
  }

  if (hoursRemaining <= 0) return null;

  return (
    <div className="bg-yellow-600/95 text-white text-xs px-3 py-2 backdrop-blur-sm sticky top-0 z-50 shadow-md transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        
        {/* Lado Esquerdo: Ícone e Texto */}
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          <FiAlertTriangle className="text-yellow-200 text-sm shrink-0" />
          {/* 'truncate' garante que se o texto for gigante no mobile, ele põe '...' mas não quebra o layout */}
          <span className="truncate font-medium">
            Verifique seu e-mail em <strong>{hoursRemaining}h</strong> para evitar bloqueio da conta
          </span>
        </div>

        {/* Lado Direito: Ações (Fixo) */}
        <div className="flex items-center gap-3 shrink-0">
          <Link 
            to="/please-verify" 
            className="underline hover:text-yellow-200 font-bold whitespace-nowrap"
          >
            Verificar
          </Link>

          <button 
            onClick={() => setIsVisible(false)}
            className="p-1.5 -mr-1 hover:bg-yellow-700/50 rounded-full transition-colors flex items-center justify-center"
            title="Fechar aviso"
          >
            <FiX className="text-white w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}