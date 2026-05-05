import type { Geofence, GeofenceInput } from '@/types/geofence';

export interface IGeofenceService {
  listForUser(userId: string): Promise<Geofence[]>;
  get(id: string): Promise<Geofence | null>;
  create(userId: string, input: GeofenceInput): Promise<Geofence>;
  update(id: string, patch: Partial<GeofenceInput>): Promise<Geofence>;
  delete(id: string): Promise<void>;
  setActive(id: string, isActive: boolean): Promise<Geofence>;
}
