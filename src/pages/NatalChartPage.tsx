// src/pages/NatalChartPage.tsx

import { useGetMyNatalChart } from '../features/profile/hooks/useProfile';
import { Link } from 'react-router-dom';
import { Profile, PowerAspect } from '@/types/profile.types'; 
import { NatalChartDisplay } from '@/features/astrology/components/NatalChartDisplay';
import { useState, useMemo } from 'react'; 
// --- INÍCIO DA REMOÇÃO (Limpeza de Imports) ---
// Removidos 'useSearchUsers', 'useDebounce', 'UserCircleIcon', 'MagnifyingGlassIcon'
import { 
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';
// --- FIM DA REMOÇÃO ---
import { PowerAspectCard } from '@/features/astrology/components/PowerAspectCard';
import { PowerAspectDetailModal } from '@/features/astrology/components/PowerAspectDetailModal'; 


// Componente de loading (igual)
const Loader = () => <div className="text-center p-8 text-white">A carregar plano astral...</div>;

// --- INÍCIO DA REMOÇÃO (Passo 1: Remover Calculadora) ---
// O componente 'SynastrySearchSection' foi completamente REMOVIDO deste ficheiro.
// Esta página é agora 100% focada no autoconhecimento.
// --- FIM DA REMOÇÃO ---

// (Componente da Galeria de Astrologia - igual)
const PowerAspectsGallery = ({ 
  cards,
  onCardClick,
  isModalOpen 
}: { 
  cards: PowerAspect[] | null | undefined;
  onCardClick: (card: PowerAspect) => void; 
  isModalOpen: boolean;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!cards || cards.length === 0) {
    return (
       <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">💎 Galeria de Cartas</h2>
          <p className="text-gray-400">Nenhum ponto-chave especial foi destacado no seu mapa ainda. (O motor de análise está a aprender!)</p>
       </div>
    );
  }

  const goToPrevious = () => {
    setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const goToNext = () => {
    setActiveIndex((prevIndex) => (prevIndex < cards.length - 1 ? prevIndex + 1 : prevIndex));
  };

  return (
    <div className={`
      transition-opacity duration-300 
      ${isModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
    `}>
      <h2 className="text-2xl font-semibold text-white mb-4 text-center">💎 Galeria de Cartas (Astrologia)</h2>
      
      {/* Container "Palco" do Carrossel */}
      <div className="relative h-[220px] w-full max-w-md mx-auto flex items-center justify-center">

        {/* --- 1. O Stack de Cartões --- */}
        {cards.map((card, index) => {
          const isActive = index === activeIndex;
          
          return (
            <div
              key={card.id}
              className={`
                absolute transition-all duration-300 ease-in-out
                ${isActive
                  ? 'opacity-100 scale-100 z-10' // Cartão Ativo
                  : 'opacity-0 scale-95 z-0 pointer-events-none' // Cartões Escondidos
                }
              `}
            >
              <PowerAspectCard card={card} onClick={() => onCardClick(card)} />
            </div>
          );
        })}

        {/* --- 2. Botão Anterior --- */}
        <button 
          onClick={goToPrevious}
          disabled={activeIndex === 0} 
          className="
            absolute left-0 -translate-x-4 md:-translate-x-8
            p-2 rounded-full bg-gray-700 hover:bg-indigo-500 
            text-white shadow-lg z-20
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-opacity
          "
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        {/* --- 3. Botão Próximo --- */}
        <button 
          onClick={goToNext}
          disabled={activeIndex === cards.length - 1} 
          className="
            absolute right-0 translate-x-4 md:translate-x-8
            p-2 rounded-full bg-gray-700 hover:bg-indigo-500 
            text-white shadow-lg z-20
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-opacity
          "
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* --- 4. Paginação (Pontos) --- */}
      <div className="flex justify-center space-x-2 mt-4">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`
              w-2 h-2 rounded-full 
              ${index === activeIndex ? 'bg-indigo-400' : 'bg-gray-600'}
              transition-colors
            `}
            aria-label={`Ir para a carta ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};


// (Galeria de Numerologia - Constantes e Componente - igual)
const NUMEROLOGY_CARD_DEFINITIONS: Record<string, { title: string; description: string; icon: string }> = {
  lifePathNumber: {
    title: 'Caminho de Vida',
    description: 'Este é o número da sua jornada de vida. Ele representa as lições que você veio aprender, os desafios que irá enfrentar e as oportunidades que surgirão. É a sua "missão" principal.',
    icon: 'sparkles',
  },
  expressionNumber: {
    title: 'Expressão (Destino)',
    description: 'Calculado a partir do seu nome completo de nascimento, este número revela os seus talentos natos e o seu potencial. É o que você veio "fazer" e como você se expressa no mundo.',
    icon: 'book-open',
  },
  soulNumber: {
    title: 'Desejo da Alma',
    description: 'Vindo das vogais do seu nome, este é o seu desejo mais íntimo. Representa a sua motivação interna, o que o seu coração realmente quer, independentemente das aparências externas.',
    icon: 'heart',
  },
  personalityNumber: {
    title: 'Personalidade',
    description: 'Vindo das consoantes do seu nome, este número é a sua "máscara" social. É a primeira impressão que os outros têm de si, as características que você mostra facilmente ao mundo.',
    icon: 'user',
  },
  birthdayNumber: {
    title: 'Dia de Nascimento',
    description: 'O dia do mês em que você nasceu revela um talento ou habilidade especial que o ajudará na sua jornada. É um dom particular que você pode usar para facilitar o seu Caminho de Vida.',
    icon: 'cake',
  },
};

const NumerologyGallery = ({ 
  cards,
  onCardClick,
  isModalOpen
}: { 
  cards: PowerAspect[] | null | undefined; 
  onCardClick: (card: PowerAspect) => void; 
  isModalOpen: boolean;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!cards || cards.length === 0) {
    return (
       <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">🔢 Galeria Numerológica</h2>
          <p className="text-gray-400">Preencha o seu "Nome Completo de Nascimento" no seu perfil para calcular todos os seus números.</p>
       </div>
    );
  }

  const goToPrevious = () => {
    setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const goToNext = () => {
    setActiveIndex((prevIndex) => (prevIndex < cards.length - 1 ? prevIndex + 1 : prevIndex));
  };

  return (
    <div className={`
      transition-opacity duration-300 
      ${isModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
    `}>
      <h2 className="text-2xl font-semibold text-white mb-4 text-center">🔢 Galeria Numerológica</h2>
      
      <div className="relative h-[220px] w-full max-w-md mx-auto flex items-center justify-center">
        {cards.map((card, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={card.id}
              className={`
                absolute transition-all duration-300 ease-in-out
                ${isActive
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-95 z-0 pointer-events-none'
                }
              `}
            >
              <PowerAspectCard card={card} onClick={() => onCardClick(card)} />
            </div>
          );
        })}
        <button 
          onClick={goToPrevious}
          disabled={activeIndex === 0} 
          className="absolute left-0 -translate-x-4 md:-translate-x-8 p-2 rounded-full bg-gray-700 hover:bg-indigo-500 text-white shadow-lg z-20 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={goToNext}
          disabled={activeIndex === cards.length - 1} 
          className="absolute right-0 translate-x-4 md:translate-x-8 p-2 rounded-full bg-gray-700 hover:bg-indigo-500 text-white shadow-lg z-20 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full ${index === activeIndex ? 'bg-indigo-400' : 'bg-gray-600'} transition-colors`}
            aria-label={`Ir para a carta ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};


const NatalChartPage = () => {
  
  // (Hooks - Ordem corrigida - igual)
  const { data: chartData, isLoading, error } = useGetMyNatalChart();
  const [selectedCard, setSelectedCard] = useState<PowerAspect | null>(null);
  const [selectedNumerologyCard, setSelectedNumerologyCard] = useState<PowerAspect | null>(null);

  const natalChart = chartData?.natalChart;
  const numerologyMap = chartData?.numerologyMap;
  const powerAspects = chartData?.powerAspects; 

  const numerologyCards = useMemo(() => {
    const cards: PowerAspect[] = [];
    if (!numerologyMap) return cards;

    const keys: (keyof typeof NUMEROLOGY_CARD_DEFINITIONS)[] = [
      'lifePathNumber',
      'expressionNumber',
      'soulNumber',
      'personalityNumber',
      'birthdayNumber',
    ];

    for (const key of keys) {
      const value = numerologyMap[key as keyof typeof numerologyMap];
      const definition = NUMEROLOGY_CARD_DEFINITIONS[key];

      if (value && definition) {
        cards.push({
          id: key, 
          title: `${definition.title} (Nº ${value})`, 
          description: definition.description,
          icon: definition.icon,
        });
      }
    }
    return cards;
  }, [numerologyMap]); 
  
  // (Tratamento de Loading/Error - igual)
  if (isLoading) return <Loader />;
  if (error) {
     let errorMessage = 'Erro ao carregar os dados do perfil. Tente novamente.';
     if ((error as any)?.response?.status === 403) {
       errorMessage = 'Acesso bloqueado. Você não cumpriu as metas de 5 seguidores e 10 a seguir.';
     }
     if ((error as any)?.response?.status === 404) {
        errorMessage = 'Dados de nascimento incompletos. Por favor, preencha o seu perfil (data, hora, cidade e nome de nascimento).';
     }
     if ((error as any)?.response?.status === 401) {
        errorMessage = 'Sessão inválida. Por favor, faça login novamente.';
     }
     return <div className="text-red-500 p-8 text-center">{errorMessage}</div>;
  }
  if (!chartData || !natalChart) {
    return (
       <div className="text-red-500 p-8 text-center">
         Dados de nascimento incompletos. Por favor, preencha o seu perfil (data, hora, cidade e nome de nascimento).
       </div>
    );
  }

  // (Return JSX - Atualizado)
  return (
    <> 
      <div className="text-white p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-300">Meu Plano Astral</h1>

        {/* Secção de Astrologia (Mandala) (igual) */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Astrologia</h2>
          <NatalChartDisplay chart={natalChart} />
        </div>

        {/* Galeria de Astrologia (igual) */}
        <div className="mb-8">
          <PowerAspectsGallery 
            cards={powerAspects} 
            onCardClick={setSelectedCard}
            isModalOpen={!!selectedCard || !!selectedNumerologyCard}
          />
        </div>
        
        {/* Galeria de Numerologia (igual) */}
        <div className="mb-8">
           <NumerologyGallery
            cards={numerologyCards}
            onCardClick={setSelectedNumerologyCard}
            isModalOpen={!!selectedCard || !!selectedNumerologyCard}
           />
        </div>

        {/* --- INÍCIO DA REMOÇÃO (Passo 1: Remover Calculadora) --- */}
        {/* A secção <SynastrySearchSection /> foi REMOVIDA daqui. */}
        {/* --- FIM DA REMOÇÃO --- */}

         {/* Botão Voltar (igual) */}
         <div className="text-center mt-8">
              <Link to="/profile" className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-500 transition-colors">
                  Voltar ao Perfil
              </Link>
         </div>
      </div>

      {/* Modais (iguais) */}
      <PowerAspectDetailModal 
        card={selectedCard} 
        onClose={() => setSelectedCard(null)} 
      />
      
      <PowerAspectDetailModal 
        card={selectedNumerologyCard} 
        onClose={() => setSelectedNumerologyCard(null)} 
      />
    </>
  );
};

export default NatalChartPage;