// frontend/src/features/compatibility/services/compatibilityApi.ts
// (CORREÇÃO FINAL - Rota ajustada para incluir '/synastry')

import { api } from '@/services/api';
import { FullSynastryPayload } from '@/types/compatibility.types';

// --- Tipos de Numerologia ---
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


/**
 * Busca o relatório de sinastria (ASTROLOGIA) detalhado COM OS MAPAS
 * Chama GET /api/compatibility/synastry/:userId
 */
export const getSynastryReport = async (
  targetUserId: string,
): Promise<FullSynastryPayload> => { 
  try {
    // CORREÇÃO AQUI: Adicionado '/synastry' na rota para buscar o relatório completo
    // Antes estava chamando a rota de score básico (/compatibility/:id)
    const response = await api.get<FullSynastryPayload>(
      `/compatibility/synastry/${targetUserId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar relatório de sinastria:', error);
    throw error;
  }
};


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