// frontend/src/features/admin/services/adminApi.ts
import { api } from '@/services/api';
import { AuthUser, Subscription } from '@/types/auth.types';

// --- Tipos de Dados ---

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AuthUser['role'];
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  age: number | null;
  gender: string | null;
  currentCity: string | null;
  subscription: {
    status: Subscription['status'];
    expiresAt: string | null;
    freeContactsUsed: number;
  } | null;
  _count: {
    posts: number;
    messages: number;
    following: number;
    photos: number;
  };
}

export interface PaginatedUsersResponse {
  data: AdminUser[];
  count: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalUsers: number;
  subscribedUsers: number;
  totalRevenue: number;
  totalPayments: number;
  confirmedPayments: number;
  totalMessages: number;
  totalMatches: number;
  newUsers: number;
  usersAtPaywall: number;
  conversionRate: number;
}

export interface UserCoordinate {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// --- Funções da API ---

/**
 * Busca a lista paginada de utilizadores
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
 * Busca as estatísticas do dashboard
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get<DashboardStats>('/admin/users/dashboard-stats');
  return data;
};

/**
 * Busca coordenadas para o mapa
 */
export const getUserCoordinates = async (): Promise<UserCoordinate[]> => {
  const { data } = await api.get<UserCoordinate[]>(
    '/admin/users/coordinates',
  );
  return data;
};

/**
 * Bane um utilizador (Muda isBanned para true)
 */
export const banUser = async (userId: string): Promise<void> => {
  await api.patch(`/admin/users/${userId}/ban`);
};

/**
 * Apaga um post como Admin (usando a rota padrão de delete)
 */
export const deletePostAsAdmin = async (postId: string): Promise<void> => {
  await api.delete(`/post/${postId}`);
};