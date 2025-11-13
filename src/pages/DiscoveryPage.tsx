// src/pages/DiscoveryPage.tsx
// (COLE ISTO NO SEU ARQUIVO)

import React, { useState, useCallback, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { ProfileCard } from '@/features/discovery/componentes/ProfileCard';
import { DiscoveryActions } from '@/features/discovery/componentes/DiscoveryActions';
import { useDiscoveryQueue } from '@/features/discovery/hooks/useDiscoveryQueue';
import { useDiscoveryMutations } from '@/features/discovery/hooks/useDiscoveryMutations';
import { FiSearch, FiX, FiMapPin } from 'react-icons/fi'; 

import { api } from '@/services/api'; 
import { toast } from 'react-hot-toast'; 
import type { AxiosResponse } from 'axios';
import { useDebounce } from '@/hooks/useDebounce'; 

// --- Componentes internos (sem alterações) ---

function EmptyStateFallback() {
  // ... (sem alterações) ...
  return (
    <div className="flex flex-col h-full items-center justify-center text-center text-gray-400">
      <p className="text-lg">✨ Sem perfis novos por perto.</p>
      <p className="text-sm">Tente novamente mais tarde ou mude o filtro.</p>
    </div>
  );
}
function LoadingSpinner() {
  // ... (sem alterações) ...
  return (
    <div className="flex flex-col h-full items-center justify-center text-center text-gray-400">
       <svg className="animate-spin h-8 w-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <p className="text-lg mt-4">Carregando perfis...</p>
    </div>
  );
}
function ErrorFallback({ error, onRetry }: { error: Error | null, onRetry: () => void }) {
  // ... (sem alterações) ...
  return (
    <div className="p-6 text-center text-gray-400">
      <p className="mb-4">Ops, algo deu errado ao buscar perfis.</p>
      <pre className="text-xs bg-gray-800 p-2 rounded inline-block text-left text-red-400">
        {String(error?.message ?? 'Erro desconhecido')}
      </pre>
      <div className="mt-4">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-full font-bold" onClick={onRetry}>
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

// --- Página Principal ---

export function DiscoveryPage() {
  const navigate = useNavigate();

  // --- Estados do Filtro ---
  const [citySearch, setCitySearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const debouncedCitySearch = useDebounce(citySearch, 400); 
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [canFetchSuggestions, setCanFetchSuggestions] = useState(true);


  const {
    currentProfile,
    isLoading,
    isQueueEmpty,
    requiresProfile,
    isError,
    error,
    removeCurrentProfile,
    refetchQueue,
  } = useDiscoveryQueue({ locationFilter }); 

  const {
    like,
    sendIcebreaker,
    likeStatus,
    icebreakerStatus,
  } = useDiscoveryMutations({});

  const isLiking = likeStatus === 'pending';
  const isSendingIcebreaker = icebreakerStatus === 'pending';

  // --- Handlers (sem alterações) ---
  const handleSkip = () => { /* ... */ if (currentProfile) { removeCurrentProfile(); } };
  const handleLike = () => { /* ... */ if (currentProfile && !isLiking && !isSendingIcebreaker) { like(currentProfile.userId); } };
  const handleSendMessage = (message: string) => { /* ... */ if (currentProfile && !isLiking && !isSendingIcebreaker && message.trim()) { sendIcebreaker({ targetUserId: currentProfile.userId, content: message }, { onSuccess: removeCurrentProfile }); } };
  const handleTap = (profileId: string) => { /* ... */ console.log(`Ação: EXPLORAR (Tap no Nome) perfil ${profileId}`); navigate(`/profile/${profileId}`); };


  // --- Handlers do Filtro (Atualizados) ---

  const triggerSearch = (cityToSearch: string) => {
    // (Esta função está correta, sem alterações)
    // ...
    setIsGeocoding(true);
    setSuggestions([]); 

    const geocodePromise = api.get<{ lat: number; lng: number }>(
      '/profile/geocode', 
      { params: { city: cityToSearch } }
    );

    toast.promise(
      geocodePromise,
      {
        loading: `Buscando coordenadas para ${cityToSearch}...`,
        success: (response: AxiosResponse<{ lat: number; lng: number }>) => {
          const coords = response.data;
          if (coords.lat === 0 && coords.lng === 0) {
            throw new Error('Cidade não encontrada pela API do Google.');
          }
          setLocationFilter(coords);
          setIsGeocoding(false);
          return 'Localização encontrada! Buscando perfis...';
        },
        error: (err: any) => {
          console.error('Erro no geocode:', err);
          setLocationFilter(null);
          setIsGeocoding(false);
          return err.response?.data?.message || err.message || 'Não foi possível encontrar essa cidade.';
        },
      }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    // (Esta função está correta, sem alterações)
    // ...
    e.preventDefault();
    if (!citySearch.trim()) {
      handleClearFilter();
      return;
    }
    setCanFetchSuggestions(false); 
    triggerSearch(citySearch);
  };

  // --- INÍCIO DA CORREÇÃO (Bug do Botão) ---
  // A função que é chamada quando o usuário clica numa sugestão
  const handleSuggestionClick = (suggestion: string) => {
    // 1. Parar de buscar mais sugestões
    setCanFetchSuggestions(false); 
    // 2. Colocar o texto selecionado no input
    setCitySearch(suggestion);
    // 3. Fechar a lista de sugestões
    setSuggestions([]); 
    // 4. NÃO iniciar a busca (triggerSearch)
    //    O usuário agora DEVE clicar em "Buscar".
  };
  // --- FIM DA CORREÇÃO ---

  const handleClearFilter = () => {
    // (Esta função está correta, sem alterações)
    // ...
    setCitySearch('');
    setLocationFilter(null);
    setSuggestions([]);
    setCanFetchSuggestions(true); 
  };

  // useEffect para buscar o Autocomplete
  useEffect(() => {
    // (Esta função está correta, sem alterações)
    // ...
    if (debouncedCitySearch.trim().length > 2 && !isGeocoding && canFetchSuggestions) {
      setIsFetchingSuggestions(true);
      
      api.get<string[]>('/profile/autocomplete', {
        params: { input: debouncedCitySearch }
      }).then(response => {
        setSuggestions(response.data);
      }).catch(err => {
        console.error("Erro ao buscar autocomplete:", err);
        setSuggestions([]);
      }).finally(() => {
        setIsFetchingSuggestions(false);
      });
      
    } else {
      setSuggestions([]);
    }
  }, [debouncedCitySearch, isGeocoding, canFetchSuggestions]);
  

  // --- Lógica de Renderização ---

  const renderContent = () => {
    if (requiresProfile) {
      // ... (sem alterações) ...
      return (
        <div className="flex flex-col h-full items-center justify-center text-center text-gray-400 p-4">
          <h2 className="text-xl font-semibold mb-3 text-white">Seu perfil está incompleto</h2>
          <p className="mb-6">Complete seu perfil para usar a descoberta.</p>
          <button
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold"
            onClick={() => navigate('/onboarding/profile')} 
          >
            Completar perfil
          </button>
        </div>
      );
    }
    if (isLoading) { return <LoadingSpinner />; }
    if (isError) { return <ErrorFallback error={error} onRetry={refetchQueue} />; }

    return (
      <div className="flex flex-col h-full bg-gray-950 text-white">
        
        {/* Formulário de Busca e Lista (sem alterações) */}
        <div className="absolute top-0 left-0 right-0 z-30 pt-6 px-4">
          <form 
            onSubmit={handleSearchSubmit} 
            className="relative w-full max-w-md mx-auto"
          >
            <input
              type="text"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                if (locationFilter) {
                  setLocationFilter(null);
                }
                setCanFetchSuggestions(true); 
              }}
              onBlur={() => {
                 if (!isGeocoding) {
                   setTimeout(() => setSuggestions([]), 150);
                 }
              }}
              disabled={isGeocoding} 
              placeholder="Buscar por cidade (ex: Guaíba)"
              className="w-full pl-10 pr-16 py-3 bg-black/30 backdrop-blur-md rounded-full text-white placeholder-gray-400 border border-transparent focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
              autoComplete="off"
            />
            {isFetchingSuggestions ? (
              <FiMapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 animate-pulse" />
            ) : (
              <FiSearch className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            )}
            
            {/* Este é o botão "X" (Limpar). Ele só aparece se locationFilter NÃO for nulo */}
            {locationFilter && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white"
                aria-label="Limpar filtro"
                disabled={isGeocoding} 
              >
                <FiX className="w-5 h-5" />
              </button>
            )}

            {/* Este é o botão "Buscar". Ele só aparece se locationFilter for nulo */}
            {!locationFilter && (
               <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-bold bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-70"
                aria-label="Buscar"
                disabled={isGeocoding || !citySearch.trim()} 
              >
                {isGeocoding ? '...' : 'Buscar'}
              </button>
            )}
          </form>

          {/* LISTA DE SUGESTÕES (Autocomplete) */}
          {suggestions.length > 0 && (
            <div className="relative w-full max-w-md mx-auto z-50">
              <ul className="absolute top-2 w-full bg-gray-800 border border-gray-700 rounded-2xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                {suggestions.map((sug) => (
                  <li
                    key={sug}
                    onMouseDown={() => handleSuggestionClick(sug)}
                    className="px-5 py-3 text-sm text-gray-200 hover:bg-indigo-600 hover:text-white cursor-pointer"
                  >
                    {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* ÁREA DO CARD (sem alterações) */}
        <div className="flex flex-1 justify-center overflow-hidden p-4 pt-24">
          <div className="relative w-full max-w-md h-full flex items-center justify-center">
            <AnimatePresence>
              {currentProfile ? (
                <ProfileCard
                  key={currentProfile.userId} 
                  profile={currentProfile}
                  onSwipe={handleSkip}
                  onTap={handleTap} 
                />
              ) : (
                <EmptyStateFallback />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ÁREA DE AÇÕES (sem alterações) */}
        <div className="left-0 right-0 w-full bg-gray-950/70 backdrop-blur-md p-4 border-t border-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.5)] mb-4">
          <DiscoveryActions
            onSkip={handleSkip}
            onLike={handleLike}
            onSendMessage={handleSendMessage}
            isLiking={isLiking}
            isSendingIcebreaker={isSendingIcebreaker}
          />
        </div>
      </div>
    );
  };

  return renderContent();
}

export default DiscoveryPage;