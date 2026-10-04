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

export async function updateSlot(id: number, reservationDate: string, startTime: string, endTime: string): Promise<ReservationResponse> {
  const res = await apiClient.patch(`/api/feature1/reservations/${id}/slot`, { reservationDate, startTime, endTime });
  return res.data.data;
}

export async function getFilters(): Promise<any> {
  const res = await apiClient.get(`/api/feature1/filters`);
  return res.data.data;
}

export async function saveFilter(filter: any): Promise<any> {
  const res = await apiClient.put(`/api/feature1/filters`, filter);
  return res.data.data;
}

export async function getAlerts(): Promise<any[]> {
  const res = await apiClient.get(`/api/feature1/alerts`);
  return res.data.data;
}

export async function createAlert(zone: string): Promise<any> {
  const res = await apiClient.post(`/api/feature1/alerts`, { zone });
  return res.data.data;
}

export async function deleteAlert(id: number): Promise<void> {
  await apiClient.delete(`/api/feature1/alerts/${id}`);
}
