// src/pages/PostPage.tsx

import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPostById, PublicPost, MediaType } from '@/features/feed/services/feedApi';
import { FiLoader, FiAlertTriangle, FiArrowLeft, FiShield } from 'react-icons/fi'; // <--- FiShield adicionado
import { useAuth } from '@/contexts/AuthContext'; // <--- Importado Auth para verificar Admin

// --- Helpers de URL ---
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const backendOrigin = apiUrl.replace(/\/api\/?$/, '');
const defaultAvatar = '/default-avatar.png';
const toPublicUrl = (p?: string | null) =>
  !p ? undefined : /^https?:\/\//i.test(p) ? p : `${backendOrigin}/${p}`;

// --- Componente de Mídia ---
const PostMedia = ({ post, url }: { post: PublicPost; url: string }) => {
  const placeholder = '/placeholder-image.png';
  const mediaClasses = 'block w-full h-full object-contain select-none';

  if (post.mediaType === MediaType.VIDEO) {
    return (
      <video
        key={post.id}
        src={url}
        autoPlay
        loop
        muted
        playsInline
        className={mediaClasses}
        onError={(e) => {
          (e.target as HTMLVideoElement).src = placeholder;
        }}
        draggable="false"
        onContextMenu={(e) => e.preventDefault()}
      />
    );
  }

  return (
    <img
      key={post.id}
      src={url}
      alt={`Post de ${post.author.name}`}
      className={mediaClasses}
      onError={(e) => {
        (e.target as HTMLImageElement).src = placeholder;
      }}
      draggable="false"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

// --- Hook de Query ---
const usePublicPost = (postId: string) => {
  return useQuery<PublicPost, Error>({
    queryKey: ['publicPost', postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// --- Componente de Página ---
export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // <--- Pegamos o usuário logado

  const isAdmin = user?.role === 'ADMIN'; // <--- Verificação simples

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = usePublicPost(id ?? '');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center text-white">
          <FiLoader className="animate-spin text-purple-400 text-3xl" />
        </div>
      );
    }

    if (isError) {
      const errorMessage =
        (error as any)?.response?.status === 404
          ? 'Post não encontrado ou expirou.'
          : 'Erro ao carregar o post.';
      return (
        <div className="flex flex-1 flex-col items-center justify-center text-center text-red-400 px-4">
          <FiAlertTriangle className="text-4xl mb-2" />
          <p>{errorMessage}</p>
          
          {/* Se for admin e o post sumiu (ex: apagado), botão pra voltar */}
          {isAdmin && (
             <Link
               to="/admin/reports"
               className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
             >
               Voltar ao Tribunal
             </Link>
          )}
        </div>
      );
    }

    if (!post) {
      return null;
    }

    // --- Preparar URLs ---
    const authorAvatarUrl =
      toPublicUrl(post.author.profile?.imageUrl) ?? defaultAvatar;
    const postMediaUrl =
      toPublicUrl(post.imageUrl) ?? '/placeholder-image.png';

    return (
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {/* 1. Mídia */}
        <div className="absolute inset-0 px-4">
          <PostMedia post={post} url={postMediaUrl} />
        </div>

        {/* 2. Header do Autor */}
        <div className="pointer-events-none absolute top-6 left-0 right-0 z-10 px-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3">
            <img
              src={authorAvatarUrl}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 bg-gray-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
            <span
              className="font-semibold text-lg text-white drop-shadow-md truncate"
            >
              {post.author.name}
            </span>
          </div>
        </div>

        {/* 3. Gradiente e Legenda */}
        {post.content && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 pt-24 pb-4 px-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
            <p className="text-sm text-white drop-shadow-sm">
              {post.content}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white relative overflow-hidden">
      
      {/* Botão Voltar (Padrão) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-4 z-50 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
      >
        <FiArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* --- BOTÃO EXCLUSIVO DE ADMIN (Tribunal) --- */}
      {isAdmin && (
        <Link
          to="/admin/reports"
          className="absolute top-6 right-4 z-50 flex items-center gap-2 bg-red-600/90 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg backdrop-blur-sm transition-all text-sm border border-red-500"
        >
          <FiShield className="w-4 h-4" />
          Voltar para Denúncias
        </Link>
      )}

      {/* Conteúdo Principal */}
      {renderContent()}

      {/* Footer "Call to Action" (Só aparece se NÃO estiver logado) */}
      {!user && (
        <div className="py-4 px-4 border-t border-gray-800 bg-gray-950 z-20 text-center">
          <p className="text-sm text-gray-300 mb-3">
            Viu este post e gostou?
          </p>
          <Link
            to="/register"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Junte-se ao CosmosMatch
          </Link>
        </div>
      )}
    </div>
  );
}