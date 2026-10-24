// src/features/profile/components/EditProfileForm.tsx
// (COLE ISTO NO SEU ARQUIVO)

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMyProfile, useUpdateProfile, useUpdateAvatar } from '../hooks/useProfile';
import type { UpdateProfileDto } from '@/types/profile.types';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Modal } from '@/components/common/Modal';
import { toast } from '@/lib/toast';

// --- INÍCIO DA CORREÇÃO (Erro 500 do Asaas) ---
// Adicionamos o ícone de cadeado para o campo CPF
import { InformationCircleIcon, LockClosedIcon } from '@heroicons/react/24/solid';
// --- FIM DA CORREÇÃO ---

// (Componente Loader, libraries, getCroppedImg - mantidos intactos)
const Loader = () => (
  <div className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0c1226]/80 p-10 text-center text-slate-300 backdrop-blur-xl">
    Carregando seu perfil...
  </div>
);
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
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useGetMyProfile();
  const { mutate: updateProfileMutate, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: updateAvatarMutate, isPending: isUpdatingAvatar } = useUpdateAvatar();

  // (Estados)
  const [birthDate, setBirthDate] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [fullNameBirth, setFullNameBirth] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER' | ''>('');
  const [bio, setBio] = useState('');

  // --- INÍCIO DA CORREÇÃO (Erro 500 do Asaas) ---
  const [cpfCnpj, setCpfCnpj] = useState(''); // 1. Adicionar novo estado
  // --- FIM DA CORREÇÃO ---
  
  // (Estados do Avatar)
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

  // (useEffect - Carregar dados)
  useEffect(() => {
    if (profile) {
      const formattedBirthDate = profile.birthDate ? profile.birthDate.split('T')[0] : '';
      setBirthDate(formattedBirthDate);
      setBirthCity(profile.birthCity || '');
      setBirthTime(profile.birthTime?.substring(0, 5) || '');
      setFullNameBirth(profile.fullNameBirth || '');
      setCurrentCity(profile.currentCity || '');
      setGender((profile.gender as any) || '');
      setBio(profile.bio || '');

      // --- INÍCIO DA CORREÇÃO (Erro 500 do Asaas) ---
      setCpfCnpj(profile.cpfCnpj || ''); // 2. Carregar o CPF/CNPJ
      // --- FIM DA CORREÇÃO ---

      if (profile.imageUrl && !pendingAvatar) {
        setAvatarPreview(profile.imageUrl);
      } else if (!profile.imageUrl && !pendingAvatar) {
         setAvatarPreview(null);
      }
    }
  }, [profile, pendingAvatar]);

  // (handlers do Avatar - sem alterações)
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

  // (handlers do Autocomplete - sem alterações)
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

  // (handler de Submit - ATUALIZADO)
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
      fullNameBirth: fullNameBirth || undefined,
      currentCity: finalCurrentCity || undefined,
      gender: gender || undefined, 
      bio: bio || undefined,
      // --- INÍCIO DA CORREÇÃO (Erro 500 do Asaas) ---
      cpfCnpj: cpfCnpj || undefined, // 3. Adicionar o CPF/CNPJ ao DTO de envio
      // --- FIM DA CORREÇÃO ---
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
              if (updatedProfileWithAvatar.imageUrl) {
                 setAvatarPreview(updatedProfileWithAvatar.imageUrl);
              }
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
           // (Verificação do perfil completo - sem alteração)
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

  // (handlers de Corte - sem alterações)
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

  // (Lógica de loading/erro - mantida intacta)
  const isProfileNotFoundError = (profileError as any)?.response?.status === 404;
  if (loadError) {
    return <div className="mx-auto max-w-4xl rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5 text-rose-300">Erro ao carregar Google Maps API. Verifique a chave.</div>;
  }
  if (profileError && !isProfileNotFoundError) {
    return <div className="mx-auto max-w-4xl rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5 text-rose-300">Erro ao carregar dados do perfil. Tente recarregar.</div>;
  }
  if (!isLoaded || (isProfileLoading && !isProfileNotFoundError)) {
    return <Loader />;
  }
  const displayAvatar = avatarPreview; 

  return (
    <>
      {/* Formulário Principal */}
      <div className="mx-auto w-full max-w-4xl space-y-7 rounded-[30px] border border-violet-300/15 bg-[#0c1226]/88 p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-7 lg:p-10">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-300">Perfil e compatibilidade</span>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Conte um pouco sobre você</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Preencha os dados abaixo para personalizar sua experiência e permitir os cálculos de compatibilidade.
          </p>
        </div>

        {/* (Secção do Avatar - Sem alterações) */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          {displayAvatar ? (
            <img 
              src={displayAvatar} 
              alt="Avatar" 
              className="h-28 w-28 rounded-full border-4 border-violet-500/70 bg-slate-700 object-cover shadow-[0_0_40px_rgba(139,92,246,0.22)]"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-violet-500/70 bg-[#121a31] shadow-[0_0_40px_rgba(139,92,246,0.18)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <label htmlFor="avatar-upload" className={`cursor-pointer rounded-xl border border-violet-400/20 bg-violet-500/15 px-5 py-2.5 text-sm font-bold text-violet-100 transition hover:bg-violet-500/25 ${(isUpdatingAvatar || isUpdatingProfile) ? 'cursor-not-allowed opacity-50' : ''}`}>
            {isUpdatingAvatar ? 'A enviar...' : (isUpdatingProfile ? 'A salvar...' : 'Mudar Foto')}
          </label>
          <input ref={avatarFileInputRef} id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarFileChange} disabled={isUpdatingAvatar || isUpdatingProfile} className="hidden"/>
        </div>

        {/* (Formulário) */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* (Campos de Data, Cidade, Hora - Sem alterações) */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="w-full">
              <label htmlFor="birthDate" className="mb-2 block text-sm font-bold text-slate-200">Data de Nascimento *</label>
              <input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:bg-white/[0.065] focus:ring-4 focus:ring-violet-500/10"/>
            </div>
            <div className="w-full">
              <label htmlFor="birthCity" className="mb-2 block text-sm font-bold text-slate-200">Cidade de Nascimento *</label>
              <Autocomplete onLoad={onBirthCityLoad} onPlaceChanged={onBirthCityPlaceChanged} options={{ types: ['(cities)'] }}>
                <input id="birthCity" type="text" defaultValue={birthCity} required className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:bg-white/[0.065] focus:ring-4 focus:ring-violet-500/10" placeholder="Digite e selecione..."/>
              </Autocomplete>
            </div>
            <div className="w-full">
              <label htmlFor="birthTime" className="mb-2 block text-sm font-bold text-slate-200">Hora de Nascimento *</label>
              <input id="birthTime" type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:bg-white/[0.065] focus:ring-4 focus:ring-violet-500/10"/>
            </div>
          </div>
          
          {/* (Campo Nome de Nascimento - Sem alterações) */}
          <div className="w-full">
            <label htmlFor="fullNameBirth" className="mb-2 flex items-center text-sm font-bold text-slate-200">
              <span>Nome Completo de Nascimento *</span>
              <span className="group relative ml-1.5">
                <InformationCircleIcon className="h-4 w-4 cursor-pointer text-slate-500" />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 rounded-xl border border-white/10 bg-[#070b18] p-3 text-xs leading-5 text-white opacity-0 shadow-2xl transition-opacity group-hover:opacity-100" style={{ transform: 'translateX(-50%)' }}>
                  Por favor, insira o nome exato da sua certidão de nascimento. Usamos este dado *apenas* para calcular os seus números (Expressão, Alma). Este nome <strong>não</strong> será público.
                </span>
              </span>
            </label>
            <input
              id="fullNameBirth"
              type="text"
              value={fullNameBirth}
              onChange={(e) => setFullNameBirth(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:bg-white/[0.065] focus:ring-4 focus:ring-violet-500/10"
              placeholder="Ex: Maria Joaquina da Silva"
            />
          </div>

          {/* (Campos Cidade Atual, Gênero - Sem alterações) */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="w-full">
              <label htmlFor="currentCity" className="mb-2 block text-sm font-bold text-slate-200">Cidade Atual *</label>
              <Autocomplete onLoad={onCurrentCityLoad} onPlaceChanged={onCurrentCityPlaceChanged} options={{ types: ['(cities)'] }}>
                <input id="currentCity" type="text" defaultValue={currentCity} required className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:bg-white/[0.065] focus:ring-4 focus:ring-violet-500/10" placeholder="Digite e selecione..."/>
              </Autocomplete>
            </div>
            <div className="w-full">
              <label htmlFor="gender" className="mb-2 block text-sm font-bold text-slate-200">Gênero *</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                required
                style={{ colorScheme: 'dark' }}
                className="w-full rounded-xl border border-white/10 bg-[#121a31] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
              >
                <option value="" className="bg-[#121a31] text-slate-300">Selecione...</option>
                <option value="MALE" className="bg-[#121a31] text-white">Masculino</option>
                <option value="FEMALE" className="bg-[#121a31] text-white">Feminino</option>
                <option value="NON_BINARY" className="bg-[#121a31] text-white">Não-Binário</option>
                <option value="OTHER" className="bg-[#121a31] text-white">Outro</option>
              </select>
            </div>
          </div>
          
          {/* --- INÍCIO DA CORREÇÃO (Erro 500 do Asaas) --- */}
          {/* 4. Adicionar o novo campo de input para CPF/CNPJ */}
          <div className="w-full rounded-2xl border border-amber-300/10 bg-amber-300/[0.025] p-5">
            <label htmlFor="cpfCnpj" className="mb-2 flex items-center text-sm font-bold text-slate-200">
              <LockClosedIcon className="mr-1.5 h-4 w-4 text-amber-300" />
              <span>CPF / CNPJ (Para Pagamentos) *</span>
              
              <span className="group relative ml-1.5">
                <InformationCircleIcon className="h-4 w-4 cursor-pointer text-slate-500" />
                <span 
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 rounded-xl border border-white/10 bg-[#070b18] p-3 text-xs leading-5 text-white opacity-0 shadow-2xl transition-opacity group-hover:opacity-100"
                  style={{ transform: 'translateX(-50%)' }}
                >
                  Para gerar o PIX, o nosso parceiro de pagamentos (Asaas)
                  exige um CPF ou CNPJ. Este dado é usado <strong>apenas</strong> para
                  o pagamento e <strong>não</strong> será público no seu perfil.
                </span>
              </span>
            </label>
            <input
              id="cpfCnpj"
              type="text"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:bg-white/[0.065] focus:ring-4 focus:ring-violet-500/10"
              placeholder="Digite apenas os números"
            />
          </div>
          {/* --- FIM DA CORREÇÃO --- */}


          {/* (Campo Bio - Sem alterações) */}
          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-bold text-slate-200">Sobre mim (Bio)</label>
            <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/60 focus:bg-white/[0.065] focus:ring-4 focus:ring-violet-500/10" placeholder="Conte um pouco sobre você... (opcional)"/>
          </div>

          {/* (Botão Salvar - Sem alterações) */}
          <div className="pt-2">
            <button type="submit" disabled={isUpdatingProfile || isUpdatingAvatar} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(124,58,237,0.28)] transition hover:-translate-y-0.5 hover:from-fuchsia-400 hover:to-violet-500 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50">
              {(isUpdatingProfile || isUpdatingAvatar) ? 'Salvando seu perfil...' : 'Concluir meu perfil'}
            </button>
          </div>
        </form>
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
            <button onClick={handleSaveCrop} disabled={!completedCrop || isUpdatingAvatar || isUpdatingProfile} className="mt-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-2.5 font-bold text-white transition hover:from-fuchsia-400 hover:to-violet-500 disabled:opacity-50">
              {(isUpdatingAvatar || isUpdatingProfile) ? 'Aguarde...' : 'Salvar Corte'}
            </button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default EditProfileForm;