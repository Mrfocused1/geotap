import { create } from 'zustand';
import type { Geofence } from '@/types/geofence';

type GeofenceState = {
  geofences: Geofence[];
  isLoading: boolean;
  error: string | null;

  setGeofences: (next: Geofence[]) => void;
  upsert: (geofence: Geofence) => void;
  remove: (id: string) => void;
  setError: (msg: string | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useGeofenceStore = create<GeofenceState>((set) => ({
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
}));
