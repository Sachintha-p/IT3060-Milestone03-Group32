import { apiClient } from '@/api/client';
import { ReservationRequest, ReservationResponse, CheckInResponse } from '../types';

export async function createReservation(req: ReservationRequest): Promise<ReservationResponse> {
  const res = await apiClient.post(`/api/reservations`, req);
  return res.data.data;
}

export async function getMyReservations(): Promise<ReservationResponse[]> {
  const res = await apiClient.get(`/api/reservations/me`);
  return res.data.data;
}

export async function checkIn(id: number): Promise<CheckInResponse> {
  const res = await apiClient.put(`/api/reservations/${id}/check-in`);
  return res.data.data;
}

export async function cancelReservation(id: number): Promise<void> {
  await apiClient.delete(`/api/reservations/${id}`);
}
