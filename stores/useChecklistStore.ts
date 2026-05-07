import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Config } from '@/constants/config';
import { checklistService } from '@/services';
import type {
  ActiveSession,
  Checklist,
  ChecklistInput,
  ChecklistItem,
  ItemPriority,
} from '@/types/checklist';

type PersistedSession = {
  checklistId: string;
  geofenceId: string;
  checkedItemIds: string[];
  startedAt: string;
};

type ChecklistState = {
  checklists: Checklist[];
  activeSession: ActiveSession | null;
  isLoading: boolean;
  error: string | null;

  reset: () => Promise<void>;

  // sync helpers
  setChecklists: (next: Checklist[]) => void;
  upsert: (checklist: Checklist) => void;
  remove: (id: string) => void;
  setError: (msg: string | null) => void;
  setLoading: (loading: boolean) => void;

  // session
  startSession: (input: { checklistId: string; geofenceId: string }) => void;
  toggleItem: (itemId: string) => void;
  clearSession: () => void;
  persistSession: () => Promise<void>;
  restoreSession: () => Promise<void>;

  // async checklist CRUD
  loadChecklists: (userId: string) => Promise<void>;
  createChecklist: (
    userId: string,
    input: ChecklistInput
  ) => Promise<Checklist>;
  updateChecklist: (
    id: string,
    patch: Partial<ChecklistInput>
  ) => Promise<Checklist>;
  deleteChecklist: (id: string) => Promise<void>;

  // item-level helpers (operate on a checklist by id)
  addItem: (
    checklistId: string,
    input: { name: string; priority?: ItemPriority }
  ) => Promise<Checklist>;
  updateItem: (
    checklistId: string,
    itemId: string,
    patch: Partial<Pick<ChecklistItem, 'name' | 'priority'>>
  ) => Promise<Checklist>;
  removeItem: (checklistId: string, itemId: string) => Promise<Checklist>;
  reorderItems: (
    checklistId: string,
    orderedItemIds: string[]
  ) => Promise<Checklist>;
};

function toInputItems(items: ChecklistItem[]) {
  return items
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((it, idx) => ({
      id: it.id,
      name: it.name,
      priority: it.priority,
      sortOrder: idx,
    }));
}

async function writeSession(session: ActiveSession): Promise<void> {
  const payload: PersistedSession = {
    checklistId: session.checklistId,
    geofenceId: session.geofenceId,
    checkedItemIds: Array.from(session.checkedItemIds),
    startedAt: session.startedAt.toISOString(),
  };
  await AsyncStorage.setItem(
    Config.storage.ACTIVE_SESSION_KEY,
    JSON.stringify(payload)
  );
}

