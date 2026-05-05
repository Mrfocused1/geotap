import type { IGeofenceService } from '@/services/interfaces/IGeofenceService';
import { MOCK_GEOFENCES } from '@/services/mock/mockData';
import type { Geofence, GeofenceInput } from '@/types/geofence';

const store = new Map<string, Geofence>(
  MOCK_GEOFENCES.map((g) => [g.id, g])
);

function nowIso(): string {
  return new Date().toISOString();
}

export const mockGeofenceService: IGeofenceService = {
  async listForUser(userId) {
    return Array.from(store.values()).filter((g) => g.userId === userId);
  },
  async get(id) {
    return store.get(id) ?? null;
  },
  async create(userId, input: GeofenceInput) {
    const geofence: Geofence = {
      id: `gf-${Math.random().toString(36).slice(2)}`,
      userId,
      ...input,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.set(geofence.id, geofence);
    return geofence;
  },
  async update(id, patch) {
    const existing = store.get(id);
    if (!existing) throw new Error(`Geofence ${id} not found`);
    const updated: Geofence = { ...existing, ...patch, updatedAt: nowIso() };
    store.set(id, updated);
    return updated;
  },
  async delete(id) {
    store.delete(id);
  },
  async setActive(id, isActive) {
    return mockGeofenceService.update(id, { isActive });
  },
};
