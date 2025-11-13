// src/pages/SearchPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowLeft, FiLoader, FiX } from 'react-icons/fi';

import { useDebounce } from '@/hooks/useDebounce';
import { useSearchUsers } from '@/features/social/hooks/useSocialQueries';
import { UserSearchResult } from '@/types/social.types'; // <-- ESTA LINHA FOI ADICIONADA

// Helper para imagens (copiado de ChatListPage)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const backendOrigin = apiUrl.replace(/\/api\/?$/, '');
const defaultAvatar = '/default-avatar.png';
const toPublicUrl = (path?: string | null) => {
  if (!path) return defaultAvatar;
  if (/^https?:\/\//i.test(path)) return path;
  return `${backendOrigin}/${path}`;
};

// Componente para um item da lista de resultado
function SearchResultItem({ user }: { user: UserSearchResult }) {
  return (
    <Link
      to={`/profile/${user.id}`}
      className="flex items-center p-3 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
    >
      <img
        src={toPublicUrl(user.profile?.imageUrl)}
        alt={user.name}
        className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-700"
        onError={(e) => {
          (e.target as HTMLImageElement).src = defaultAvatar;
        }}
      />
      <span className="font-semibold text-lg text-white truncate">
        {user.name}
      </span>
    </Link>
  );
}

// Componente da Página
export function SearchPage() {
  const navigate = useNavigate();
  // Estado para o input imediato
  const [searchTerm, setSearchTerm] = useState('');
  // Estado "atrasado" (500ms) para usar na query
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: users,
    isLoading,
    isError,
    isFetching,
  } = useSearchUsers(debouncedSearchTerm);

  const handleClear = () => {
    setSearchTerm('');
  };

  const renderContent = () => {
    if (isLoading || (isFetching && !users)) {
      return (
        <div className="flex justify-center items-center pt-10">
          <FiLoader className="animate-spin text-purple-400 text-4xl" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center text-red-400 pt-8">
          <h3 className="font-semibold">Erro ao realizar a busca.</h3>
        </div>
      );
    }

    if (debouncedSearchTerm.length > 1 && users?.length === 0) {
      return (
        <div className="text-center text-gray-500 pt-8">
          <h2 className="text-lg font-semibold">Nenhum usuário encontrado</h2>
          <p className="mt-2">Tente um nome diferente.</p>
        </div>
      );
    }

    if (users && users.length > 0) {
      return (
        <div className="space-y-3">
          {users.map((user) => (
            <SearchResultItem key={user.id} user={user} />
          ))}
        </div>
      );
    }

    // Estado inicial (antes de 2+ chars)
    return (
      <div className="text-center text-gray-500 pt-8">
        <FiSearch className="mx-auto text-4xl mb-2" />
        <h2 className="text-lg font-semibold">Encontre usuários</h2>
        <p className="mt-2">Digite o nome de quem você procura.</p>
      </div>
    );
  };

  return (
    <div className="p-4 text-white max-w-lg mx-auto h-full flex flex-col">
      {/* 1. Cabeçalho Fixo */}
      <header className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => navigate(-1)} // Botão de voltar
          className="p-2 text-gray-300 hover:text-white"
        >
          <FiArrowLeft className="w-6 h-6" />
        </button>
        {/* Barra de Busca */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white placeholder-gray-500 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. Área de Conteúdo */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}