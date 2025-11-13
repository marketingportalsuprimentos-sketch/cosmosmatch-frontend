// src/components/common/PaywallModal.tsx

import { Modal } from './Modal';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/solid'; // Um ícone bonito

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string; // Mensagem vinda do backend (ex: 402)
}

export const PaywallModal = ({ isOpen, onClose, message }: PaywallModalProps) => {
  const navigate = useNavigate();

  // --- INÍCIO DA ATUALIZAÇÃO ---
  const handleUpgradeClick = () => {
    onClose(); // Fecha o modal
    // Navega para a página de pagamentos que criámos
    navigate('/premium'); 
    // A linha do 'alert' foi removida
  };
  // --- FIM DA ATUALIZAÇÃO ---

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 sm:mx-0 sm:h-10 sm:w-10">
          <SparklesIcon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        
        <h3 className="text-lg font-semibold leading-6 text-white mt-4" id="modal-title">
          Limite de Contactos Atingido
        </h3>
        
        <div className="mt-2">
          <p className="text-sm text-gray-400">
            {/* Mensagem de fallback caso o backend não envie uma */}
            {message || 'Você atingiu o limite de 3 contactos gratuitos (comentários ou mensagens) para utilizadores Free.'}
          </p>
          <p className="text-sm text-gray-300 mt-3 font-medium">
            Para enviar mensagens e comentar ilimitadamente, torne-se Premium.
          </p>
        </div>

        <div className="mt-6 w-full">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-base font-medium text-white hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 focus:ring-offset-gray-800"
            onClick={handleUpgradeClick}
          >
            Tornar-se Premium
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-700 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};