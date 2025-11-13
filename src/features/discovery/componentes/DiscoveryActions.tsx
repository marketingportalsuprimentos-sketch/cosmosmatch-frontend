// src/features/discovery/componentes/DiscoveryActions.tsx

import { useState } from 'react';
import {
  XMarkIcon,
  HeartIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/solid';

// Definimos as Props que o componente espera
interface DiscoveryActionsProps {
  onSkip: () => void;
  onLike: () => void;
  onSendMessage: (message: string) => void;
  // Props adicionadas para controlar o estado de loading/disabled
  isLiking?: boolean;
  isSendingIcebreaker?: boolean;
}

export function DiscoveryActions({
  onSkip,
  onLike,
  onSendMessage,
  isLiking = false, // Valor default
  isSendingIcebreaker = false, // Valor default
}: DiscoveryActionsProps) {
  // Estado local para guardar a "Mensagem Quebra-Gelo"
  const [message, setMessage] = useState('');

  // Flag geral de "carregando"
  const isLoading = isLiking || isSendingIcebreaker;

  // Função para lidar com o envio da mensagem
  const handleSendClick = () => {
    if (message.trim() && !isLoading) { // Só envia se não estiver carregando
      onSendMessage(message);
      setMessage(''); // Limpa o input depois de enviar
    }
  };

  // Função para lidar com o "Enter" no teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  // --- INÍCIO DA CORREÇÃO (Layout de Linha Única) ---
  return (
    // 1. Mudado de 'flex-col' para 'flex-row' e 'items-center'
    <div className="flex w-full items-center gap-3">
      
      {/* 2. Botão [X] Pular (Tamanho "harmonizado") */}
      <button
        onClick={onSkip}
        aria-label="Pular"
        disabled={isLoading} 
        // h-16 w-16 -> h-12 w-12 (para alinhar com o input)
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full
                   border-2 border-gray-500 bg-gray-800/50 text-gray-500
                   backdrop-blur-sm transition-all hover:enabled:bg-gray-700
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <XMarkIcon className="h-8 w-8" /> {/* h-10 -> h-8 */}
      </button>

      {/* 3. Área da Mensagem (Input + Botão Avião) */}
      {/* Este 'div' cresce (flex-1) e contém o input E o botão de enviar */}
      <div className="relative flex-1">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Envie uma mensagem..."
          disabled={isLoading} 
          // py-3 -> h-12 (altura fixa)
          // Adicionado pr-12 para dar espaço ao botão de enviar
          className="w-full h-12 rounded-full border-none bg-gray-700 px-4 pr-12
                     text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-400
                     disabled:opacity-50"
        />
        <button
          onClick={handleSendClick}
          aria-label="Enviar mensagem"
          disabled={!message.trim() || isLoading}
          // Botão posicionado ABSOLUTAMENTE dentro do 'div' relativo
          // h-12 w-12 -> h-10 w-10 (para caber dentro do input)
          className="absolute right-1 top-1/2 -translate-y-1/2 
                     flex h-10 w-10 items-center justify-center rounded-full
                     bg-purple-500 text-white
                     transition-all duration-200
                     enabled:hover:bg-purple-400
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="h-5 w-5" /> {/* h-6 -> h-5 */}
        </button>
      </div>

      {/* 4. Botão [❤️] Gostar (Tamanho "harmonizado") */}
      <button
        onClick={onLike}
        aria-label="Gostar"
        disabled={isLoading} 
        // h-16 w-16 -> h-12 w-12 (para alinhar com o input)
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full
                   border-2 border-purple-400 bg-gray-800/50 text-purple-400
                   backdrop-blur-sm transition-all hover:enabled:bg-purple-500/20
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HeartIcon className="h-7 w-7" /> {/* h-9 -> h-7 */}
      </button>
    </div>
    // --- FIM DA CORREÇÃO ---
  );
}