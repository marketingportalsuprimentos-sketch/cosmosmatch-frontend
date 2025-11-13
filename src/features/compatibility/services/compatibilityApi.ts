// frontend/src/features/compatibility/services/compatibilityApi.ts

import { api } from '@/services/api';
// --- INÍCIO DA ALTERAÇÃO ---
// Importamos a nova interface de resposta completa
import { FullSynastryPayload } from '@/types/compatibility.types';
// --- FIM DA ALTERAÇÃO ---

// --- INÍCIO DA ADIÇÃO (Ideia 2: Tipos de Numerologia) ---
// Estes tipos devem espelhar os tipos do backend (compatibility.service.ts)

export type NumerologyReportItem = {
  name: string; // "Caminho de Vida", "Expressão", etc.
  numberA: number; // O número do Utilizador A
  numberB: number; // O número do Utilizador B
  quality: 'Harmônico' | 'Neutro' | 'Desafiador';
  summary: string; // O texto que explica a interação
};

export interface FullNumerologyReport {
  reportItems: NumerologyReportItem[];
  nameA: string; // Nome do Utilizador A
  nameB: string; // Nome do Utilizador B
}
// --- FIM DA ADIÇÃO ---


/**
 * Busca o relatório de sinastria (ASTROLOGIA) detalhado COM OS MAPAS
 * Chama GET /api/compatibility/:userId
 */
export const getSynastryReport = async (
  targetUserId: string,
): Promise<FullSynastryPayload> => { // <-- TIPO DE RETORNO MUDADO
  try {
    const response = await api.get<FullSynastryPayload>( // <-- TIPO DE GET MUDADO
      `/compatibility/${targetUserId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar relatório de sinastria:', error);
    throw error;
  }
};


// --- INÍCIO DA ADIÇÃO (Ideia 2: API de Numerologia) ---

/**
 * Busca o relatório de compatibilidade (NUMEROLOGIA)
 * Chama GET /api/compatibility/numerology/:userId
 */
export const getNumerologyReport = async (
  targetUserId: string,
): Promise<FullNumerologyReport> => {
  try {
    const response = await api.get<FullNumerologyReport>(
      `/compatibility/numerology/${targetUserId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar relatório de numerologia:', error);
    throw error;
  }
};
// --- FIM DA ADIÇÃO ---