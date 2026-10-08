import { apiClient } from '@/api/client';
import { AxiosError } from 'axios';

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface ReportSummary {
  id: number;
  type: string;
  dateFrom: string;
  dateTo: string;
  createdBy: string;
  summary: string;
  headline?: string;
  createdAt: string;
  result?: any;
}

export interface GenerateReportRequest {
  type: string;
  dateFrom: string;
  dateTo: string;
}

export interface AdminSetting {
  id: number;
  occupancyThreshold: number;
  autoGenerateWeeklyReport: boolean;
  allowGuestLookups: boolean;
}

export const handleError = (err: unknown): string => {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    const serverMessage = err.response?.data?.message || err.response?.data?.error;
    
    if (status === 401) return 'Your session has expired';
    if (status === 403) return 'You do not have permission';
    if (status === 400 || status === 409) return serverMessage || 'Invalid request';
    
    if (err.code === 'ECONNABORTED' || err.message.includes('Network Error')) {
      return 'Server is waking up, please try again';
    }
  }
  return 'Something went wrong. Please try again';
};

export const feature4 = {
  users: {
    getAll: async (q?: string, role?: string, status?: string) => {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (role && role !== 'ALL') params.append('role', role);
      if (status && status !== 'ALL') params.append('status', status);
      const res = await apiClient.get<{ data: UserSummary[] }>(`/api/feature4/users?${params.toString()}`);
      return res.data.data;
    },
    create: async (data: CreateUserRequest) => {
      const res = await apiClient.post<{ data: UserSummary }>('/api/feature4/users', data);
      return res.data.data;
    },
    updateRole: async (id: number, role: string) => {
      await apiClient.patch(`/api/feature4/users/${id}/role`, { role });
    },
    updateStatus: async (id: number, status: string) => {
      await apiClient.patch(`/api/feature4/users/${id}/status`, { status });
    },
    delete: async (id: number) => {
      await apiClient.delete(`/api/feature4/users/${id}`);
    }
  },
  reports: {
    getAll: async () => {
      const res = await apiClient.get<{ data: ReportSummary[] }>('/api/feature4/reports');
      return res.data.data;
    },
    getById: async (id: number) => {
      const res = await apiClient.get<{ data: ReportSummary }>(`/api/feature4/reports/${id}`);
      return res.data.data;
    },
    create: async (data: GenerateReportRequest) => {
      const res = await apiClient.post<{ data: ReportSummary }>('/api/feature4/reports', data);
      return res.data.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/api/feature4/reports/${id}`);
    }
  },
  settings: {
    get: async () => {
      const res = await apiClient.get<{ data: AdminSetting }>('/api/feature4/settings');
      return res.data.data;
    },
    update: async (data: Partial<AdminSetting>) => {
      const res = await apiClient.put<{ data: AdminSetting }>('/api/feature4/settings', data);
      return res.data.data;
    }
  }
};
