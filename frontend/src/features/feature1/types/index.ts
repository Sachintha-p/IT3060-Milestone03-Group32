export type SpaceType = 'DESK' | 'ROOM';
export type Zone = 'GROUP_STUDY' | 'SILENT_STUDY' | 'READING_ROOM';
export type ReservationStatus = 'RESERVED' | 'CHECKED_IN' | 'CANCELLED';

export interface SpaceSummaryDTO {
  id: number;
  name: string;
  floor: string;
  zone: Zone;
  type: SpaceType;
  capacity: number;
  hasPowerOutlet: boolean;
  hasDesktopPc: boolean;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED';
}

export interface ZoneSummaryDTO {
  floor: string;
  zone: Zone;
  total: number;
  available: number;
  reserved: number;
  occupied: number;
}

export interface TimeSlotDTO {
  startTime: string; // "10:00:00"
  endTime: string;
  isBooked: boolean;
}

export interface SpaceDetailDTO {
  space: SpaceSummaryDTO;
  slots: TimeSlotDTO[];
}

export interface ReservationRequest {
  spaceId: number;
  date: string; // "2026-10-02"
  startTime: string; // "10:00:00"
  endTime: string;
}

export interface ReservationResponse {
  id: number;
  uniqueCode: string;
  space: SpaceSummaryDTO;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface CheckInResponse {
  message: string;
  occupiedUntil: string;
}
