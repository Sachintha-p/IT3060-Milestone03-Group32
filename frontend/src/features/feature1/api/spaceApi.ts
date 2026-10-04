import { apiClient } from '@/api/client';
import { Space } from '../types/space';

/**
 * Retrieves a list of all spaces, optionally filtered by search.
 */
export const getSpaces = async (search?: string): Promise<Space[]> => {
  const response = await apiClient.get('/api/feature1/spaces', {
    params: search ? { search } : undefined,
  });
  return response.data.data;
};

/**
 * Creates a new space (useful for seeding data/testing).
 */
export const createSpace = async (space: Omit<Space, 'id'>): Promise<Space> => {
  const response = await apiClient.post('/api/feature1/spaces', space);
  return response.data.data;
};
