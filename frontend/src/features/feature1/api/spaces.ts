import { apiClient } from '@/api/client';
import { SpaceSummaryDTO, SpaceDetailDTO, ZoneSummaryDTO, Zone } from '../types';

export async function getSpaces(params?: { floor?: string, zone?: Zone[], hasPower?: boolean, hasPc?: boolean }): Promise<SpaceSummaryDTO[]> {
  const query = new URLSearchParams();
  if (params?.floor) query.append('floor', params.floor);
  if (params?.hasPower !== undefined) query.append('hasPower', String(params.hasPower));
  if (params?.hasPc !== undefined) query.append('hasPc', String(params.hasPc));
  if (params?.zone) {
    params.zone.forEach(z => query.append('zone', z));
  }
  
  const res = await apiClient.get(`/api/public/spaces?${query.toString()}`);
  return res.data.data;
}

export async function getSpaceDetail(id: number): Promise<SpaceDetailDTO> {
  const res = await apiClient.get(`/api/public/spaces/${id}`);
  return res.data.data;
}

export async function getZoneSummaries(): Promise<ZoneSummaryDTO[]> {
  const res = await apiClient.get(`/api/public/zones/summary`);
  return res.data.data;
}
