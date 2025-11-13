// src/features/chat/components/SendMessageModal.tsx

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useCreateOrGetConversation } from '../hooks/useChatMutations';
import { Profile } from '@/types/profile.types';

export function SendMessageModal({
  isOpen,
  onClose,
  targetUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  targetUser: Profile;
}) {
  const [content, setContent] = useState('');
  
  const { mutate: sendMessage, isPending } = useCreateOrGetConversation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    sendMessage(
      { targetUserId: targetUser.userId, content: content.trim() },
      {
        // --- INÍCIO DA ATUALIZAÇÃO ---
        onSuccess: () => {
          // onClose(); // REMOVIDO (Não fecha mais o modal)
          setContent(''); // APENAS limpa o input
        },
        // --- FIM DA ATUALIZAÇÃO ---
      },
    );
  };

  const avatarUrl = targetUser.imageUrl 
    ? `${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '')}/${targetUser.imageUrl}`
    : '/default-avatar.png';

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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 shadow-xl transition-all">
                {/* Header */}
                <div className="relative flex-shrink-0 border-b border-gray-700 p-4">
                  <Dialog.Title className="text-center text-lg font-semibold text-white">
                    Enviar Mensagem
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="absolute right-3 top-3.5 rounded-full p-2 text-gray-400 hover:bg-gray-700"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Perfil do Destinatário */}
                <div className="flex items-center gap-3 p-4">
                  <img 
                    src={avatarUrl} 
                    alt={targetUser.user?.name} 
                    className="h-10 w-10 rounded-full bg-gray-700 object-cover"
                  />
                  <div className="text-sm">
                    <p className="text-gray-400">Para:</p>
                    <p className="font-semibold text-white">{targetUser.user?.name}</p>
                  </div>
                </div>

                {/* Caixa de Mensagem */}
                <form onSubmit={handleSubmit} className="flex flex-col">
                  <div className="p-4">
                    <textarea
                      rows={5}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={`Escreva a sua primeira mensagem para ${targetUser.user?.name}...`}
                      disabled={isPending}
                      className="w-full rounded-md border-none bg-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                    />
                  </div>
                  
                  {/* Botão Enviar */}
                  <div className="flex justify-end border-t border-gray-700 bg-gray-800/50 p-4 rounded-b-xl">
                    <button
                      type="submit"
                      disabled={!content.trim() || isPending}
                      className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 enabled:hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {isPending ? (
                        'A enviar...'
                      ) : (
                        <>
                          Enviar <PaperAirplaneIcon className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}