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

// Componente de Cabeçalho Simples
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

// Componente de Item da Lista
const BlockedUserItem = ({
  user,
  onUnblock,
  isUnblocking,
}: {
  user: {
    id: string;
    name: string;
    profile: { imageUrl: string | null } | null;
  };
  onUnblock: () => void;
  isUnblocking: boolean;
}) => {
  const backendBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
  const avatarUrl = user.profile?.imageUrl
    ? `${backendBaseUrl}/${user.profile.imageUrl}`
    : null;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3 group">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <UserCircleIcon className="w-12 h-12 text-gray-600" />
        )}
        <span className="font-semibold text-white group-hover:underline">
          {user.name}
        </span>
      </Link>

      <button
        onClick={onUnblock}
        disabled={isUnblocking}
        className={`
          px-4 py-2 rounded-lg font-semibold text-sm transition-colors
          bg-indigo-600 text-white hover:bg-indigo-700
          disabled:bg-gray-500 disabled:cursor-not-allowed
        `}
      >
        {isUnblocking ? 'Aguarde...' : 'Desbloquear'}
      </button>
    </div>
  );
};

// Componente de Página Principal
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
        // O 'useUnblockUser' já invalida a query 'blockedList',
        // então a lista será atualizada automaticamente.
      },
      onError: () => {
        toast.error('Erro ao desbloquear o usuário.');
      },
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <p className="text-gray-400 text-center mt-8">
          A carregar lista de bloqueados...
        </p>
      );
    }

    if (isError) {
      return (
        <div className="text-red-400 text-center mt-8 flex flex-col items-center gap-2">
          <ExclamationTriangleIcon className="w-8 h-8" />
          <p>Não foi possível carregar a lista.</p>
        </div>
      );
    }

    if (!blockedList || blockedList.length === 0) {
      return (
        <p className="text-gray-400 text-center mt-8">
          Você não bloqueou nenhum usuário.
        </p>
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
    <div className="min-h-screen bg-gray-900 text-white">
      <BlockedHeader />
      <main>{renderContent()}</main>
    </div>
  );
}