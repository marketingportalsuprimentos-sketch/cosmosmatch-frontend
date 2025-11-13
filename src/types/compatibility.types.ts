// frontend/src/types/compatibility.types.ts

import { FullNatalChart } from './profile.types';

// (Tipos AspectType, AspectQuality... iguais)
export type AspectType = 'Conjunção' | 'Trígono' | 'Quadratura' | 'Oposição' | 'Sextil';
export type AspectQuality = 'Positivo' | 'Desafiador' | 'Neutro';

// --- INÍCIO DA ALTERAÇÃO 1: ATUALIZAR INTERFACE 'Aspect' ---
// Altera 'planetA' para 'planetAName' para corresponder ao backend
export interface Aspect {
  planetAName: string; // Ex: "Vénus"
  planetBName: string; // Ex: "Marte"
  type: AspectType;
  quality: AspectQuality;
  orb: number;
  summary: string;
}
// --- FIM DA ALTERAÇÃO 1 ---

export interface SynastryReport {
  positiveAspects: Aspect[];
  challengingAspects: Aspect[];
}

// --- INÍCIO DA ALTERAÇÃO 2: ATUALIZAR 'FullSynastryPayload' ---
// Adiciona os nomes dos utilizadores
export interface FullSynastryPayload {
  report: SynastryReport;
  chartA: FullNatalChart;
  chartB: FullNatalChart;
  nameA: string; // Nome do Utilizador A
  nameB: string; // Nome do Utilizador B
}
// --- FIM DA ALTERAÇÃO 2 ---