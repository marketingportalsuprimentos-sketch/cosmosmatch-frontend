// frontend/src/features/compatibility/hooks/useCompatibilityQueries.ts

import { useQuery } from '@tanstack/react-query';
// --- INÍCIO DA ADIÇÃO (Ideia 2) ---
import {
  getSynastryReport,
  getNumerologyReport, // <-- 1. Importar a nova função da API
  FullNumerologyReport, // <-- 2. Importar o novo tipo de retorno
} from '../services/compatibilityApi';
// --- FIM DA ADIÇÃO ---

// --- INÍCIO DA ALTERAÇÃO ---
// Trocamos 'SynastryReport' pela nova resposta completa
import { FullSynastryPayload } from '@/types/compatibility.types';
// --- FIM DA ALTERAÇÃO ---

/**
 * Hook para buscar o relatório de sinastria (ASTROLOGIA) COMPLETO (com mapas).
 * Fica desabilitado por defeito (enabled: false) e só
 * será ativado (ex: por um clique) quando o 'targetUserId' for fornecido.
 */
export const useGetSynastryReport = (
  targetUserId: string | null | undefined,
) => {
  // --- INÍCIO DA ALTERAÇÃO ---
  // Atualizamos o tipo genérico do useQuery
  return useQuery<FullSynastryPayload, Error>({
  // --- FIM DA ALTERAÇÃO ---
    queryKey: ['synastryReport', targetUserId],
    queryFn: () => {
      if (!targetUserId) {
        throw new Error('Target user ID is required to fetch synastry report');
      }
      return getSynastryReport(targetUserId);
    },
    enabled: !!targetUserId, 
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
};


// --- INÍCIO DA ADIÇÃO (Ideia 2: Hook de Numerologia) ---

/**
 * Hook para buscar o relatório de compatibilidade (NUMEROLOGIA).
 */
export const useGetNumerologyReport = (
  targetUserId: string | null | undefined,
) => {
  return useQuery<FullNumerologyReport, Error>({
    queryKey: ['numerologyReport', targetUserId],
    queryFn: () => {
      if (!targetUserId) {
        throw new Error('Target user ID is required to fetch numerology report');
      }
      return getNumerologyReport(targetUserId);
    },
    enabled: !!targetUserId, // Só executa se o ID for válido
    staleTime: 1000 * 60 * 10, // Cache de 10 minutos
    retry: false, // Não tenta novamente em caso de erro (ex: 400 Bad Request)
  });
};
// --- FIM DA ADIÇÃO ---