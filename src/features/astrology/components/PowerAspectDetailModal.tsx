// frontend/src/features/astrology/components/PowerAspectDetailModal.tsx

import React, { Fragment, useRef, useState } from 'react'; 
import html2canvas from 'html2canvas';
import { PowerAspect } from '@/types/profile.types';
import { Modal } from '@/components/common/Modal'; 
import { Transition } from '@headlessui/react'; 
import {
  ShareIcon,
  BriefcaseIcon,
  StarIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from '@/lib/toast';

interface PowerAspectDetailModalProps {
  card: PowerAspect | null; 
  onClose: () => void; 
}

/**
 * Mapeia a string de ícone vinda do backend para um componente de ícone real.
 */
const getIconComponent = (iconName: string): React.FC<React.ComponentProps<'svg'>> => {
  const iconMap: { [key: string]: React.FC<React.ComponentProps<'svg'>> } = {
    briefcase: BriefcaseIcon,
    star: StarIcon,
    heart: HeartIcon,
    shield: ShieldCheckIcon,
    sun: SunIcon,
    moon: MoonIcon,
    user: UserIcon,
  };
  return iconMap[iconName] || SparklesIcon;
};

export const PowerAspectDetailModal: React.FC<PowerAspectDetailModalProps> = ({ card, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  if (!card) return null; 

  const IconComponent = getIconComponent(card.icon);

  // --- Lógica de Partilha V3 (Movida para aqui) ---
  const handleShare = async () => {
    if (!cardRef.current || isSharing) return;
  
    setIsSharing(true);
    toast.info('A gerar imagem da carta...');
  
    try {
      if (document.fonts?.ready) await document.fonts.ready;
  
      const original = cardRef.current; // Agora aponta para o conteúdo do modal
  
      // Clonar o conteúdo do modal
      const clone = original.cloneNode(true) as HTMLElement;
      clone.id = `print-card-${card.id}`;
      clone.style.position = 'fixed';
      clone.style.left = '-10000px';
      clone.style.top = '0';
      clone.style.zIndex = '-1';
      clone.style.width = `${original.offsetWidth}px`;
  
      // libera crescimento
      clone.classList.remove('overflow-hidden');
  
      // remove clamp/overflow do texto no clone
      clone.querySelectorAll('.share-clamp').forEach((el) => {
        const e = el as HTMLElement;
        e.classList.remove('line-clamp-3');
        e.style.overflow = 'visible';
        (e.style as any).webkitLineClamp = 'unset';
        e.style.display = 'block';
        e.style.maxHeight = 'none';
      });
  
      // garante que o watermark apareça (um pouco mais forte se quiser)
      clone.querySelectorAll('[data-watermark]').forEach((el) => {
        (el as HTMLElement).style.opacity = '0.08';
      });
  
      // o botão já é ignorado via data-html2canvas-ignore, mas removemos por garantia
      clone.querySelectorAll('[data-html2canvas-ignore="true"]').forEach((el) => (el as HTMLElement).remove());
  
      // põe na página para o layout "assentar"
      document.body.appendChild(clone);
      await new Promise((r) => requestAnimationFrame(r)); // 1 frame
  
      // **força altura igual ao conteúdo total**
      clone.style.height = 'auto';
      const fullHeight = Math.max(clone.scrollHeight, clone.offsetHeight);
      clone.style.height = `${fullHeight}px`;
  
      // render do CLONE (sem width/height no options; o html2canvas mede do DOM)
      const canvas = await html2canvas(clone, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      });
  
      document.body.removeChild(clone);
  
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('Não foi possível converter a carta em imagem.');
  
      const file = new File([blob], 'cosmosmatch_card.png', { type: blob.type });
      const shareLink = 'https://cosmosmatch.app/register';
      const shareText = `Vi esta carta no CosmosMatch e lembrei-me de ti! Descobre as tuas aqui: ${shareLink}`;
      const shareTitle = `Minha Carta CosmosMatch: ${card.title}`;
  
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: shareTitle, text: shareText });
      } else {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `cosmosmatch_card_${card.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Imagem da carta guardada!');
      }
    } catch (err) {
      console.error('Erro ao partilhar:', err);
      toast.error('Não foi possível partilhar a carta.');
    } finally {
      setIsSharing(false);
    }
  };
  // --- Fim da Lógica de Partilha ---

  const getShareIcon = () => {
    if (isSharing) return <ArrowPathIcon className="w-5 h-5 animate-spin" />;
    if (typeof navigator.share === 'undefined') return <ArrowDownTrayIcon className="w-5 h-5" />;
    return <ShareIcon className="w-5 h-5" />;
  };

  const shareLabel = typeof navigator.share === 'undefined' ? 'Guardar Imagem' : 'Partilhar Carta';

  return (
    <Modal isOpen={!!card} onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        {/* --- INÍCIO DA CORREÇÃO DO "X" --- */}
        {/* 1. O container agora é 'relative' para posicionar o 'X' */}
        <div className="p-2 relative"> 
          
          {/* 2. O botão 'X' foi MOVIDO para aqui (fora do 'ref' do print) */}
          <button
            onClick={onClose}
            className="
              absolute top-0 right-0 p-1.5 rounded-full 
              text-gray-400 bg-gray-900 bg-opacity-30 
              hover:bg-gray-700 hover:text-indigo-300 
              transition-colors z-50 backdrop-blur-sm
            "
            aria-label="Fechar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          {/* --- FIM DA CORREÇÃO DO "X" --- */}

          {/* O Cartão (Repetido, mas sem line-clamp) */}
          <div
            ref={cardRef} // A "câmera" aponta para este div
            className="
              w-full max-w-sm 
              bg-gradient-to-br from-gray-800 to-gray-900 
              rounded-xl shadow-lg 
              p-6 
              relative 
              overflow-hidden 
              border border-gray-700
            "
          >
            {/* O "X" FOI REMOVIDO DE DENTRO DO CARTÃO */}

            {/* 1. Marca d'água */}
            <IconComponent
              data-watermark
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 text-white opacity-5 z-0 pointer-events-none"
            />

            {/* 2. Conteúdo */}
            <div className="relative z-10 flex flex-col">
              {/* Título */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-900 bg-opacity-70 rounded-lg backdrop-blur-sm">
                  <IconComponent className="w-8 h-8 text-indigo-300" />
                </div>
                <h4 className="text-2xl font-bold text-white">{card.title}</h4>
              </div>

              {/* Descrição (COMPLETA, SEM line-clamp) */}
              <p className="text-md text-gray-300">
                {card.description}
              </p>
            </div>
          </div>

          {/* 3. O Botão de Partilhar (AGORA FICA AQUI) */}
          <div className="mt-4 flex justify-center">
            <button
              data-html2canvas-ignore="true" // Ignora o botão do print
              onClick={handleShare}
              disabled={isSharing}
              className="
                flex items-center justify-center gap-2 
                px-6 py-3 rounded-lg 
                bg-indigo-600 text-white font-semibold 
                hover:bg-indigo-500 
                transition-colors 
                disabled:opacity-50 disabled:animate-pulse
              "
              aria-label={shareLabel}
            >
              {getShareIcon()}
              <span>{shareLabel}</span>
            </button>
          </div>
        </div>
      </Transition.Child>
    </Modal>
  );
};