// src/components/common/Modal.tsx

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      {/* 1. Invólucro Principal: z-60
         (Isto coloca o modal acima da gaveta de comentários, que está em z-50) */}
      <Dialog as="div" className="relative z-60" onClose={onClose}>
        
        {/* 2. Overlay (Fundo Preto)
            Deve ter o mesmo z-index que o invólucro */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60" /> 
          {/* <-- z-60 ADICIONADO AQUI */}
        </Transition.Child>

        {/* 3. Conteúdo do Modal
            Deve ter um z-index *superior* ao do overlay */}
        <div className="fixed inset-0 overflow-y-auto z-70"> 
        {/* <-- z-70 ADICIONADO AQUI */}
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white mb-4"
                  >
                    {title}
                  </Dialog.Title>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};