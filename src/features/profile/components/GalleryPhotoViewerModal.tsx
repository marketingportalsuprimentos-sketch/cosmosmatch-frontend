// src/features/profile/components/GalleryPhotoViewerModal.tsx

import { Fragment, useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { ProfilePhoto } from '../../../types/profile.types';
import {
  HeartIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useSwipeable } from 'react-swipeable';
import {
  useDeletePhotoFromGallery,
  useLikeGalleryPhoto,
  useUnlikeGalleryPhoto,
  useCommentOnGalleryPhoto,
} from '../hooks/useProfile';
// --- INÍCIO DA ADIÇÃO ---
import { GalleryCommentSheet } from './GalleryCommentSheet'; // A nossa nova gaveta
import { AnimatePresence } from 'framer-motion';
// --- FIM DA ADIÇÃO ---

interface GalleryPhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: ProfilePhoto[];
  startIndex?: number;
  isOwnProfile: boolean;
  profileUserId: string; 
}

export const GalleryPhotoViewerModal = ({
  isOpen,
  onClose,
  photos,
  startIndex = 0,
  isOwnProfile,
  profileUserId,
}: GalleryPhotoViewerModalProps) => {
  if (!photos || photos.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  // --- INÍCIO DA ADIÇÃO ---
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  // --- FIM DA ADIÇÃO ---
  
  const { mutate: deletePhotoMutate, isPending: isDeletingPhoto } =
    useDeletePhotoFromGallery();
    
  const { mutate: likePhotoMutate, isPending: isLikingPhoto } =
    useLikeGalleryPhoto(profileUserId);
  const { mutate: unlikePhotoMutate, isPending: isUnlikingPhoto } =
    useUnlikeGalleryPhoto(profileUserId);
  
  // O hook de comentar não é mais usado aqui, mas sim dentro do 'GalleryCommentSheet'
  // const { mutate: commentPhotoMutate, isPending: isCommentingPhoto } =
  //   useCommentOnGalleryPhoto(profileUserId); // <-- REMOVIDO DAQUI

  useEffect(() => {
    if (isOpen) {
      const newIndex = Math.max(0, Math.min(startIndex, photos.length - 1));
      setCurrentIndex(newIndex);
    } else {
      // Se o modal principal fechar, fecha a gaveta de comentários também
      setIsCommentSheetOpen(false);
    }
  }, [isOpen, startIndex, photos]);

  const goToPrevious = (event?: MouseEvent) => {
    event?.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : photos.length - 1
    );
  };
  const goToNext = (event?: MouseEvent) => {
    event?.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex < photos.length - 1 ? prevIndex + 1 : 0
    );
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNext(),
    onSwipedRight: () => goToPrevious(),
    trackMouse: true,
  });

  const currentPhoto = photos[currentIndex];

  const backendBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
  const fullImageUrl = currentPhoto ? `${backendBaseUrl}/${currentPhoto.url}` : '';

  const handleLikeClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (!currentPhoto || isLikingPhoto || isUnlikingPhoto) return;
    
    if (currentPhoto.isLikedByMe) {
      unlikePhotoMutate(currentPhoto.id);
    } else {
      likePhotoMutate(currentPhoto.id);
    }
  };

  // --- INÍCIO DA ATUALIZAÇÃO ---
  const handleCommentClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (!currentPhoto) return;
    setIsCommentSheetOpen(true); // Abre a gaveta de comentários
  };
  // --- FIM DA ATUALIZAÇÃO ---

  const handleDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (!currentPhoto || isDeletingPhoto) return;

    if (window.confirm('Tem certeza que deseja apagar esta foto?')) {
      deletePhotoMutate(currentPhoto.id, {
        onSuccess: () => {
          if (photos.length === 1) {
            onClose();
          } else {
            if (currentIndex === 0) {
              setCurrentIndex(0);
            } else {
              goToPrevious();
            }
          }
        },
        onError: () => {
          alert('Erro ao apagar a foto. Tente novamente.');
        },
      });
    }
  };

  if (!currentPhoto) return null;

  const likeCount = currentPhoto.likesCount ?? 0;
  const commentCount = currentPhoto.commentsCount ?? 0;


  return (
    <> {/* Usamos Fragment para renderizar o Modal E a Gaveta */}
      <Transition appear show={isOpen} as={Fragment}>
        {/* --- INÍCIO DA CORREÇÃO (Workaround do z-index) --- */}
        {/* Alterado de 'z-50' para 'z-5'
            Isto força o modal da galeria a ficar *atrás* do modal do paywall (z-10) */}
        <Dialog as="div" className="relative z-5" onClose={onClose}>
        {/* --- FIM DA CORREÇÃO --- */}

          {/* Overlay (z-index baixo também) */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75 z-5" />
          </Transition.Child>

          {/* Conteúdo (z-index maior que o overlay, mas menor que o paywall) */}
          <div className="fixed inset-0 overflow-y-auto z-6">
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
                <Dialog.Panel
                  className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all text-white"
                  {...swipeHandlers}
                >
                  {/* Botão Fechar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    aria-label="Fechar"
                    className="absolute top-4 right-4 text-gray-300 hover:text-white focus:outline-none z-20"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    Visualizar Foto
                  </Dialog.Title>

                  {/* Imagem + Setas */}
                  <div className="relative mt-4 group">
                    <img
                      key={currentPhoto.id}
                      src={fullImageUrl}
                      alt="Foto da galeria"
                      className="w-full h-auto object-cover rounded-lg max-h-[70vh] select-none"
                      onError={(e) => {
                         console.warn(`Erro ao carregar imagem no modal: ${fullImageUrl}`);
                         (e.target as HTMLImageElement).alt = 'Erro ao carregar imagem';
                      }}
                    />
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={goToPrevious}
                          aria-label="Foto anterior"
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full 
                                     bg-black/50 p-2 text-white 
                                     opacity-0 transition-opacity group-hover:opacity-100 
                                     hover:bg-black/75 focus:outline-none"
                        >
                          <ChevronLeftIcon className="h-8 w-8" />
                        </button>
                        <button
                          onClick={goToNext}
                          aria-label="Próxima foto"
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full 
                                     bg-black/50 p-2 text-white 
                                     opacity-0 transition-opacity group-hover:opacity-100 
                                     hover:bg-black/75 focus:outline-none"
                        >
                          <ChevronRightIcon className="h-8 w-8" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Ações (Like, Comentário e Apagar) */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={handleLikeClick}
                        disabled={isLikingPhoto || isUnlikingPhoto || isOwnProfile}
                        className={`flex items-center space-x-1 transition-colors disabled:opacity-50 ${
                          currentPhoto.isLikedByMe
                            ? 'text-red-500 hover:text-red-400'
                            : 'text-gray-400 hover:text-red-500'
                        }
                        ${isOwnProfile ? 'cursor-default' : ''}
                        `}
                      >
                        {currentPhoto.isLikedByMe ? (
                          <HeartSolidIcon className="h-6 w-6" />
                        ) : (
                          <HeartIcon className="h-6 w-6" />
                        )}
                        <span>{likeCount}</span>
                      </button>

                      <button
                        onClick={handleCommentClick} // <-- ATUALIZADO
                        // disabled={isCommentingPhoto} // <-- REMOVIDO
                        className="flex items-center space-x-1 text-gray-400 hover:text-blue-500 
                                   transition-colors disabled:opacity-50"
                      >
                        <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
                        <span>{commentCount}</span>
                      </button>
                    </div>

                    {isOwnProfile && (
                      <button
                        onClick={handleDeleteClick}
                        disabled={isDeletingPhoto}
                        className="flex items-center space-x-1 text-gray-400 hover:text-red-500 
                                   transition-colors disabled:opacity-50"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* --- INÍCIO DA ADIÇÃO (Renderização da Gaveta de Comentários) --- */}
      <AnimatePresence>
        {isCommentSheetOpen && currentPhoto && (
          <GalleryCommentSheet
            photoId={currentPhoto.id}
            photoUserId={profileUserId} // Passa o ID do dono do perfil
            onClose={() => setIsCommentSheetOpen(false)}
          />
        )}
      </AnimatePresence>
      {/* --- FIM DA ADIÇÃO --- */}
    </>
  );
};