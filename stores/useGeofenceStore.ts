import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Config } from '@/constants/config';
import { geofenceService } from '@/services';
import type { Geofence, GeofenceInput } from '@/types/geofence';

type GeofenceState = {
  geofences: Geofence[];
  isLoading: boolean;
  error: string | null;

  // sync helpers
  setGeofences: (next: Geofence[]) => void;
  upsert: (geofence: Geofence) => void;
  remove: (id: string) => void;
  setError: (msg: string | null) => void;
  setLoading: (loading: boolean) => void;

  // async actions
  loadGeofences: (userId: string) => Promise<void>;
  createGeofence: (
    userId: string,
    input: GeofenceInput
  ) => Promise<Geofence>;
  updateGeofence: (
    id: string,
    patch: Partial<GeofenceInput>
  ) => Promise<Geofence>;
  deleteGeofence: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<Geofence>;
};

export const useGeofenceStore = create<GeofenceState>((set, get) => ({
  geofences: [],
  isLoading: false,
  error: null,

  setGeofences: (geofences) => set({ geofences }),
  upsert: (geofence) =>
    set((state) => {
      const idx = state.geofences.findIndex((g) => g.id === geofence.id);
      if (idx === -1) return { geofences: [...state.geofences, geofence] };
      const next = state.geofences.slice();
      next[idx] = geofence;
      return { geofences: next };
    }),
  remove: (id) =>
    set((state) => ({
      geofences: state.geofences.filter((g) => g.id !== id),
    })),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

  loadGeofences: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const geofences = await geofenceService.listForUser(userId);
      set({ geofences, isLoading: false });
      AsyncStorage.setItem(
        Config.storage.GEOFENCE_CACHE_KEY,
        JSON.stringify(geofences)
      ).catch(() => undefined);
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : 'failed to load geofences',
      });
    }
  },

  createGeofence: async (userId, input) => {
    set({ error: null });
    try {
      const geofence = await geofenceService.create(userId, input);
      get().upsert(geofence);
      return geofence;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'failed to create geofence';
      set({ error: msg });
      throw e;
    }
  },

  updateGeofence: async (id, patch) => {
    set({ error: null });
    try {
      const updated = await geofenceService.update(id, patch);
      get().upsert(updated);
      return updated;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'failed to update geofence';
      set({ error: msg });
      throw e;
    }
  },

  deleteGeofence: async (id) => {
    set({ error: null });
    try {
      await geofenceService.delete(id);
      get().remove(id);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'failed to delete geofence';
      set({ error: msg });
      throw e;
    }
  },

  toggleActive: async (id) => {
    set({ error: null });
    const existing = get().geofences.find((g) => g.id === id);
    if (!existing) {
      throw new Error(`Geofence ${id} not in store`);
    }
    try {
      const updated = await geofenceService.setActive(id, !existing.isActive);
      get().upsert(updated);
      return updated;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'failed to toggle geofence';
      set({ error: msg });
      throw e;
    }
  },
}));
