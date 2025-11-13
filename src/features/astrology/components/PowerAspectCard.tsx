// frontend/src/features/astrology/components/PowerAspectCard.tsx

import React from 'react';
// import html2canvas from 'html2canvas'; // REMOVIDO
import { PowerAspect } from '@/types/profile.types';
import {
  // ShareIcon, // REMOVIDO
  BriefcaseIcon,
  StarIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  // ArrowPathIcon, // REMOVIDO
  // ArrowDownTrayIcon, // REMOVIDO
} from '@heroicons/react/24/outline';
// import { toast } from '@/lib/toast'; // REMOVIDO

// --- IMPORTAÇÕES ERRADAS QUE CAUSARAM O BUILD (REMOVIDAS) ---
// import { useGetMyNatalChart } from '../features/profile/hooks/useProfile'; // REMOVIDO
// import { PowerAspectCard } from '@/features/astrology/components/PowerAspectCard'; // REMOVIDO
// import { PowerAspectDetailModal } from '@/features/astrology/components/PowerAspectDetailModal'; // REMOVIDO


interface PowerAspectCardProps {
  card: PowerAspect;
  onClick: () => void; // <-- Prop para abrir o modal
}

/**
 * Mapeia a string de ícone vinda do backend para um componente de ícone real.
 */
const getIconComponent = (iconName: string): React.FC<React.ComponentProps<'svg'>> => {
  const iconMap: { [key: string]: React.FC<React.ComponentProps<'svg'>> } = {
    // Ícones Raros
    briefcase: BriefcaseIcon,
    star: StarIcon,
    heart: HeartIcon,
    shield: ShieldCheckIcon,
    // Ícones Essenciais
    sun: SunIcon,
    moon: MoonIcon,
    user: UserIcon,
  };
  return iconMap[iconName] || SparklesIcon; // Retorna SparklesIcon como fallback
};

export const PowerAspectCard: React.FC<PowerAspectCardProps> = ({ card, onClick }) => {
  const IconComponent = getIconComponent(card.icon);
  // --- TODA A LÓGICA DE SHARE (useState, useRef, handleShare) FOI REMOVIDA ---

  return (
    // --- ALTERADO DE <div> PARA <button> ---
    <button
      onClick={onClick}
      // id={`power-card-${card.id}`} // Já não é necessário para o print
      // ref={cardRef} // Já não é necessário
      className="
        flex-shrink-0 
        w-64 md:w-72 
        bg-gradient-to-br from-gray-800 to-gray-900 
        rounded-xl shadow-lg 
        p-4 
        relative 
        overflow-hidden 
        border border-gray-700
        text-left 
        hover:border-indigo-500 
        transition-colors
      "
    >
      
      {/* 1. Marca d'água do Ícone (Atrás) */}
      <IconComponent
        data-watermark
        className="
          absolute 
          top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-32 h-32 
          text-white opacity-5 
          z-0 
          pointer-events-none
        "
      />

      {/* 2. Botão de Partilhar (REMOVIDO) */}

      {/* 3. Conteúdo (Frente, layout flex) */}
      <div className="relative z-10 flex flex-col"> 
        {/* Secção do Ícone e Título (Topo) */}
        <div className="flex items-center gap-3 mb-3">
          <div className="
            p-2 
            bg-gray-900 bg-opacity-70 
            rounded-lg 
            backdrop-blur-sm
          ">
            <IconComponent className="w-6 h-6 text-indigo-300" />
          </div>
          <h4 className="text-lg font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
            {card.title}
          </h4>
        </div>

        {/* Descrição (Baixo) - Classe "share-clamp" mantida para o line-clamp */}
        <p className="text-sm text-gray-300 line-clamp-3 share-clamp">
          {card.description}
        </p>
      </div>
    </button>
  );
};