import { apiClient } from '@/api/client';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  status: 'AVAILABLE' | 'CHECKED_OUT' | 'MISSING';
  floor: string;
  shelf: string;
}

export interface RestockAlert {
  id: number;
  book: Book;
  channels: ('PUSH' | 'EMAIL')[];
  status: 'WAITING' | 'NOTIFIED' | 'CANCELLED';
  createdAt: string;
}

export interface SearchHistory {
  id: number;
  query: string;
}

export const feature2Api = {
  searchBooks: async (search: string = '') => {
    const response = await apiClient.get<{ data: Book[] }>('/api/books', {
      params: { search }
    });
    return response.data.data;
  },
  
  getBookDetails: async (id: number) => {
    const response = await apiClient.get<{ data: Book }>(`/api/books/${id}`);
    return response.data.data;
  },
  
  createAlert: async (bookId: number, channels: string[]) => {
    const response = await apiClient.post<{ data: RestockAlert }>('/api/alerts', {
      bookId,
      channels
    });
    return response.data.data;
  },
  
  getMyAlerts: async () => {
    const response = await apiClient.get<{ data: RestockAlert[] }>('/api/alerts');
    return response.data.data;
  },
  
  cancelAlert: async (id: number) => {
    await apiClient.delete(`/api/alerts/${id}`);
  },

  updateAlert: async (id: number, channels: string[]) => {
    const response = await apiClient.patch<{ data: RestockAlert }>(`/api/alerts/${id}`, { channels });
    return response.data.data;
  },

  getSearchHistory: async () => {
    const response = await apiClient.get<{ data: SearchHistory[] }>('/api/books/search-history');
    return response.data.data;
  },
  
  addSearchHistory: async (query: string) => {
    await apiClient.post('/api/books/search-history', { query });
  },

  clearSearchHistory: async () => {
    await apiClient.delete('/api/books/search-history');
  },

  deleteSearchHistoryItem: async (id: number) => {
    await apiClient.delete(`/api/books/search-history/${id}`);
  }
};
