// frontend/src/features/feed/components/ReportPostModal.tsx

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { reportPost, ReportReason } from '../services/feedApi';
import { toast } from 'sonner';

interface ReportPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

// Mapeamento exato do seu print para o Enum do Backend
const REPORT_OPTIONS = [
  { label: 'Simplesmente não gostei', value: ReportReason.DISLIKE },
  { label: 'Bullying ou contato indesejado', value: ReportReason.BULLYING },
  { label: 'Suicídio, automutilação ou distúrbios alimentares', value: ReportReason.SELF_HARM },
  { label: 'Violência, ódio ou exploração', value: ReportReason.VIOLENCE },
  { label: 'Venda ou promoção de itens restritos', value: ReportReason.RESTRICTED_ITEMS },
  { label: 'Nudez ou atividade sexual', value: ReportReason.NUDITY },
  { label: 'Golpe, fraude ou spam', value: ReportReason.SPAM_SCAM },
  { label: 'Informação falsa', value: ReportReason.FALSE_INFO },
];

export function ReportPostModal({ isOpen, onClose, postId }: ReportPostModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async (reason: ReportReason) => {
    if (!postId) return;

    try {
      setIsSubmitting(true);
      await reportPost(postId, { reason });
      
      toast.success('Denúncia enviada.', {
        description: 'Obrigado por ajudar a manter a comunidade segura. Iremos analisar.',
        duration: 4000,
      });
      
      onClose(); // Fecha o modal
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar denúncia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 text-left align-middle shadow-xl transition-all border border-gray-700">
                
                {/* Cabeçalho */}
                <div className="flex items-center justify-between border-b border-gray-800 p-4">
                  <div className="w-6" /> {/* Espaçador para centralizar */}
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-white"
                  >
                    Denunciar
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Pergunta */}
                <div className="bg-gray-800/50 p-4 border-b border-gray-800">
                  <p className="text-sm font-medium text-gray-300">
                    Por que você está denunciando esse post?
                  </p>
                </div>

                {/* Lista de Opções */}
                <div className="divide-y divide-gray-800 max-h-[60vh] overflow-y-auto">
                  {REPORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      disabled={isSubmitting}
                      onClick={() => handleReport(option.value)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-gray-200 group-hover:text-white">
                        {option.label}
                      </span>
                      <ChevronRightIcon className="h-4 w-4 text-gray-600 group-hover:text-gray-400" />
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-gray-900 text-center">
                  <p className="text-xs text-gray-500">
                    Seu reporte é anônimo, exceto se estiver reportando uma infração de propriedade intelectual.
                  </p>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}