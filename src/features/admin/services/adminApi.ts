// frontend/src/features/admin/services/adminApi.ts
import { api } from '@/services/api';
import { AuthUser, Subscription } from '@/types/auth.types';

// --- Tipos de Dados (Versão 2) ---

// Interface para um único utilizador na lista do Admin
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AuthUser['role'];
  createdAt: string;
  updatedAt: string; // <-- Adicionado: Última Atividade
  age: number | null; // <-- Adicionado: Idade
  gender: string | null; // <-- Adicionado: Gênero
  currentCity: string | null; // <-- Adicionado: Localidade
  subscription: {
    status: Subscription['status'];
    expiresAt: string | null;
    freeContactsUsed: number; // <-- Adicionado: Uso Gratuito
  } | null;
  _count: {
    posts: number;
    messages: number;
    following: number; // <-- Adicionado: Conexões
    photos: number; // <-- Adicionado: Fotos
  };
}

// Interface para a resposta paginada
export interface PaginatedUsersResponse {
  data: AdminUser[];
  count: number;
  page: number;
  limit: number;
}

// Interface para as estatísticas (Versão 2)
export interface DashboardStats {
  totalUsers: number;
  subscribedUsers: number;
  totalRevenue: number;
  totalPayments: number;
  confirmedPayments: number;
  totalMessages: number;
  totalMatches: number;
  newUsers: number; // <-- Adicionado
  usersAtPaywall: number; // <-- Adicionado
  conversionRate: number; // <-- Adicionado
}

// --- INÍCIO DA ADIÇÃO (Plano do Mapa V2) ---
// Interface para a nova rota de coordenadas
export interface UserCoordinate {
  id: string;
  name: string;
  lat: number;
  lng: number;
}
// --- FIM DA ADIÇÃO ---

// --- Funções da API ---

/**
 * Busca a lista paginada de utilizadores (Apenas Admin)
 */
export const getUsersList = async (
  page = 1,
  limit = 10,
): Promise<PaginatedUsersResponse> => {
  const { data } = await api.get<PaginatedUsersResponse>('/admin/users', {
    params: { page, limit },
  });
  return data;
};

/**
 * Busca as estatísticas do dashboard (Apenas Admin)
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get<DashboardStats>('/admin/users/dashboard-stats');
  return data;
};

// --- INÍCIO DA ADIÇÃO (Plano do Mapa V2) ---
/**
 * Busca TODAS as coordenadas de utilizadores para o mapa (Apenas Admin)
 */
export const getUserCoordinates = async (): Promise<UserCoordinate[]> => {
  const { data } = await api.get<UserCoordinate[]>(
    '/admin/users/coordinates',
  );
  return data;
};
// --- FIM DA ADIÇÃO ---