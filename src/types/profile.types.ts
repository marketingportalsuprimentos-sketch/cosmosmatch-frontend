// src/types/profile.types.ts
// (COLE ISTO NO SEU ARQUIVO)

// Este ficheiro espelha os DTOs e Modelos do Profile no backend

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

export interface PowerAspect {
  id: string; // ex: "SOL_CASA_10"
  title: string; // ex: "O Estratega de Carreira"
  description: string;
  icon: string; // ex: "briefcase"
}

// O que enviamos para PATCH /profile
export interface UpdateProfileDto {
  birthDate?: string;
  birthCity?: string;
  birthTime?: string; // Formato "HH:MM"
  fullNameBirth?: string;
  currentCity?: string;
  gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER';
  bio?: string;
  
  // --- INÍCIO DA CORREÇÃO (Erro 500 do Asaas) ---
  cpfCnpj?: string; // Adicionado para corresponder ao schema.prisma
  // --- FIM DA CORREÇÃO ---
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
  fullNameBirth: string | null;
  currentCity: string | null;
  gender: string | null;
  bio: string | null;
  imageUrl: string | null; // Avatar
  
  // --- INÍCIO DA CORREÇÃO (Erro 500 do Asaas) ---
  cpfCnpj: string | null; // Adicionado para corresponder ao schema.prisma
  // --- FIM DA CORREÇÃO ---

  natalChart: FullNatalChart | null;
  numerologyMap: {
    lifePathNumber: number | null;
    expressionNumber: number | null;
    soulNumber: number | null;
    personalityNumber: number | null;
    birthdayNumber: number | null;
  } | null;
  powerAspects: PowerAspect[] | null;
  
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