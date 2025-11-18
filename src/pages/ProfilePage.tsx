// frontend/src/pages/ProfilePage.tsx
// (ATUALIZADO: Passando userId para o Gráfico de Radar)

import { Fragment, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  useGetMyProfile,
  useGetPublicProfile,
  useGetGalleryPhotos,
  useFollowUser,
  useUnfollowUser,
  useGetFollowing,
  useGetFollowers,
  useBlockUser,
} from '@/features/profile/hooks/useProfile';
import { SendMessageModal } from '@/features/chat/components/SendMessageModal';
import { ProfileGalleryGrid } from '@/features/profile/components/ProfileGalleryGrid';
import { GalleryPhotoViewerModal } from '@/features/profile/components/GalleryPhotoViewerModal';
import { AddGalleryPhotoModal } from '@/features/profile/components/AddGalleryPhotoModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { toast } from '@/lib/toast';
import { Menu, Transition } from '@headlessui/react';

import { BehavioralQuizModal } from '@/features/profile/components/BehavioralQuizModal';
import { BehavioralRadarChart } from '@/features/profile/components/BehavioralRadarChart';

// Ícones
import {
  UserCircleIcon,
  MapPinIcon,
  CogIcon,
  PencilIcon,
  ChatBubbleBottomCenterTextIcon,
  NoSymbolIcon,
  UserPlusIcon,
  UserMinusIcon,
  EllipsisVerticalIcon,
  ArrowRightOnRectangleIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  SparklesIcon,
  CalculatorIcon,
  AdjustmentsHorizontalIcon, 
} from '@heroicons/react/24/solid';

// Tipos
import type {
  Profile,
  ProfilePhoto,
  BasicUserInfo,
} from '@/types/profile.types';

// --- COMPONENTES INTERNOS ---

