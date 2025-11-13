// src/features/feed/components/NewPostModal.tsx
import { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PhotoIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCreatePost } from '../hooks/useFeed';
import { MediaType } from '../services/feedApi';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
};

export function NewPostModal({ isOpen, onClose }: NewPostModalProps) {
  const { mutate: createPostMutate, isPending: isCreatingPost } = useCreatePost();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      setMediaType(null);
      setVideoDuration(null);
      setError(null);
    }
  }, [isOpen]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setMediaType(null);
      return;
    }

    setError(null);
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      setMediaType(MediaType.PHOTO);
      setVideoDuration(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

    } else if (file.type.startsWith('video/')) {
      setMediaType(MediaType.VIDEO);
      
      try {
        const duration = await getVideoDuration(file);
        
        if (duration < 3 || duration > 6.99) {
          setError(`O vídeo deve ter entre 3 e 6 segundos. (Duração: ${duration.toFixed(1)}s)`);
          setSelectedFile(null);
          setPreviewUrl(null);
          return;
        }
        
        setVideoDuration(Math.round(duration));
        setPreviewUrl(URL.createObjectURL(file));

      } catch (err) {
        setError('Não foi possível ler a duração do vídeo.');
        setSelectedFile(null);
      }
      
    } else {
      setError('Tipo de ficheiro não suportado. Use fotos ou vídeos (MP4, QuickTime).');
      setSelectedFile(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !mediaType || isCreatingPost || !!error) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);
      formData.append('mediaType', mediaType);
      
      if (caption.trim()) {
        formData.append('content', caption.trim());
      }
      
      if (mediaType === MediaType.VIDEO && videoDuration) {
        formData.append('videoDuration', videoDuration.toString());
      }

      // --- 1. LOG ADICIONADO AQUI ---
      console.log('--- [NewPostModal] Enviando FormData ---');
      // Iterar sobre o FormData para logar os valores
      // (O 'file' pode aparecer como um objeto File, o que é normal)
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('-----------------------------------------');
      // --- FIM DO LOG ---

      createPostMutate(formData, {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          const apiError = (err as any)?.response?.data?.message || 'Erro desconhecido.';
          setError(`Falha ao publicar: ${apiError}`);
        }
      });

    } catch (err) {
       console.error("Erro ao preparar post:", err);
       setError('Erro ao preparar o post.');
    }
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
                  Criar Novo Post Cósmico ✨
                  <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {previewUrl ? (
                      mediaType === MediaType.VIDEO ? (
                        <video 
                          src={previewUrl} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <img 
                          src={previewUrl} 
                          alt="Preview do post" 
                          className="object-cover w-full h-full" 
                        />
                      )
                    ) : (
                      <div className="text-center text-gray-400">
                        <PhotoIcon className="mx-auto h-10 w-10" />
                        <VideoCameraIcon className="mx-auto h-10 w-10 mt-1" />
                        <p className="mt-2 text-sm">Selecione uma foto ou vídeo</p>
                        <p className="text-xs">(Vídeos de 3 a 6 segundos)</p>
                      </div>
                    )}
                     <button
                      type="button"
                      onClick={triggerFileSelect}
                      disabled={isCreatingPost}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                      {previewUrl ? 'Trocar Mídia' : 'Selecionar Mídia'}
                    </button>
                    <input
                      ref={fileInputRef}
                      id="post-media-upload"
                      type="file"
                      accept="image/*,video/mp4,video/quicktime,video/x-m4v"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  
                  {error && (
                    <div className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="caption" className="sr-only">Legenda</label>
                    <textarea
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                      placeholder="Adicione uma legenda... (opcional)"
                      maxLength={500}
                      disabled={isCreatingPost}
                    />
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={!selectedFile || isCreatingPost || !!error}
                      className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingPost ? 'A publicar...' : 'Publicar Post'}
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