async function clearSessionStorage(): Promise<void> {
  await AsyncStorage.removeItem(Config.storage.ACTIVE_SESSION_KEY);
}

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  checklists: [],
  activeSession: null,
  isLoading: false,
  error: null,

  reset: async () => {
    set({ checklists: [], activeSession: null, isLoading: false, error: null });
    await clearSessionStorage();
    await AsyncStorage.multiRemove([
      Config.storage.ACTIVE_SESSION_KEY,
      Config.storage.CHECKLIST_CACHE_KEY,
    ]);
  },

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
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

  startSession: ({ checklistId, geofenceId }) => {
    const session: ActiveSession = {
      checklistId,
      geofenceId,
      checkedItemIds: new Set<string>(),
      startedAt: new Date(),
    };
    set({ activeSession: session });
    writeSession(session).catch(() => undefined);
  },

  toggleItem: (itemId) =>
    set((state) => {
      if (!state.activeSession) return {};
      const next = new Set(state.activeSession.checkedItemIds);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      const updated: ActiveSession = {
        ...state.activeSession,
        checkedItemIds: next,
      };
      writeSession(updated).catch(() => undefined);
      return { activeSession: updated };
    }),

  clearSession: () => {
    set({ activeSession: null });
    clearSessionStorage().catch(() => undefined);
  },

  persistSession: async () => {
    const session = get().activeSession;
    if (!session) {
      await clearSessionStorage();
      return;
    }
    await writeSession(session);
  },

  restoreSession: async () => {
    const raw = await AsyncStorage.getItem(
      Config.storage.ACTIVE_SESSION_KEY
    );
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as PersistedSession;
      const startedAt = new Date(parsed.startedAt);
      const ageMs = Date.now() - startedAt.getTime();
      if (ageMs > Config.session.RESTORE_WINDOW_MS) {
        await clearSessionStorage();
        return;
      }
      set({
        activeSession: {
          checklistId: parsed.checklistId,
          geofenceId: parsed.geofenceId,
          checkedItemIds: new Set<string>(parsed.checkedItemIds),
          startedAt,
        },
      });
    } catch {
      await clearSessionStorage();
    }
  },

  loadChecklists: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const checklists = await checklistService.listForUser(userId);
      set({ checklists, isLoading: false });
      AsyncStorage.setItem(
        Config.storage.CHECKLIST_CACHE_KEY,
        JSON.stringify(checklists)
      ).catch(() => undefined);
    } catch (e) {
      set({
        isLoading: false,
        error:
          e instanceof Error ? e.message : 'failed to load checklists',
      });
    }
  },

  createChecklist: async (userId, input) => {
    set({ error: null });
    try {
      const created = await checklistService.create(userId, input);
      get().upsert(created);
      return created;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'failed to create checklist';
      set({ error: msg });
      throw e;
    }
  },

  updateChecklist: async (id, patch) => {
    set({ error: null });
    try {
      const updated = await checklistService.update(id, patch);
      get().upsert(updated);
      return updated;
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'failed to update checklist';
      set({ error: msg });
      throw e;
    }
  },

  deleteChecklist: async (id) => {
    set({ error: null });
    try {
      await checklistService.delete(id);
      get().remove(id);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'failed to delete checklist';
      set({ error: msg });
      throw e;
    }
  },

  addItem: async (checklistId, input) => {
    const existing = get().checklists.find((c) => c.id === checklistId);
    if (!existing) throw new Error(`Checklist ${checklistId} not in store`);
    const nextItems = [
      ...toInputItems(existing.items),
      {
        name: input.name,
        priority: input.priority ?? ('medium' as const),
        sortOrder: existing.items.length,
      },
    ];
    return get().updateChecklist(checklistId, { items: nextItems });
  },

  updateItem: async (checklistId, itemId, patch) => {
    const existing = get().checklists.find((c) => c.id === checklistId);
    if (!existing) throw new Error(`Checklist ${checklistId} not in store`);
    const nextItems = existing.items
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((it, idx) => ({
        name: it.id === itemId ? patch.name ?? it.name : it.name,
        priority:
          it.id === itemId ? patch.priority ?? it.priority : it.priority,
        sortOrder: idx,
      }));
    return get().updateChecklist(checklistId, { items: nextItems });
  },

  removeItem: async (checklistId, itemId) => {
    const existing = get().checklists.find((c) => c.id === checklistId);
    if (!existing) throw new Error(`Checklist ${checklistId} not in store`);
    const nextItems = existing.items
      .filter((it) => it.id !== itemId)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((it, idx) => ({
        name: it.name,
        priority: it.priority,
        sortOrder: idx,
      }));
    return get().updateChecklist(checklistId, { items: nextItems });
  },

  reorderItems: async (checklistId, orderedItemIds) => {
    const existing = get().checklists.find((c) => c.id === checklistId);
    if (!existing) throw new Error(`Checklist ${checklistId} not in store`);
    const byId = new Map(existing.items.map((it) => [it.id, it]));
    const nextItems = orderedItemIds.map((id, idx) => {
      const it = byId.get(id);
      if (!it) throw new Error(`Item ${id} not in checklist ${checklistId}`);
      return {
        name: it.name,
        priority: it.priority,
        sortOrder: idx,
      };
    });
    return get().updateChecklist(checklistId, { items: nextItems });
  },
}));
