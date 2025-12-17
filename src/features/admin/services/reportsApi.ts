import { api } from '@/services/api';

export interface AdminReport {
  id: string;
  createdAt: string;
  reason: string;
  description: string | null;
  type: 'POST' | 'PROFILE';
  targetId: string | null; // ID do post, se houver
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reported: {
    id: string;
    name: string;
    email: string;
    isBanned: boolean;
  };
}

export const getPendingReports = async (): Promise<AdminReport[]> => {
  const { data } = await api.get<AdminReport[]>('/reports/pending');
  return data;
};

export const resolveReport = async (
  reportId: string,
  status: 'RESOLVED' | 'DISMISSED'
): Promise<void> => {
  await api.patch(`/reports/${reportId}/resolve`, { status });
};