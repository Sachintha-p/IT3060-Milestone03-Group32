import { apiClient } from '@/api/client';
import { SpaceSummaryDTO } from '../../feature1/types';
import { Book } from '../../feature2/api';

export interface OccupancySummaryDTO {
    availableSpaces: number;
    reservedSpaces: number;
    occupiedSpaces: number;
    totalCapacity: number;
}

export interface DashboardZoneSummaryDTO {
    zone: string;
    availableSpaces: number;
    reservedSpaces: number;
    occupiedSpaces: number;
    totalCapacity: number;
}

export interface StaffAlert {
    id: number;
    type: string;
    message: string;
    priority: string;
    zone?: string;
    isRead: boolean;
    resolved: boolean;
    createdAt: string;
}

export interface Feature3DashboardDTO {
    zones: DashboardZoneSummaryDTO[];
    unresolvedAlerts: number;
}

export interface Feature3StaffSettingDTO {
    pushAlerts: boolean;
    emailDigest: boolean;
}

export const feature3Api = {
    getDashboard: async (): Promise<Feature3DashboardDTO> => {
        const res = await apiClient.get('/api/feature3/dashboard');
        return res.data.data;
    },
    getZoneSpaces: async (zoneName: string): Promise<SpaceSummaryDTO[]> => {
        const res = await apiClient.get(`/api/feature3/zones/${zoneName}/spaces`);
        return res.data.data;
    },
    updateSpaceStatus: async (id: number, status: string): Promise<SpaceSummaryDTO> => {
        const res = await apiClient.patch(`/api/feature3/spaces/${id}/status`, { status });
        return res.data.data;
    },
    searchBooks: async (q: string): Promise<Book[]> => {
        const res = await apiClient.get('/api/feature3/books', { params: { q } });
        return res.data.data;
    },
    updateBookStatus: async (id: number, status: string): Promise<Book> => {
        const res = await apiClient.patch(`/api/feature3/books/${id}/status`, { status });
        return res.data.data;
    },
    getShelvingLogs: async (bookId: number): Promise<any[]> => {
        const res = await apiClient.get(`/api/feature3/books/${bookId}/logs`);
        return res.data.data;
    },
    getAlerts: async (range: string = 'today'): Promise<StaffAlert[]> => {
        const res = await apiClient.get('/api/feature3/alerts', { params: { range } });
        return res.data.data;
    },
    resolveAlert: async (id: number): Promise<StaffAlert> => {
        const res = await apiClient.patch(`/api/feature3/alerts/${id}/resolve`, {});
        return res.data.data;
    },
    deleteAlert: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/feature3/alerts/${id}`);
    },
    markAllAlertsRead: async (): Promise<void> => {
        await apiClient.patch('/api/feature3/alerts/read-all', {});
    },
    createManualAlert: async (alert: Partial<StaffAlert>): Promise<StaffAlert> => {
        const res = await apiClient.post('/api/feature3/alerts', alert);
        return res.data.data;
    },
    getSettings: async (): Promise<Feature3StaffSettingDTO> => {
        const res = await apiClient.get('/api/feature3/settings');
        return res.data.data;
    },
    updateSettings: async (settings: Feature3StaffSettingDTO): Promise<Feature3StaffSettingDTO> => {
        const res = await apiClient.put('/api/feature3/settings', settings);
        return res.data.data;
    }
};
