// src/features/profile/components/ProfileGalleryGrid.tsx
// (COLE ISTO NO SEU ARQUIVO)

import { PlusIcon } from '@heroicons/react/24/solid';
// --- INÍCIO DA ADIÇÃO (Likes) ---
import {
  HeartIcon as HeartIconSolid,
  ChatBubbleOvalLeftIcon,
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import {
  useLikeGalleryPhoto,
  useUnlikeGalleryPhoto,
} from '../hooks/useProfile';
// --- FIM DA ADIÇÃO ---
import type { ProfilePhoto } from '@/types/profile.types';

interface ProfileGalleryGridProps {
  photos: ProfilePhoto[]; // Recebe as fotos como prop
  isOwner: boolean; // Indica se é o perfil do utilizador logado
  
  // --- INÍCIO DA ADIÇÃO ---
  // Precisamos saber de QUEM é este perfil, para invalidar o cache
  // da galeria correta após dar like/unlike
  profileUserId: string;
  // --- FIM DA ADIÇÃO ---
  
  onAddPhotoClick: () => void; // Função para abrir o modal de upload
  
  // --- CORREÇÃO AQUI ---
  // A função agora passa a foto E o índice dela
  onPhotoClick: (photo: ProfilePhoto, index: number) => void; 
  // --- FIM DA CORREÇÃO ---
}

export const ProfileGalleryGrid = ({
  photos,
  isOwner,
  profileUserId, // Nova prop
  onAddPhotoClick,
  onPhotoClick,
}: ProfileGalleryGridProps) => {

  // --- INÍCIO DA CORREÇÃO (Bug do localhost na Galeria) ---
  // A constante backendBaseUrl foi REMOVIDA. Ela estava a causar o bug
  // ao adicionar o URL do Render ao URL do Cloudinary.
  // const backendBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', ''); // <-- REMOVIDO
  // --- FIM DA CORREÇÃO ---

  // --- INÍCIO DA ADIÇÃO (Hooks de Like) ---
  // Passamos o 'profileUserId' para que os hooks saibam qual query
  // de 'galleryPhotos' invalidar no onSuccess.
  const { mutate: likePhoto } = useLikeGalleryPhoto(profileUserId);
  const { mutate: unlikePhoto } = useUnlikeGalleryPhoto(profileUserId);

  // Handler para o botão de like/unlike
  const handleLikeToggle = (
    e: React.MouseEvent<HTMLButtonElement>,
    photo: ProfilePhoto
  ) => {
    // IMPORANTE: Impede que o clique no botão ative
    // o 'onPhotoClick' do <div> 'pai' (que abre o modal).
    e.stopPropagation(); 
    
    if (photo.isLikedByMe) {
      unlikePhoto(photo.id);
    } else {
      likePhoto(photo.id);
    }
  };
  // --- FIM DA ADIÇÃO ---

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Galeria de Fotos</h3>
        {isOwner && (
          // ----- INÍCIO DA CORREÇÃO (Botão Adicionar Foto) -----
          // Trocamos o botão de texto por um botão de ícone, como você sugeriu.
          // - 'p-1.5' cria um padding quadrado.
          // - 'rounded-lg' combina com o card.
          <button
            onClick={onAddPhotoClick}
            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            aria-label="Adicionar Foto"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
          // ----- FIM DA CORREÇÃO -----
        )}
      </div>

      {photos.length === 0 ? (
        <p className="text-gray-400 text-center py-4">
          {isOwner ? 'Adicione fotos à sua galeria!' : 'Este utilizador ainda não adicionou fotos.'}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => { // O 'index' já estava disponível aqui
            
            // --- INÍCIO DA CORREÇÃO (Bug do localhost na Galeria) ---
            // Usamos photo.url diretamente, pois ele já é o URL
            // completo do Cloudinary (ex: "https://res.cloudinary.com/...")
            const fullImageUrl = photo.url; // <-- CORRIGIDO
            // --- FIM DA CORREÇÃO ---

            return (
              <div
                key={photo.id}
                className="relative aspect-square cursor-pointer overflow-hidden rounded group"
                
                // --- CORREÇÃO AQUI ---
                // Passando 'photo' e 'index' para a função
                onClick={() => onPhotoClick(photo, index)}
                // --- FIM DA CORREÇÃO ---
              >
                <img
                  src={fullImageUrl}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                     console.warn(`Erro ao carregar imagem: ${fullImageUrl}`);
                     (e.target as HTMLImageElement).src = '/path/to/placeholder.png'; // Substitua pelo seu placeholder
                  }}
                />
                
                {/* Overlay que escurece no hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300" />
                
                {/* --- INÍCIO DA ADIÇÃO (UI de Likes) --- */}
                
                {/* Botão de Like (Canto superior direito) */}
                {/* Não mostramos o botão de "like" nas próprias fotos (isOwner) */}
                {!isOwner && (
                  <button
                    onClick={(e) => handleLikeToggle(e, photo)}
                    className="absolute top-1 right-1 p-1.5 rounded-full
                               bg-gray-900 bg-opacity-50 text-white
                               hover:bg-opacity-75 transition-all"
                    aria-label={photo.isLikedByMe ? 'Descurtir' : 'Curtir'}
                  >
                    {photo.isLikedByMe ? (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIconOutline className="w-5 h-5" />
                    )}
                  </button>
                )}
                
                {/* Contadores (Canto inferior esquerdo) */}
                <div 
                  className="absolute bottom-1 left-1 flex items-center gap-2
                             rounded-full bg-gray-900 bg-opacity-50
                             px-2 py-0.5 text-xs text-white"
                >
                  <div className="flex items-center gap-0.5">
                    <HeartIconSolid className="w-3.5 h-3.5" />
                    <span>{photo.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <ChatBubbleOvalLeftIcon className="w-3.5 h-3.5" />
                    <span>{photo.commentsCount}</span>
                  </div>
                </div>
                {/* --- FIM DA ADIÇÃO --- */}
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};