// src/pages/BlockedProfilesPage.tsx

import { useNavigate, Link } from 'react-router-dom';
import {
  useGetMyBlockedList,
  useUnblockUser,
} from '@/features/profile/hooks/useProfile';
import { toast } from '@/lib/toast';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';

// --- Componente de Cabeçalho ---
const BlockedHeader = () => {
  const navigate = useNavigate();
  return (
    <div className="relative flex justify-center items-center p-4 border-b border-gray-700">
      <button
        onClick={() => navigate(-1)} // Volta para a página anterior
        className="absolute left-4 p-2 rounded-full text-gray-300 hover:bg-gray-700"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-semibold text-white">Perfis Bloqueados</h1>
    </div>
  );
};

// --- Componente de Item da Lista (CORRIGIDO 🛠️) ---
const BlockedUserItem = ({
  user,
  onUnblock,
  isUnblocking,
}: {
  user: {
    id: string;
    name: string;
    profile?: { imageUrl: string | null } | null; // Pode vir dentro de profile...
    imageUrl?: string | null;                     // ...ou na raiz (correção do backend)
  };
  onUnblock: () => void;
  isUnblocking: boolean;
}) => {
  // 1. Pega a URL base do backend (remove o /api do final se tiver)
  const backendBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

  // 2. Tenta pegar a imagem de qualquer lugar que ela esteja
  const rawImageUrl = user.profile?.imageUrl || user.imageUrl;
  
  let avatarUrl = null;

  // 3. Lógica Inteligente de URL 🧠
  if (rawImageUrl) {
    if (rawImageUrl.startsWith('http')) {
      // Se já tem http (Cloudinary ou Google), usa direto
      avatarUrl = rawImageUrl;
    } else {
      // Se é local, garante que não fique com barra dupla (//)
      const cleanPath = rawImageUrl.startsWith('/') ? rawImageUrl : `/${rawImageUrl}`;
      avatarUrl = `${backendBaseUrl}${cleanPath}`;
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3 group">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-600 group-hover:border-indigo-500 transition-colors"
          />
        ) : (
          <UserCircleIcon className="w-12 h-12 text-gray-500 group-hover:text-gray-400 transition-colors" />
        )}
        <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
          {user.name}
        </span>
      </Link>

      <button
        onClick={onUnblock}
        disabled={isUnblocking}
        className={`
          px-4 py-2 rounded-lg font-semibold text-sm transition-all
          bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md
          disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed
        `}
      >
        {isUnblocking ? 'Aguarde...' : 'Desbloquear'}
      </button>
    </div>
  );
};

// --- Componente de Página Principal ---
export default function BlockedProfilesPage() {
  const {
    data: blockedList,
    isLoading,
    isError,
  } = useGetMyBlockedList();

  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();

  const handleUnblockUser = (userId: string) => {
    if (isUnblocking) return;
    unblockUser(userId, {
      onSuccess: () => {
        toast.success('Usuário desbloqueado.');
        // O 'useUnblockUser' invalida a query, a lista atualiza sozinha.
      },
      onError: () => {
        toast.error('Erro ao desbloquear o usuário.');
      },
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-red-400 text-center mt-8 flex flex-col items-center gap-2">
          <ExclamationTriangleIcon className="w-8 h-8" />
          <p>Não foi possível carregar a lista de bloqueados.</p>
        </div>
      );
    }

    if (!blockedList || blockedList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400 opacity-70">
           <UserCircleIcon className="w-16 h-16 mb-2" />
           <p>Você não bloqueou ninguém.</p>
           <p className="text-xs">Paz e amor! ✌️</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 p-4">
        {blockedList.map((user) => (
          <BlockedUserItem
            key={user.id}
            user={user}
            onUnblock={() => handleUnblockUser(user.id)}
            isUnblocking={isUnblocking}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      <BlockedHeader />
      <main className="max-w-2xl mx-auto">{renderContent()}</main>
    </div>
  );
}