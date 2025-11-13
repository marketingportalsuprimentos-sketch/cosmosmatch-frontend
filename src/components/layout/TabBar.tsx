// src/components/layout/TabBar.tsx

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  SparklesIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  SparklesIcon as SparklesIconSolid,
  ChatBubbleOvalLeftEllipsisIcon as ChatIconSolid,
  UserIcon as UserIconSolid,
  PlusIcon,
} from '@heroicons/react/24/solid';

import { NewPostModal } from '../../features/feed/components/NewPostModal';

// --- INÍCIO DA ATUALIZAÇÃO (Contadores) ---
// 1. Hook para o contador de Likes (para o ícone de Chat 💬)
import { useGetUnreadLikesCount } from '@/features/profile/hooks/useProfile';
// 2. Hook para o contador de Mensagens (para o ícone de Chat 💬)
import { useGetUnreadMessageCount } from '@/features/chat/hooks/useChatQueries';
// --- FIM DA ATUALIZAÇÃO ---

type NavItemType = {
  path: string;
  label: string;
  Icon: React.ComponentType<{ className: string }>;
  IconSolid: React.ComponentType<{ className: string }>;
};

const navItems: NavItemType[] = [
  {
    path: '/discovery',
    label: 'Descoberta',
    Icon: SparklesIcon,
    IconSolid: SparklesIconSolid,
  },
  {
    path: '/feed',
    label: 'Feed',
    Icon: HomeIcon,
    IconSolid: HomeIconSolid,
  },
  {
    path: '/chat',
    label: 'Chat',
    Icon: ChatBubbleOvalLeftEllipsisIcon,
    IconSolid: ChatIconSolid,
  },
  {
    path: '/profile',
    label: 'Perfil',
    Icon: UserIcon,
    IconSolid: UserIconSolid,
  },
];

// Componente NavItem (Sem alterações)
const NavItem = ({ item }: { item: NavItemType }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      `flex h-full w-full flex-col items-center justify-center p-2 ${
        isActive ? 'text-purple-400' : 'text-gray-400'
      } hover:text-purple-300`
    }
  >
    {({ isActive }) => (
      <>
        {isActive ? (
          <item.IconSolid className="h-7 w-7" />
        ) : (
          <item.Icon className="h-7 w-7" />
        )}
        <span
          className={`mt-1 text-xs font-medium ${
            isActive ? 'text-purple-400' : 'text-gray-400'
          }`}
        >
          {item.label}
        </span>
      </>
    )}
  </NavLink>
);

export function TabBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- INÍCIO DA ATUALIZAÇÃO (Contadores) ---
  
  // 1. Busca a CONTAGEM de likes não lidos
  const { data: unreadLikesData } = useGetUnreadLikesCount();
  const likesCount = unreadLikesData?.count || 0;

  // 2. Busca a CONTAGEM de mensagens não lidas
  const { data: unreadMessagesData } = useGetUnreadMessageCount();
  const messagesCount = unreadMessagesData?.count || 0;
  
  // 3. Soma as duas contagens para o "balão" principal no ícone 💬
  // (Conforme o nosso acordo de fluxo da "Caixa de Entrada")
  const totalUnreadCount = likesCount + messagesCount;
  
  // --- FIM DA ATUALIZAÇÃO ---


  return (
    <>
      <nav className="sticky bottom-0 w-full border-t border-gray-700 bg-gray-900">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around">
          
          {navItems.slice(0, 2).map((item) => (
            <NavItem key={item.path} item={item} />
          ))}

          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Criar novo post"
            className="flex h-12 w-12 items-center justify-center rounded-full
                       bg-purple-500 text-white shadow-lg
                       transition-all duration-200 hover:bg-purple-400
                       focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <PlusIcon className="h-8 w-8" />
          </button>

          {/* --- INÍCIO DA ALTERAÇÃO (Lógica do "Balão") --- */}
          {navItems.slice(2, 4).map((item) => {
            // Caso especial: Ícone de Chat (precisa do "balão")
            if (item.path === '/chat') {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative flex h-full w-full flex-col items-center justify-center p-2 ${
                      isActive ? 'text-purple-400' : 'text-gray-400'
                    } hover:text-purple-300`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <item.IconSolid className="h-7 w-7" />
                      ) : (
                        <item.Icon className="h-7 w-7" />
                      )}
                      <span
                        className={`mt-1 text-xs font-medium ${
                          isActive ? 'text-purple-400' : 'text-gray-400'
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* O "Balão" (Badge) de Notificação */}
                      {/* Esta lógica agora usa o 'totalUnreadCount' (Likes + Mensagens) */}
                      {totalUnreadCount > 0 && (
                        <span 
                          className="absolute top-1 right-5 flex h-5 w-5 
                                     items-center justify-center rounded-full 
                                     bg-purple-600 text-xs font-bold text-white"
                        >
                          {totalUnreadCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            }

            // Caso padrão: Ícone de Perfil
            return <NavItem key={item.path} item={item} />;
          })}
          {/* --- FIM DA ALTERAÇÃO --- */}

        </div>
      </nav>

      <NewPostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}