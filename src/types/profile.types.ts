// src/types/profile.types.ts

// Este ficheiro espelha os DTOs e Modelos do Profile no backend

// --- INÍCIO DA ALTERAÇÃO 1: DEFINIR NOVOS TIPOS DE MAPA ASTRAL ---
// Estes tipos espelham as interfaces FullNatalChart do backend

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
  meaning: string;
}

export interface HouseCusp {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
}

export interface FullNatalChart {
  planets: PlanetPosition[];
  houses: HouseCusp[];
}
// --- FIM DA ALTERAÇÃO 1 ---

// --- INÍCIO DA ADIÇÃO (Ação 3: Tipos das Cartas) ---
/**
 * Define a estrutura de uma "Carta de Poder" ou "Medalha Astrológica"
 * que vem do backend (de astrology.service.ts)
 */
export interface PowerAspect {
  id: string; // ex: "SOL_CASA_10"
  title: string; // ex: "O Estratega de Carreira"
  description: string;
  icon: string; // ex: "briefcase"
}
// --- FIM DA ADIÇÃO ---

// O que enviamos para PATCH /profile
export interface UpdateProfileDto {
  birthDate?: string;
  birthCity?: string;
  birthTime?: string; // Formato "HH:MM"
  
  // --- INÍCIO DA ADIÇÃO (Ideia 1: Numerologia) ---
  fullNameBirth?: string;
  // --- FIM DA ADIÇÃO ---
  
  currentCity?: string;
  gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER';
  bio?: string;
}

// Tipo para uma Conexão individual (baseado no seu ficheiro antigo)
export interface Connection {
  id: string;
  name: string;
  mainPhotoUrl: string | null;
}

// O que recebemos de GET /profile ou das respostas de PATCH
export interface Profile {
  id: string;
  userId: string;
  user?: {
    name: string;
    email?: string;
    _count?: {
      followers: number;
      following: number;
    };
  };
  birthDate: string | null;
  birthCity: string | null;
  birthTime: string | null;

  // --- INÍCIO DA ADIÇÃO (Ideia 1: Numerologia) ---
  fullNameBirth: string | null;
  // --- FIM DA ADIÇÃO ---

  currentCity: string | null;
  gender: string | null;
  bio: string | null;
  imageUrl: string | null; // Avatar
  
  // --- INÍCIO DA ALTERAÇÃO 2: ATUALIZAR INTERFACE DO PERFIL ---
  // O natalChart agora usa a nossa nova interface completa
  natalChart: FullNatalChart | null;
  
  // --- INÍCIO DA ALTERAÇÃO (Ideia 1: Mapa Numerológico Completo) ---
  // O numerologyMap agora espelha o backend (5 números)
  numerologyMap: {
    lifePathNumber: number | null;
    expressionNumber: number | null;
    soulNumber: number | null;
    personalityNumber: number | null;
    birthdayNumber: number | null;
  } | null;
  // --- FIM DA ALTERAÇÃO ---

  // --- INÍCIO DA ADIÇÃO (Ação 3: Campo das Cartas) ---
  powerAspects: PowerAspect[] | null;
  // --- FIM DA ADIÇÃO ---
  
  connections?: Connection[]; 
}


// Tipo para a Compatibilidade
export interface CompatibilityResult {
  totalScore: number;
  summary: string;
  details: {
    astrology: { totalScore: number; summary: string };
    numerology: { totalScore: number; summary: string };
  };
}

// O que o backend retorna para um Like de foto de perfil
export interface ProfilePhotoLike {
  createdAt: string;
  userId: string;
  photoId: string;
}

// Novo tipo para os endpoints de 'social'
export interface BasicUserInfo {
  id: string;
  name: string;
  profile: {
    imageUrl: string | null;
  } | null;
}

// O que o backend retorna para um Comentário de foto de perfil
export interface ProfilePhotoComment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  photoId: string;
  user: BasicUserInfo;
}

// Tipo para as Fotos da Galeria
export interface ProfilePhoto {
  id: string;
  url: string;
  order: number;
  profileId: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  comments?: ProfilePhotoComment[];
}

// O que enviamos para POST /profile/gallery/:photoId/comment
export interface CreateProfilePhotoCommentDto {
  content: string;
}