// src/features/profile/components/BehavioralQuizModal.tsx
// (CORRIGIDO: Ícones Heroicons + Hook useUpdateProfile correto)

import { useState, useEffect } from 'react';
// 1. Correção: Usando Heroicons em vez de Lucide
import { XMarkIcon, ChevronRightIcon, ChevronLeftIcon, CheckIcon } from '@heroicons/react/24/solid';
import { ZODIAC_QUESTIONS } from '@/constants/zodiacQuestions';
// 2. Correção: Importando o hook específico que existe no seu ficheiro
import { useUpdateProfile } from '@/features/profile/hooks/useProfile'; 
import { toast } from '@/lib/toast';

interface BehavioralQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  sunSign: string;
  existingAnswers?: number[];
}

// Helper para traduzir/normalizar o signo
const getSignKey = (sign: string): string => {
  const map: Record<string, string> = {
    'Áries': 'Aries', 'Aries': 'Aries',
    'Touro': 'Taurus', 'Taurus': 'Taurus',
    'Gêmeos': 'Gemini', 'Gemini': 'Gemini',
    'Câncer': 'Cancer', 'Cancer': 'Cancer',
    'Leão': 'Leo', 'Leo': 'Leo',
    'Virgem': 'Virgo', 'Virgo': 'Virgo',
    'Libra': 'Libra', // 3. Correção: Removida a duplicata
    'Escorpião': 'Scorpio', 'Scorpio': 'Scorpio',
    'Sagitário': 'Sagittarius', 'Sagittarius': 'Sagittarius',
    'Capricórnio': 'Capricorn', 'Capricorn': 'Capricorn',
    'Aquário': 'Aquarius', 'Aquarius': 'Aquarius',
    'Peixes': 'Pisces', 'Pisces': 'Pisces',
  };
  return map[sign] || 'Capricorn'; // Fallback
};

export const BehavioralQuizModal = ({ isOpen, onClose, sunSign, existingAnswers }: BehavioralQuizModalProps) => {
  // 4. Correção: Usando a mutação correta do seu hook
  const { mutateAsync: updateProfileFn } = useUpdateProfile();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(20).fill(5));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signKey = getSignKey(sunSign);
  const questions = ZODIAC_QUESTIONS[signKey] || ZODIAC_QUESTIONS['Capricorn'];
  
  useEffect(() => {
    if (existingAnswers && existingAnswers.length === 20) {
      setAnswers(existingAnswers);
    }
  }, [existingAnswers]);

  if (!isOpen) return null;

  const currentQuestion = questions[currentStep];
  const currentVal = answers[currentStep];

  const handleSliderChange = (val: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = val;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentStep < 19) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 5. Correção: Chamando a função renomeada
      await updateProfileFn({
        behavioralAnswers: answers
      });
      toast.success('Sintonia atualizada com sucesso!');
      onClose();
    } catch (error) {
      console.error(error);
      // O seu hook já tem toast de erro, mas deixamos aqui por segurança
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSliderColor = (val: number) => {
    if (val <= 3) return 'accent-gray-500';
    if (val <= 7) return 'accent-indigo-500';
    return 'accent-green-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Sintonia Cósmica</h2>
            <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">
              {currentQuestion.category}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full h-1 bg-gray-800">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / 20) * 100}%` }}
          />
        </div>

        {/* Conteúdo (Pergunta + Slider) */}
        <div className="p-6 flex-1 flex flex-col justify-center">
          <span className="text-sm text-gray-500 mb-2 block">
            Pergunta {currentQuestion.id} de 20
          </span>
          
          <h3 className="text-xl text-white font-medium leading-relaxed mb-8 min-h-[80px]">
            {currentQuestion.text}
          </h3>

          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-400 mb-2 font-semibold">
              <span>Não sou assim (0)</span>
              <span className="text-indigo-300 text-lg">{currentVal}</span>
              <span>Totalmente eu (10)</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={currentVal}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className={`w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer ${getSliderColor(currentVal)}`}
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-1 px-1">
              {[...Array(11)].map((_, i) => (
                <span key={i}>|</span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer (Botões) */}
        <div className="p-4 bg-gray-800/50 flex justify-between items-center">
          <button 
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${currentStep === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-gray-700'}`}
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" /> Anterior
          </button>

          <button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-900/20"
          >
            {isSubmitting ? (
              'Salvando...'
            ) : currentStep === 19 ? (
              <>Finalizar <CheckIcon className="w-5 h-5 ml-2" /></>
            ) : (
              <>Próxima <ChevronRightIcon className="w-5 h-5 ml-2" /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};