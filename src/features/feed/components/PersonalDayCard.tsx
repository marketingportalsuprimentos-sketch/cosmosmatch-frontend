// frontend/src/features/feed/components/PersonalDayCard.tsx
// (COLE ISTO NO SEU ARQUIVO)

// --- INÍCIO DA ALTERAÇÃO (Lógica de localStorage) ---
import { memo, useState, useEffect } from 'react'; // 1. Importar useEffect
import { motion } from 'framer-motion';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useGetPersonalDayVibration } from '@/features/profile/hooks/useProfile';

// 2. Chave para guardar no navegador
const LOCAL_STORAGE_KEY = 'cosmosmatch_dismissed_personal_day';

// 3. Função helper para pegar a data de hoje (ex: "2025-11-12")
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};
// --- FIM DA ALTERAÇÃO ---


// (Constante PERSONAL_DAY_TEXTS - Sem alterações)
const PERSONAL_DAY_TEXTS: Record<number, { title: string; text: string }> = {
  1: { title: 'Vibração 1: O Início', text: 'Um dia para novos começos, liderança e focar na sua independência.' },
  2: { title: 'Vibração 2: A Parceria', text: 'Foque na diplomacia, paciência e cooperação com os outros.' },
  3: { title: 'Vibração 3: A Comunicação', text: 'Excelente para socializar, expressar sua criatividade e se divertir.' },
  4: { title: 'Vibração 4: O Construtor', text: 'Dia de trabalho focado, organização e planeamento prático.' },
  5: { title: 'Vibração 5: A Liberdade', text: 'Espere o inesperado. Um dia para mudanças, viagens e aventura.' },
  6: { title: 'Vibração 6: O Lar', text: 'Foco na harmonia, família, e responsabilidades afetivas.' },
  7: { title: 'Vibração 7: O Sábio', text: 'Dia de introspecção, estudo e busca por respostas internas.' },
  8: { title: 'Vibração 8: O Poder', text: 'Foco em finanças, carreira e poder pessoal. Ótimo para negócios.' },
  9: { title: 'Vibração 9: A Finalização', text: 'Bom para concluir ciclos, praticar o desapego e a compaixão.' },
  11: { title: 'Mestre 11: A Intuição', text: 'Sua intuição está no auge. Preste atenção aos sinais e insights.' },
  22: { title: 'Mestre 22: O Mestre Construtor', text: 'Capacidade de manifestar grandes projetos. Foque no longo prazo.' },
  33: { title: 'Mestre 33: A Compaixão', text: 'Um dia de cura, serviço aos outros e responsabilidade elevada.' },
};

/**
 * O Card que mostra a vibração do dia pessoal do utilizador.
 */
const PersonalDayCardInternal = () => {
  const { data: personalDayData, isLoading, isError } = useGetPersonalDayVibration();
  
  // --- INÍCIO DA ALTERAÇÃO (Estado de Visibilidade) ---
  // 4. O estado inicial agora é lido do localStorage
  const [isVisible, setIsVisible] = useState(() => {
    const dismissedDate = localStorage.getItem(LOCAL_STORAGE_KEY);
    const todayDate = getTodayDateString();
    // Se a data guardada NÃO for a de hoje, o card é visível
    return dismissedDate !== todayDate;
  });

  // 5. Adicionamos um 'Effect' para o caso de o dia "virar" (meia-noite)
  //    enquanto o utilizador está com a app aberta no feed.
  useEffect(() => {
    const checkDate = () => {
      const dismissedDate = localStorage.getItem(LOCAL_STORAGE_KEY);
      const todayDate = getTodayDateString();
      
      // Se a data de hoje for diferente da data guardada
      if (dismissedDate !== todayDate) {
        // Mostra o card (é um novo dia!)
        setIsVisible(true);
      }
    };

    // Verifica a cada hora
    const intervalId = setInterval(checkDate, 60 * 60 * 1000); 
    return () => clearInterval(intervalId);
  }, []); // Só corre uma vez, quando o componente monta
  // --- FIM DA ALTERAÇÃO ---


  // 6. Handler para fechar o card (atualizado)
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede cliques acidentais
    setIsVisible(false); // Esconde-o
    
    // --- INÍCIO DA ALTERAÇÃO ---
    // 7. Guarda a data de HOJE no localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, getTodayDateString());
    // --- FIM DA ALTERAÇÃO ---
  };

  // 8. Se não estiver visível, não renderiza nada
  if (!isVisible) {
    return null;
  }

  // (Lógica de dados - Sem alterações)
  if (isLoading || isError || !personalDayData) {
    return null;
  }
  const dayNumber = personalDayData.dayNumber;
  const content = PERSONAL_DAY_TEXTS[dayNumber];
  if (!content) return null; 

  return (
    <motion.div
      className="absolute top-[calc(1.5rem+2.5rem+1rem)] left-4 right-4 z-10 p-3 bg-black/50 backdrop-blur-md rounded-lg border border-purple-400/30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* 9. Adicionar o botão "X" (já estava, mas agora funciona) */}
      <button
        onClick={handleClose}
        className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white transition-colors z-20"
        aria-label="Fechar mensagem"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
      
      <div className="flex items-start">
        <SparklesIcon className="w-6 h-6 text-purple-400 mr-3 flex-shrink-0" />
        <div className="pr-4">
          <h3 className="font-semibold text-white">{content.title}</h3>
          <p className="text-xs text-gray-300">{content.text}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Exporta a versão memoizada
export const PersonalDayCard = memo(PersonalDayCardInternal);