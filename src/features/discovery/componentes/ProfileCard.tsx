// src/features/discovery/componentes/ProfileCard.tsx
// (COLE ISTO NO SEU ARQUIVO)

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import type { PanInfo } from 'framer-motion';

// --- INÍCIO DA ADIÇÃO (Lupa) ---
import { Link } from 'react-router-dom'; // 1. Importar o Link
import {
  MapPinIcon,
  SparklesIcon,
  SunIcon,
  UserPlusIcon,
  UserMinusIcon,
  MagnifyingGlassIcon, // 2. Importar o ícone da Lupa
} from '@heroicons/react/24/solid';
// --- FIM DA ADIÇÃO ---

import type { DiscoveryProfile } from '@/features/discovery/services/discoveryApi';

import { useAuth } from '@/contexts/AuthContext';
import {
  useGetFollowing,
  useFollowUser,
  useUnfollowUser,
} from '@/features/profile/hooks/useProfile';

interface ProfileCardProps {
  profile: DiscoveryProfile;
  onSwipe: (profileId: string) => void;
  onTap: (profileId: string) => void; 
}

const SWIPE_THRESHOLD = 100;

// --- INÍCIO DA CORREÇÃO (Bug do localhost) ---
// A constante BACKEND_URL foi REMOVIDA. Ela estava a causar o bug
// ao adicionar "http://localhost:3000" ao URL do Cloudinary.
// const BACKEND_URL = 'http://localhost:3000'; // <-- REMOVIDO
// --- FIM DA CORREÇÃO ---

export function ProfileCard({ profile, onSwipe, onTap }: ProfileCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);

  const isDraggingRef = useRef(false);

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      onSwipe(profile.userId);
    }
    
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 10); 
  };

  // (Lógica do Botão "Conectar" - sem alterações)
  const { user: loggedInUser } = useAuth();
  const targetUserId = profile.userId;
  
  const { data: followingList, isLoading: isLoadingFollowing } = useGetFollowing(
    loggedInUser?.id,
    { enabled: !!loggedInUser?.id }
  );
  
  const { mutate: followUser, isPending: isFollowing } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowing } = useUnfollowUser();

  const isAlreadyFollowing = followingList?.some(user => user.id === targetUserId);
  const isConnectLoading = isFollowing || isUnfollowing || isLoadingFollowing;

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isConnectLoading || !targetUserId) return;
    if (isAlreadyFollowing) {
      unfollowUser(targetUserId);
    } else {
      followUser(targetUserId);
    }
  };

  // (Lógica de dados - sem alterações)
  // --- ATUALIZAÇÃO ---
  // A cidade aqui DEVE ser a 'currentCity', pois é o que o filtro usa.
  // O seu 'discovery.service' já está a enviar 'currentCity'.
  const displayCity = profile.profile?.currentCity ?? 'N/A';
  // --- FIM DA ATUALIZAÇÃO ---
  
  // --- INÍCIO DA CORREÇÃO (Bug do localhost) ---
  // A lógica foi simplificada. O imageUrl agora vem completo
  // do Cloudinary (ex: "https://res.cloudinary.com/...")
  // e é usado diretamente.
  const imageUrl = profile.profile?.imageUrl ?? null;
  // --- FIM DA CORREÇÃO ---

  const compatibilityScore = profile.compatibility?.score ?? 0;
  const name = profile.name ?? 'Usuário';
  
  // --- ATUALIZAÇÃO (Bug do SunSign) ---
  // O 'sunSign' vem direto do 'discovery.service', não está dentro
  // de 'natalChart' na resposta da API.
  const sunSign = profile.profile?.sunSign ?? 'N/A';
  // --- FIM DA ATUALIZAÇÃO ---
  
  return (
    <motion.div
      className="relative z-5 h-full w-full overflow-hidden rounded-2xl shadow-lg bg-gray-700 flex flex-col"
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin={true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    >
      {/* (Imagem de Fundo - sem alterações) */}
      {imageUrl ? (
        <div
          className="w-full flex-1 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }} 
        />
      ) : (
        <div className="flex-1 w-full bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Sem imagem</span>
        </div>
      )}

      {/* Afinidade (Canto Esquerdo) */}
      <div className="absolute left-4 top-4 z-10">
        <div
          className="flex items-center gap-2 rounded-full
                        bg-gray-950/70 px-4 py-2
                        backdrop-blur-sm"
        >
          <SparklesIcon className="h-5 w-5 text-purple-400" />
          <span className="font-medium text-sm text-purple-300">
            Afinidade
          </span>
          <span className="font-bold text-lg text-purple-400">
            {compatibilityScore}%
          </span>
        </div>
      </div>

      {/* --- INÍCIO DA ADIÇÃO (Lupa - Canto Direito) --- */}
      {/* 3. Adicionar o <Link> para /search */}
      <div className="absolute right-4 top-4 z-10">
        <Link
          to="/search"
          onClick={(e) => e.stopPropagation()} // Impede o "arrastar" do card
          className="flex items-center justify-center rounded-full
                     w-10 h-10 // Tamanho do botão
                     bg-gray-950/70 
                     backdrop-blur-sm
                     text-white
                     hover:bg-gray-700
                     transition-colors"
          aria-label="Buscar usuários"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </Link>
      </div>
      {/* --- FIM DA ADIÇÃO --- */}


      {/* (Gradiente - sem alterações) */}
      <div className="absolute bottom-0 h-1/2 w-full
                      bg-gradient-to-t from-black/80 to-transparent" />

      {/* Informações do Perfil */}
      <div className="absolute bottom-0 z-10 px-6 pt-6 pb-8 text-white w-full">
        
        {/* Nome Clicável (sem alterações) */}
        <h2 
          className="text-3xl font-bold truncate cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            if (!isDraggingRef.current) {
               onTap(profile.userId);
            }
          }}
        >
          {name}
        </h2>

        <div className="mt-1 flex flex-col gap-1 text-lg text-gray-200">
          {sunSign !== 'N/A' && (
            <div className="flex items-center gap-2">
              <SunIcon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{sunSign}</span>
            </div>
          )}
          
          {/* --- ATUALIZAÇÃO (Mostrar a cidade correta) --- */}
          {displayCity !== 'N/A' && (
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{displayCity}</span>
            </div>
          )}
          {/* --- FIM DA ATUALIZAÇÃO --- */}
          
        </div>
        
        {/* Botão Conectar (sem alterações) */}
        <div className="mt-4">
          <button
            onClick={handleConnectClick}
            disabled={isConnectLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors
              ${isAlreadyFollowing
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }
              ${isConnectLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isAlreadyFollowing ? (
              <UserMinusIcon className="w-5 h-5" />
            ) : (
              <UserPlusIcon className="w-5 h-B5" />
            )}
            {isAlreadyFollowing ? 'Seguindo' : 'Conectar'}
          </button>
        </div>
        
      </div>
    </motion.div>
  );
}