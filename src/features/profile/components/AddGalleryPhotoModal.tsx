// src/features/profile/components/AddGalleryPhotoModal.tsx

import { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAddPhotoToGallery } from '../hooks/useProfile';

interface AddGalleryPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGalleryPhotoModal({ isOpen, onClose }: AddGalleryPhotoModalProps) {
  // 1. Usa o hook correto, que descobrimos no 'useProfile.ts'
  const { mutate: addPhotoMutate, isPending, error: mutationError } = useAddPhotoToGallery();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpa o estado quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
    }
  }, [isOpen]);

  // Lida com a seleção do arquivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setError(null);

    // Validação de tipo (só imagens)
    if (!file.type.startsWith('image/')) {
      setError('Apenas arquivos de imagem são permitidos.');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);

    // Gera o preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Lida com o envio
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || isPending || !!error) return;

    // 2. Chama o 'mutate' do hook 'useAddPhotoToGallery'
    addPhotoMutate(selectedFile, {
      onSuccess: () => {
        onClose(); // Fecha o modal em caso de sucesso
      },
      onError: (err: any) => {
         const apiError = (err as any)?.response?.data?.message || 'Erro desconhecido.';
         setError(`Falha ao adicionar foto: ${apiError}`);
      }
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        {/* Conteúdo do Modal */}
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white flex justify-between items-center"
                >
                  Adicionar Foto à Galeria
                  <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* Área de Preview */}
                  <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview da foto" 
                        className="object-cover w-full h-full" 
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <PhotoIcon className="mx-auto h-12 w-12" />
                        <p className="mt-2 text-sm">Selecione uma foto</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      disabled={isPending}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                      {previewUrl ? 'Trocar Foto' : 'Selecionar Foto'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*" // Apenas imagens
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Erros */}
                  {(error || mutationError) && (
                    <div className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">
                      {error || (mutationError as Error)?.message}
                    </div>
                  )}

                  {/* Botão de Envio */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={!selectedFile || isPending || !!error}
                      className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? 'A carregar...' : 'Adicionar à Galeria'}
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