export type SpaceStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
export type SpaceType = 'DESK' | 'ROOM';

export interface Space {
  id: number;
  name: string;
  location: string;
  type: SpaceType;
  status: SpaceStatus;
  hasPower: boolean;
  hasDesktop: boolean;
  capacity: number;
}
