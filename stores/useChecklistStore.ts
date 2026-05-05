import { create } from 'zustand';
import type { ActiveSession, Checklist } from '@/types/checklist';

type ChecklistState = {
  checklists: Checklist[];
  activeSession: ActiveSession | null;
  isLoading: boolean;
  error: string | null;

  setChecklists: (next: Checklist[]) => void;
  upsert: (checklist: Checklist) => void;
  remove: (id: string) => void;

  startSession: (input: {
    checklistId: string;
    geofenceId: string;
  }) => void;
  toggleItem: (itemId: string) => void;
  clearSession: () => void;

  setError: (msg: string | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useChecklistStore = create<ChecklistState>((set) => ({
  checklists: [],
  activeSession: null,
  isLoading: false,
  error: null,

  setChecklists: (checklists) => set({ checklists }),
  upsert: (checklist) =>
    set((state) => {
      const idx = state.checklists.findIndex((c) => c.id === checklist.id);
      if (idx === -1) return { checklists: [...state.checklists, checklist] };
      const next = state.checklists.slice();
      next[idx] = checklist;
      return { checklists: next };
    }),
  remove: (id) =>
    set((state) => ({
      checklists: state.checklists.filter((c) => c.id !== id),
    })),

  startSession: ({ checklistId, geofenceId }) =>
    set({
      activeSession: {
        checklistId,
        geofenceId,
        checkedItemIds: new Set<string>(),
        startedAt: new Date(),
      },
    }),

  toggleItem: (itemId) =>
    set((state) => {
      if (!state.activeSession) return {};
      const next = new Set(state.activeSession.checkedItemIds);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return {
        activeSession: { ...state.activeSession, checkedItemIds: next },
      };
    }),

  clearSession: () => set({ activeSession: null }),

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