const ProfileHeader = ({ profile, isOwner }: { profile: Profile; isOwner: boolean; }) => {
  const navigate = useNavigate();
  const avatarUrl = profile.imageUrl ?? null;
  const targetUserId = profile.userId;

  const [isQuizModalOpen, setQuizModalOpen] = useState(false);

  const sunSign = profile.natalChart?.planets?.find((p) => p.name === 'Sol')?.sign || 'Capricorn';

  const { data: followingList, isLoading: isLoadingFollowing } = useGetFollowing(
    'me',
    { enabled: !isOwner },
  );
  const { mutate: followUser, isPending: isFollowing } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowing } = useUnfollowUser();

  const isAlreadyFollowing = followingList?.some(
    (user) => user.id === targetUserId,
  );
  const isConnectLoading = isFollowing || isUnfollowing || isLoadingFollowing;

  const handleConnectClick = () => {
    if (isConnectLoading || !targetUserId) return;
    if (isAlreadyFollowing) {
      unfollowUser(targetUserId);
    } else {
      followUser(targetUserId);
    }
  };

  const [isBlockModalOpen, setBlockModalOpen] = useState(false);
  const { mutate: blockUser, isPending: isBlocking } = useBlockUser();

  const handleBlockClick = () => {
    if (isBlocking) return;
    setBlockModalOpen(true);
  };

  const confirmBlockUser = () => {
    if (isBlocking || !targetUserId) return;
    blockUser(targetUserId, {
      onSuccess: () => {
        setBlockModalOpen(false);
        navigate('/discovery');
      },
      onError: (error: any) => {
        setBlockModalOpen(false);
        if (error?.response?.status === 409) {
          navigate('/discovery');
        } else {
          console.error('Erro ao bloquear usuário:', error);
          toast.error('Ocorreu um erro ao tentar bloquear o usuário.');
        }
      },
    });
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Tem a certeza que quer sair?')) {
      logout();
    }
  };

  const [isMessageModalOpen, setMessageModalOpen] = useState(false);

  const handleMessageClick = () => {
    setMessageModalOpen(true);
  };

  return (
    <>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center relative">
        {isOwner && (
          <div className="absolute top-4 right-4 z-10">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                  <span className="sr-only">Opções</span>
                  <EllipsisVerticalIcon className="h-6 w-6" aria-hidden="true" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-600 rounded-md bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile/blocked"
                          className={`${
                            active ? 'bg-indigo-600 text-white' : 'text-gray-200'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          <ShieldExclamationIcon
                            className="mr-2 h-5 w-5 text-gray-400 group-hover:text-white"
                            aria-hidden="true"
                          />
                          Gerenciar Bloqueados
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-red-600 text-white' : 'text-red-400'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          <ArrowRightOnRectangleIcon
                            className="mr-2 h-5 w-5 text-red-400 group-hover:text-white"
                            aria-hidden="true"
                          />
                          Sair (Logout)
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        )}

        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile.user?.name || 'Avatar'}
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
            />
          ) : (
            <UserCircleIcon className="w-32 h-32 text-gray-600" />
          )}
          {isOwner && (
            <button
              onClick={() => navigate('/profile/edit')}
              className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-full hover:bg-indigo-700 border-2 border-gray-800"
              aria-label="Editar foto do perfil"
            >
              <PencilIcon className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        <h2 className="text-3xl font-bold text-white mt-4">
          {profile.user?.name || 'Usuário'}
        </h2>
        {profile.currentCity && (
          <div className="flex items-center gap-1 mt-1 text-gray-400">
            <MapPinIcon className="w-4 h-4" />
            <span>{profile.currentCity}</span>
          </div>
        )}

        <div className="flex gap-2 md:gap-4 mt-4 w-full justify-center">
          {isOwner ? (
            // --- DONO DO PERFIL (Botões) ---
            <>
              <button
                onClick={() => navigate('/profile/edit')}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700"
              >
                <CogIcon className="w-5 h-5" />
                Editar
              </button>
              
              {/* BOTÃO MINHA SINTONIA */}
              <button
                onClick={() => setQuizModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Sintonia
              </button>
            </>
          ) : (
            // --- VISITANTE (Botões) ---
            <>
              <button
                onClick={handleConnectClick}
                disabled={isConnectLoading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors
                  ${
                    isAlreadyFollowing
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }
                  ${isConnectLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isAlreadyFollowing ? (
                  <UserMinusIcon className="w-5 h-5" />
                ) : (
                  <UserPlusIcon className="w-5 h-5" />
                )}
                {isAlreadyFollowing ? 'Seguindo' : 'Conectar'}
              </button>

              <button
                onClick={handleMessageClick}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50"
              >
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                Mensagem
              </button>

              <button
                onClick={handleBlockClick}
                disabled={isBlocking}
                className={`
                  p-2 bg-gray-700 text-gray-400 rounded-lg 
                  transition-colors duration-150 
                  hover:bg-red-700 hover:text-white
                  ${isBlocking ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                aria-label="Bloquear"
              >
                <NoSymbolIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- INSERÇÃO DO GRÁFICO DE RADAR --- */}
      {profile.behavioralAnswers && profile.behavioralAnswers.length > 0 && (
        <div className="px-4">
           <BehavioralRadarChart 
              answers={profile.behavioralAnswers} 
              sign={sunSign} 
              userId={profile.userId} // <-- CORREÇÃO: Passando o ID correto para o link!
           />
        </div>
      )}

      <ConfirmationModal
        isOpen={isBlockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onConfirm={confirmBlockUser}
        isLoading={isBlocking}
        title="Bloquear Usuário"
        confirmText="Bloquear"
        cancelText="Cancelar"
      >
        Tem a certeza que quer bloquear este usuário? Você não verá mais os
        posts ou o perfil desta pessoa, e ela não verá o seu.
      </ConfirmationModal>

      {isMessageModalOpen && (
        <SendMessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          targetUser={profile}
        />
      )}

      {isQuizModalOpen && (
        <BehavioralQuizModal
          isOpen={isQuizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          sunSign={sunSign}
          existingAnswers={profile.behavioralAnswers || []}
        />
      )}

    </>
  );
};

const ProfileAbout = ({ bio }: { bio: string }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-white mb-2">Sobre mim</h3>
    <p className="text-gray-300 whitespace-pre-wrap">{bio}</p>
  </div>
);

const ProfileCosmicDetails = ({
  profile,
  natalChart,
  numerologyMap,
  onViewChartClick,
  onShowLockModal,
  isOwner,
  loggedInUserStatus,
}: {
  profile: Profile;
  natalChart: Profile['natalChart'];
  numerologyMap: Profile['numerologyMap']; 
  onViewChartClick: () => void;
  onShowLockModal: () => void;
  isOwner: boolean;
  loggedInUserStatus: 'FREE' | 'PREMIUM' | 'LIFETIME' | undefined;
}) => {
  const MIN_FOLLOWERS = 5;
  const MIN_FOLLOWING = 10;
  const followersCount = profile.user?._count?.followers ?? 0;
  const followingCount = profile.user?._count?.following ?? 0;
  const isLocked =
    isOwner &&
    (followersCount < MIN_FOLLOWERS || followingCount < MIN_FOLLOWING);

  const sun = natalChart?.planets?.find((p) => p.name === 'Sol');
  const moon = natalChart?.planets?.find((p) => p.name === 'Lua');
  const ascendant = natalChart?.houses?.find((h) => h.name === 'Casa 1 (ASC)');
  
  const hasFullNumerology = !!(numerologyMap && numerologyMap.expressionNumber);
  const hasNatalChart = !!natalChart;

  const navigate = useNavigate();
  const isUserFree = loggedInUserStatus === 'FREE';

  const handleSinastryClick = (e: React.MouseEvent) => {
    if (!hasNatalChart) {
      e.preventDefault();
      return;
    }
    if (isUserFree) {
      e.preventDefault();
      navigate('/premium');
    }
  };

  const handleNumerologyClick = (e: React.MouseEvent) => {
    if (!hasFullNumerology) {
      e.preventDefault();
      return;
    }
    if (isUserFree) {
      e.preventDefault();
      navigate('/premium');
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-white mb-4">
        Detalhes Cósmicos
      </h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <dt className="text-sm text-gray-400">Sol ☀️</dt>
          <dd className="text-lg font-semibold text-white">
            {sun?.sign || '...'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">Lua 🌙</dt>
          <dd className="text-lg font-semibold text-white">
            {moon?.sign || '...'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-400">Ascendente ✨</dt>
          <dd className="text-lg font-semibold text-white">
            {ascendant?.sign || '...'}
          </dd>
        </div>
      </div>
      {numerologyMap?.lifePathNumber && (
        <div className="mt-4 pt-4 border-t border-gray-700 text-center">
          <dt className="text-sm text-gray-400">Caminho de Vida 🔢</dt>
          <dd className="text-lg font-semibold text-white">
            {numerologyMap.lifePathNumber}
          </dd>
        </div>
      )}

      {isOwner && (
        <button
          onClick={isLocked ? onShowLockModal : onViewChartClick}
          className={`mt-4 w-full flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg font-semibold transition-colors
            ${
              isLocked
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }
          `}
        >
          {isLocked && <LockClosedIcon className="w-5 h-5" />}{' '}
          Ver Meu Plano Astral
        </button>
      )}

      {!isOwner && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
          
          <Link
            to={`/synastry/${profile.userId}`}
            className={`w-full flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg font-semibold transition-colors
              ${
                hasNatalChart
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'
              }
            `}
            onClick={handleSinastryClick}
            aria-disabled={!hasNatalChart}
            title={!hasNatalChart ? 'Utilizador não preencheu os dados do mapa astral' : ''}
          >
            <SparklesIcon className="w-5 h-5" />
            Ver Sinastria (Astrologia)
          </Link>

          <Link
            to={`/numerology-report/${profile.userId}`}
            className={`w-full flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg font-semibold transition-colors
              ${
                hasFullNumerology
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'
              }
            `}
            onClick={handleNumerologyClick}
            aria-disabled={!hasFullNumerology}
            title={!hasFullNumerology ? 'Utilizador não preencheu os dados para este relatório' : ''}
          >
            <CalculatorIcon className="w-5 h-5" />
            Ver Conexão (Numerologia)
          </Link>
          
          {(!hasNatalChart || !hasFullNumerology) && (
             <p className="text-xs text-center text-gray-500 pt-1">
                Relatórios de compatibilidade indisponíveis. O utilizador ainda não preencheu todos os dados de perfil (data/hora/nome de nascimento).
             </p>
          )}
        </div>
      )}
    </div>
  );
};

const ConnectionList = ({
  users,
  isLoading,
  error,
  emptyMessage,
}: {
  users: BasicUserInfo[] | undefined;
  isLoading: boolean;
  error: Error | null;
  emptyMessage: string;
}) => {

  if (isLoading) {
    return <p className="text-gray-400 text-center py-4">A carregar...</p>;
  }
  if (error) {
    return (
      <p className="text-red-400 text-center py-4">Erro ao carregar conexões.</p>
    );
  }
  if (!users || users.length === 0) {
    return <p className="text-gray-400 text-center py-4">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
      {users.map((user) => {
        const imageUrl = user.profile?.imageUrl ?? null;
        return (
          <Link
            to={`/profile/${user.id}`}
            key={user.id}
            className="flex flex-col items-center text-center text-white"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-transparent hover:border-indigo-400"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center border-2 border-transparent hover:border-indigo-400">
                <UserCircleIcon className="w-10 h-10 text-gray-500" />
              </div>
            )}
            <p className="text-xs mt-2 truncate w-full">{user.name}</p>
          </Link>
        );
      })}
    </div>
  );
};

const ProfileConnections = ({
  targetUserId,
}: {
  targetUserId: string;
}) => {

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    'followers',
  );

  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    error: followersError,
  } = useGetFollowers(targetUserId);

  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    error: followingError,
  } = useGetFollowing(targetUserId);

  const followersCount = followersData?.length ?? 0;
  const followingCount = followingData?.length ?? 0;

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold text-white mb-4">
        Conexão em Órbita
      </h2>

      <div className="flex mb-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-2 text-center font-semibold ${
            activeTab === 'followers'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Seguidores ({followersCount})
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-2 text-center font-semibold ${
            activeTab === 'following'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Seguindo ({followingCount})
        </button>
      </div>

      <div>
        {activeTab === 'followers' ? (
          <ConnectionList
            users={followersData}
            isLoading={isLoadingFollowers}
            error={followersError}
            emptyMessage="Nenhum seguidor encontrado."
          />
        ) : (
          <ConnectionList
            users={followingData}
            isLoading={isLoadingFollowing}
            error={followingError}
            emptyMessage="Não está a seguir ninguém."
          />
        )}
      </div>
    </div>
  );
};

const NatalChartLockModal = ({ isOpen, onClose, counts, metas, }: { isOpen: boolean; onClose: () => void; counts: { followers: number; following: number }; metas: { followers: number; following: number }; }) => {
  const navigate = useNavigate();
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => {
        onClose();
        navigate('/discovery');
      }}
      title="Desbloquear Plano Astral"
      confirmText="Encontrar Pessoas"
      cancelText="Fechar"
    >
      <p className="text-gray-300 text-sm mb-4">
        Para aceder ao seu Plano Astral completo, complete as suas primeiras
        conexões.
      </p>
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between text-base">
          <span className="text-gray-300">Seguidores</span>
          <span
            className={`font-semibold ${
              counts.followers >= metas.followers
                ? 'text-green-400'
                : 'text-yellow-400'
            }`}
          >
            {counts.followers} / {metas.followers}
          </span>
        </div>
        <div className="flex items-center justify-between text-base">
          <span className="text-gray-300">A Seguir</span>
          <span
            className={`font-semibold ${
              counts.following >= metas.following
                ? 'text-green-400'
                : 'text-yellow-400'
            }`}
          >
            {counts.following} / {metas.following}
          </span>
        </div>
      </div>
    </ConfirmationModal>
  );
};

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: loggedInUser, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const isOwner = !userId || userId === loggedInUser?.id;
  const targetUserId = isOwner ? loggedInUser?.id : userId;

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = isOwner ? useGetMyProfile() : useGetPublicProfile(targetUserId);

  const {
    data: photosData,
    isLoading: isLoadingPhotos,
    isError: isPhotosError,
  } = useGetGalleryPhotos(targetUserId);

  const [isGalleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isAddPhotoModalOpen, setAddPhotoModalOpen] = useState(false);
  const [isLockModalOpen, setLockModalOpen] = useState(false);

  const isLoading = isAuthLoading || isLoadingProfile || isLoadingPhotos;

  const handlePhotoClick = (photo: ProfilePhoto, index: number) => {
    setSelectedPhotoIndex(index);
    setGalleryModalOpen(true);
  };

  const handleAddPhotoClick = () => {
    setAddPhotoModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        A carregar perfil...
      </div>
    );
  }

  if (isProfileError || isPhotosError || !profileData || !targetUserId) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        Erro ao carregar o perfil.
      </div>
    );
  }

  const loggedInUserStatus = loggedInUser?.subscription?.status;

  const photos = photosData ?? [];
  const metas = { followers: 5, following: 10 };

  return (
    <>
      <div className="pb-16 space-y-4 px-4">
        <ProfileHeader profile={profileData} isOwner={isOwner} />

        {profileData.bio && <ProfileAbout bio={profileData.bio} />}

        <ProfileCosmicDetails
          profile={profileData}
          natalChart={profileData.natalChart}
          numerologyMap={profileData.numerologyMap}
          onViewChartClick={() => navigate('/natal-chart')}
          onShowLockModal={() => setLockModalOpen(true)}
          isOwner={isOwner}
          loggedInUserStatus={loggedInUserStatus}
        />

        <ProfileGalleryGrid
          photos={photos}
          isOwner={isOwner}
          profileUserId={targetUserId}
          onAddPhotoClick={handleAddPhotoClick}
          onPhotoClick={handlePhotoClick}
        />

        <ProfileConnections targetUserId={targetUserId} />
      </div>

      <AddGalleryPhotoModal
        isOpen={isAddPhotoModalOpen}
        onClose={() => setAddPhotoModalOpen(false)}
      />

      {photos.length > 0 && (
        <GalleryPhotoViewerModal
          isOpen={isGalleryModalOpen}
          onClose={() => setGalleryModalOpen(false)}
          photos={photos}
          startIndex={selectedPhotoIndex}
          isOwnProfile={isOwner}
          profileUserId={targetUserId}
        />
      )}

      <NatalChartLockModal
        isOpen={isLockModalOpen}
        onClose={() => setLockModalOpen(false)}
        counts={{
          followers: profileData.user?._count?.followers ?? 0,
          following: profileData.user?._count?.following ?? 0,
        }}
        metas={metas}
      />
    </>
  );
}