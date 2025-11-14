// src/features/profile/components/EditProfileForm.tsx
// (COLE ISTO NO SEU ARQUIVO)

import { useState, useEffect, useRef } from 'react';
// --- INÍCIO DA REMOÇÃO ---
// Removidos 'Link' e 'useAuth'
import { useNavigate } from 'react-router-dom';
// --- FIM DA REMOÇÃO ---
import { useQueryClient } from '@tanstack/react-query';
import { useGetMyProfile, useUpdateProfile, useUpdateAvatar } from '../hooks/useProfile';
import type { UpdateProfileDto } from '@/types/profile.types';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Modal } from '@/components/common/Modal';
import { toast } from '@/lib/toast';

// --- INÍCIO DA ADIÇÃO (Ideia 1: Ícone de Tooltip) ---
import { InformationCircleIcon } from '@heroicons/react/24/solid';
// --- FIM DA ADIÇÃO ---

// (Componente Loader, libraries, getCroppedImg - mantidos intactos)
const Loader = () => <div className="text-center p-4 text-white">A carregar formulário...</div>;
const libraries: ('places')[] = ['places'];

function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);

  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        resolve(null);
        return;
      }
      resolve(blob);
    }, 'image/png', 1); 
  });
}


export const EditProfileForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // --- INÍCIO DA REMOÇÃO (Lógica de Logout) ---
  // Removido const { logout } = useAuth();
  // --- FIM DA REMOÇÃO ---

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useGetMyProfile();
  const { mutate: updateProfileMutate, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: updateAvatarMutate, isPending: isUpdatingAvatar } = useUpdateAvatar();

  // (Toda a sua lógica de estados - mantida intacta)
  const [birthDate, setBirthDate] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [birthTime, setBirthTime] = useState('');
  // --- INÍCIO DA ADIÇÃO (Ideia 1: Estado do Nome de Nascimento) ---
  const [fullNameBirth, setFullNameBirth] = useState('');
  // --- FIM DA ADIÇÃO ---
  const [currentCity, setCurrentCity] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER' | ''>('');
  const [bio, setBio] = useState('');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('avatar.png');
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const birthCityAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const currentCityAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // (Toda a sua lógica de `useEffect` e handlers - mantida intacta)
  useEffect(() => {
    if (profile) {
      const formattedBirthDate = profile.birthDate ? profile.birthDate.split('T')[0] : '';
      setBirthDate(formattedBirthDate);
      setBirthCity(profile.birthCity || '');
      setBirthTime(profile.birthTime?.substring(0, 5) || '');
      // --- INÍCIO DA ADIÇÃO (Ideia 1: Carregar Nome de Nascimento) ---
      setFullNameBirth(profile.fullNameBirth || '');
      // --- FIM DA ADIÇÃO ---
      setCurrentCity(profile.currentCity || '');
      setGender((profile.gender as any) || '');
      setBio(profile.bio || '');

      // --- INÍCIO DA CORREÇÃO (Bug do localhost ao carregar) ---
      // O profile.imageUrl (do Cloudinary) já é um URL completo.
      // Não precisamos mais do backendUrl aqui.
      if (profile.imageUrl && !pendingAvatar) {
        // const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'; // <-- REMOVIDO
        setAvatarPreview(profile.imageUrl); // <-- CORRIGIDO
      } else if (!profile.imageUrl && !pendingAvatar) {
         setAvatarPreview(null);
      }
      // --- FIM DA CORREÇÃO ---
    }
  }, [profile, pendingAvatar]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    }
  };

  const onBirthCityLoad = (autocomplete: google.maps.places.Autocomplete) => { birthCityAutocompleteRef.current = autocomplete; };
  const onBirthCityPlaceChanged = () => {
    if (birthCityAutocompleteRef.current) {
      const place = birthCityAutocompleteRef.current.getPlace();
      setBirthCity(place.formatted_address || place.name || '');
    }
  };
  const onCurrentCityLoad = (autocomplete: google.maps.places.Autocomplete) => { currentCityAutocompleteRef.current = autocomplete; };
  const onCurrentCityPlaceChanged = () => {
    if (currentCityAutocompleteRef.current) {
      const place = currentCityAutocompleteRef.current.getPlace();
      setCurrentCity(place.formatted_address || place.name || '');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile?.imageUrl && !pendingAvatar) {
      toast.error('A foto de perfil é obrigatória. Por favor, adicione uma foto.');
      return; 
    }

    const finalBirthCity = (document.getElementById('birthCity') as HTMLInputElement)?.value || birthCity;
    const finalCurrentCity = (document.getElementById('currentCity') as HTMLInputElement)?.value || currentCity;
    const profileData: UpdateProfileDto = {
      birthDate: birthDate || undefined, 
      birthCity: finalBirthCity || undefined,
      birthTime: birthTime || undefined,
      // --- INÍCIO DA ADIÇÃO (Ideia 1: Enviar Nome de Nascimento) ---
      fullNameBirth: fullNameBirth || undefined,
      // --- FIM DA ADIÇÃO ---
      currentCity: finalCurrentCity || undefined,
      gender: gender || undefined, 
      bio: bio || undefined,
    };

    updateProfileMutate(profileData, {
      onSuccess: (updatedProfileData) => {
        console.log('Dados de perfil (texto) salvos com sucesso.');
        queryClient.invalidateQueries({ queryKey: ['myProfile'] });

        if (pendingAvatar) {
          console.log('A enviar avatar pendente...');
          updateAvatarMutate(pendingAvatar, {
            onSuccess: (updatedProfileWithAvatar) => {
              console.log('Avatar enviado com sucesso.');
              setPendingAvatar(null); 
              
              // --- INÍCIO DA CORREÇÃO (Bug do localhost ao salvar) ---
              // O imageUrl (do Cloudinary) já é um URL completo.
              if (updatedProfileWithAvatar.imageUrl) {
                 // const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'; // <-- REMOVIDO
                 setAvatarPreview(updatedProfileWithAvatar.imageUrl); // <-- CORRIGIDO
              }
              // --- FIM DA CORREÇÃO ---

              queryClient.invalidateQueries({ queryKey: ['myProfile'] });
              console.log("Perfil e Avatar salvos. Navegando para /discovery...");
              navigate('/discovery', { replace: true });
            },
            onError: (avatarError) => {
              console.error("Erro ao enviar o avatar:", avatarError);
            }
          });
        } else {
           console.log("Nenhum avatar pendente. Verificando perfil para navegação...");
           // --- ALTERAÇÃO: Verificação do perfil completo (incluindo fullNameBirth) ---
           if (updatedProfileData.birthDate && updatedProfileData.birthTime && updatedProfileData.birthCity && updatedProfileData.fullNameBirth) {
              console.log("Perfil completo. Navegando para /discovery...");
              navigate('/discovery', { replace: true });
           } else {
              console.log("Perfil ainda incompleto após salvar texto, permanecendo na página de onboarding");
           }
        }
      },
      onError: (error) => {
        console.error("Erro ao salvar o perfil (texto):", error);
      }
    });
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  const handleSaveCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      console.error("Corte incompleto ou imagem não carregada.");
      return;
    }
    const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
    if (croppedBlob) {
      const baseName = originalFileName.replace(/\.[^/.]+$/, "");
      const safeFileName = `${baseName}.png`;
      const croppedFile = new File([croppedBlob], safeFileName, { type: 'image/png' });
      console.log(`Ficheiro cortado criado: ${safeFileName}, Tamanho: ${(croppedFile.size / 1024).toFixed(2)} KB`);

      setPendingAvatar(croppedFile);
      if (avatarPreview && avatarPreview.startsWith('blob:')) { URL.revokeObjectURL(avatarPreview); } 
      setAvatarPreview(URL.createObjectURL(croppedFile));

      setIsCropModalOpen(false);
      setImageSrc(null);
      setCrop(undefined);
      setCompletedCrop(null);
    } else {
      console.error("Falha ao gerar blob da imagem cortada.");
    }
  };

  // --- INÍCIO DA REMOÇÃO (Handler de Logout) ---
  // Removido 'handleLogout'
  // --- FIM DA REMOÇÃO ---


  // (Lógica de loading/erro - mantida intacta)
  const isProfileNotFoundError = (profileError as any)?.response?.status === 404;

  if (loadError) {
    return <div className="text-red-500 p-4">Erro ao carregar Google Maps API. Verifique a chave.</div>;
  }
  
  if (profileError && !isProfileNotFoundError) {
    return <div className="text-red-500 p-4">Erro ao carregar dados do perfil. Tente recarregar.</div>;
  }
  
  if (!isLoaded || (isProfileLoading && !isProfileNotFoundError)) {
    return <Loader />;
  }
  
  const displayAvatar = avatarPreview; 

  return (
    <>
      {/* Formulário Principal */}
      <div className="w-full max-w-2xl p-4 md:p-6 space-y-4 bg-gray-800 rounded-lg shadow-lg text-white">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-indigo-400">Complete o seu Perfil</h2>
        <p className="text-center text-gray-400 text-sm md:text-base">Estes dados são essenciais para calcular a sua compatibilidade cósmica.</p>

        {/* (Secção do Avatar - Sem alterações) */}
        <div className="flex flex-col items-center space-y-3 border-b border-gray-700 pb-4 mb-4">
          {displayAvatar ? (
            <img 
              src={displayAvatar} 
              alt="Avatar" 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-indigo-500 bg-gray-600"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-indigo-500 bg-gray-700 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-10 h-10 md:w-12 md:h-12 text-gray-500" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          )}
          <label htmlFor="avatar-upload" className={`cursor-pointer px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 text-sm ${(isUpdatingAvatar || isUpdatingProfile) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isUpdatingAvatar ? 'A enviar...' : (isUpdatingProfile ? 'A salvar...' : 'Mudar Foto')}
          </label>
          <input ref={avatarFileInputRef} id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarFileChange} disabled={isUpdatingAvatar || isUpdatingProfile} className="hidden"/>
        </div>

        {/* (Formulário - Sem alterações) */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* (Campos de Data, Cidade, Hora - Sem alterações) */}
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
            <div className="w-full md:w-1/3">
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300">Data de Nascimento *</label>
              <input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div className="w-full md:w-1/3">
              <label htmlFor="birthCity" className="block text-sm font-medium text-gray-300">Cidade de Nascimento *</label>
              <Autocomplete onLoad={onBirthCityLoad} onPlaceChanged={onBirthCityPlaceChanged} options={{ types: ['(cities)'] }}>
                <input id="birthCity" type="text" defaultValue={birthCity} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="Digite e selecione..."/>
              </Autocomplete>
            </div>
            <div className="w-full md:w-1/3">
              <label htmlFor="birthTime" className="block text-sm font-medium text-gray-300">Hora de Nascimento *</label>
              <input id="birthTime" type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
          </div>
          
          {/* (Campo Nome de Nascimento - Sem alterações) */}
          <div className="w-full">
            <label htmlFor="fullNameBirth" className="flex items-center text-sm font-medium text-gray-300">
              <span>Nome Completo de Nascimento *</span>
              {/* Tooltip Icon */}
              <span className="group relative ml-1.5">
                <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-pointer" />
                <span 
                  className="absolute bottom-full left-1/2 z-10 w-64 p-2 mb-2 text-xs text-white bg-gray-900 border border-gray-600 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ transform: 'translateX(-50%)' }}
                >
                  Por favor, insira o nome exato da sua certidão de nascimento. 
                  Usamos este dado *apenas* para calcular os seus números (Expressão, Alma). 
                  Este nome <strong>não</strong> será público.
                </span>
              </span>
            </label>
            <input
              id="fullNameBirth"
              type="text"
              value={fullNameBirth}
              onChange={(e) => setFullNameBirth(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Maria Joaquina da Silva"
            />
          </div>

          {/* (Campos Cidade Atual, Gênero - Sem alterações) */}
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
            <div className="flex-1">
              <label htmlFor="currentCity" className="block text-sm font-medium text-gray-300">Cidade Atual *</label>
              <Autocomplete onLoad={onCurrentCityLoad} onPlaceChanged={onCurrentCityPlaceChanged} options={{ types: ['(cities)'] }}>
                <input id="currentCity" type="text" defaultValue={currentCity} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="Digite e selecione..."/>
              </Autocomplete>
            </div>
            <div className="flex-1">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-300">Gênero *</label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as any)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Selecione...</option><option value="MALE">Masculino</option><option value="FEMALE">Feminino</option><option value="NON_BINARY">Não-Binário</option><option value="OTHER">Outro</option>
              </select>
            </div>
          </div>
          
          {/* --- INÍCIO DA CORREÇÃO 1 --- */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300">Sobre mim (Bio)</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Conte um pouco sobre você... (opcional)"/>
          </div>
          {/* --- FIM DA CORREÇÃO 1 --- */}

          {/* --- INÍCIO DA CORREÇÃO 2 --- */}
          <div className="pt-2">
            <button type="submit" disabled={isUpdatingProfile || isUpdatingAvatar} className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {(isUpdatingProfile || isUpdatingAvatar) ? 'A salvar...' : 'Salvar Perfil'}
            </button>
          </div>
          {/* --- FIM DA CORREÇÃO 2 --- */}
        </form>

        {/* --- INÍCIO DA REMOÇÃO (Links de Configuração) --- */}
        {/* Removida a secção de links 'border-t' */}
        {/* --- FIM DA REMOÇÃO --- */}

      </div>

      {/* (Modal de Corte - Sem alterações) */}
      <Modal isOpen={isCropModalOpen} onClose={() => setIsCropModalOpen(false)} title="Ajustar Foto de Perfil">
        {imageSrc && (
          <div className="flex flex-col items-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              minWidth={100}
            >
              <img ref={imgRef} alt="Imagem para cortar" src={imageSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }} />
            </ReactCrop>
            <button onClick={handleSaveCrop} disabled={!completedCrop || isUpdatingAvatar || isUpdatingProfile} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {(isUpdatingAvatar || isUpdatingProfile) ? 'Aguarde...' : 'Salvar Corte'}
            </button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default EditProfileForm;