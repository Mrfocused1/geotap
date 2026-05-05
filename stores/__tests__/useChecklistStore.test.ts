import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChecklistStore } from '@/stores/useChecklistStore';
import { mockChecklistService } from '@/services/mock/mockChecklistService';
import { MOCK_CHECKLISTS, MOCK_USER } from '@/services/mock/mockData';
import { Config } from '@/constants/config';

jest.mock('@/services', () => ({
  checklistService: require('@/services/mock/mockChecklistService')
    .mockChecklistService,
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  const mem = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => mem.get(k) ?? null),
      setItem: jest.fn(async (k: string, v: string) => {
        mem.set(k, v);
      }),
      removeItem: jest.fn(async (k: string) => {
        mem.delete(k);
      }),
      __mem: mem,
    },
  };
});

describe('useChecklistStore', () => {
  beforeEach(async () => {
    useChecklistStore.setState({
      checklists: [],
      activeSession: null,
      isLoading: false,
      error: null,
    });
    await AsyncStorage.removeItem(Config.storage.ACTIVE_SESSION_KEY);
  });

  it('loadChecklists populates from service', async () => {
    await useChecklistStore.getState().loadChecklists(MOCK_USER.id);
    const state = useChecklistStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.checklists.length).toBeGreaterThan(0);
    expect(
      state.checklists.every((c) => c.userId === MOCK_USER.id)
    ).toBe(true);
  });

  it('createChecklist inserts into store', async () => {
    const created = await useChecklistStore
      .getState()
      .createChecklist(MOCK_USER.id, {
        name: 'Test list',
        items: [
          { name: 'A', priority: 'high', sortOrder: 0 },
          { name: 'B', priority: 'medium', sortOrder: 1 },
        ],
        geofenceIds: ['gf-home'],
      });
    expect(created.id).toBeTruthy();
    expect(created.items).toHaveLength(2);
    expect(useChecklistStore.getState().checklists).toContainEqual(created);
  });

  it('updateChecklist patches the checklist', async () => {
    const seed = await mockChecklistService.create(MOCK_USER.id, {
      name: 'A',
      items: [{ name: 'one', priority: 'high', sortOrder: 0 }],
      geofenceIds: [],
    });
    useChecklistStore.setState({ checklists: [seed] });
    const updated = await useChecklistStore
      .getState()
      .updateChecklist(seed.id, { name: 'B' });
    expect(updated.name).toBe('B');
    expect(
      useChecklistStore
        .getState()
        .checklists.find((c) => c.id === seed.id)?.name
    ).toBe('B');
  });

  it('deleteChecklist removes from store', async () => {
    const seed = await mockChecklistService.create(MOCK_USER.id, {
      name: 'X',
      items: [],
      geofenceIds: [],
    });
    useChecklistStore.setState({ checklists: [seed] });
    await useChecklistStore.getState().deleteChecklist(seed.id);
    expect(useChecklistStore.getState().checklists).toHaveLength(0);
  });

  it('addItem appends an item with the next sortOrder', async () => {
    const seed = await mockChecklistService.create(MOCK_USER.id, {
      name: 'A',
      items: [{ name: 'first', priority: 'high', sortOrder: 0 }],
      geofenceIds: [],
    });
    useChecklistStore.setState({ checklists: [seed] });
    const updated = await useChecklistStore
      .getState()
      .addItem(seed.id, { name: 'second', priority: 'low' });
    expect(updated.items).toHaveLength(2);
    const sorted = updated.items
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
    expect(sorted[1]?.name).toBe('second');
    expect(sorted[1]?.sortOrder).toBe(1);
  });

  it('updateItem changes a single item without dropping others', async () => {
    const seed = await mockChecklistService.create(MOCK_USER.id, {
      name: 'A',
      items: [
        { name: 'one', priority: 'high', sortOrder: 0 },
        { name: 'two', priority: 'medium', sortOrder: 1 },
      ],
      geofenceIds: [],
    });
    useChecklistStore.setState({ checklists: [seed] });
    const targetId = seed.items.find((i) => i.sortOrder === 0)?.id ?? '';
    const updated = await useChecklistStore
      .getState()
      .updateItem(seed.id, targetId, { name: 'one renamed' });
    const sorted = updated.items
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
    expect(sorted[0]?.name).toBe('one renamed');
    expect(sorted[1]?.name).toBe('two');
  });

  it('removeItem deletes and reindexes sortOrder', async () => {
    const seed = await mockChecklistService.create(MOCK_USER.id, {
      name: 'A',
      items: [
        { name: 'a', priority: 'high', sortOrder: 0 },
        { name: 'b', priority: 'medium', sortOrder: 1 },
        { name: 'c', priority: 'low', sortOrder: 2 },
      ],
      geofenceIds: [],
    });
    useChecklistStore.setState({ checklists: [seed] });
    const middleId = seed.items.find((i) => i.sortOrder === 1)?.id ?? '';
    const updated = await useChecklistStore
      .getState()
      .removeItem(seed.id, middleId);
    expect(updated.items).toHaveLength(2);
    const sorted = updated.items
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
    expect(sorted.map((i) => i.name)).toEqual(['a', 'c']);
    expect(sorted.map((i) => i.sortOrder)).toEqual([0, 1]);
  });

  it('reorderItems applies the supplied order', async () => {
    const seed = await mockChecklistService.create(MOCK_USER.id, {
      name: 'A',
      items: [
        { name: 'a', priority: 'high', sortOrder: 0 },
        { name: 'b', priority: 'medium', sortOrder: 1 },
        { name: 'c', priority: 'low', sortOrder: 2 },
      ],
      geofenceIds: [],
    });
    useChecklistStore.setState({ checklists: [seed] });
    const item0 = seed.items.find((i) => i.sortOrder === 0);
    const item1 = seed.items.find((i) => i.sortOrder === 1);
    const item2 = seed.items.find((i) => i.sortOrder === 2);
    if (!item0 || !item1 || !item2) throw new Error('seed items missing');
    const reversed = [item2.id, item1.id, item0.id];
    const updated = await useChecklistStore
      .getState()
      .reorderItems(seed.id, reversed);
    const sorted = updated.items
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
    expect(sorted.map((i) => i.name)).toEqual(['c', 'b', 'a']);
  });

  it('toggleItem toggles checkedItemIds and persists to AsyncStorage', async () => {
    useChecklistStore
      .getState()
      .startSession({ checklistId: 'cl-1', geofenceId: 'gf-1' });
    useChecklistStore.getState().toggleItem('it-1');
    const session = useChecklistStore.getState().activeSession;
    expect(session?.checkedItemIds.has('it-1')).toBe(true);

    // Wait a microtask so the persist promise has resolved.
    await Promise.resolve();
    const raw = await AsyncStorage.getItem(
      Config.storage.ACTIVE_SESSION_KEY
    );
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.checkedItemIds).toEqual(['it-1']);

    useChecklistStore.getState().toggleItem('it-1');
    expect(
      useChecklistStore.getState().activeSession?.checkedItemIds.has('it-1')
    ).toBe(false);
  });

  it('restoreSession loads a recent session and discards stale ones', async () => {
    // Recent session
    const recent = {
      checklistId: 'cl-1',
      geofenceId: 'gf-1',
      checkedItemIds: ['it-a', 'it-b'],
      startedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(
      Config.storage.ACTIVE_SESSION_KEY,
      JSON.stringify(recent)
    );
    await useChecklistStore.getState().restoreSession();
    const restored = useChecklistStore.getState().activeSession;
    expect(restored).not.toBeNull();
    expect(restored?.checkedItemIds.has('it-a')).toBe(true);
    expect(restored?.checkedItemIds.has('it-b')).toBe(true);

    // Stale session (3 hours old)
    useChecklistStore.setState({ activeSession: null });
    const stale = {
      ...recent,
      startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    };
    await AsyncStorage.setItem(
      Config.storage.ACTIVE_SESSION_KEY,
      JSON.stringify(stale)
    );
    await useChecklistStore.getState().restoreSession();
    expect(useChecklistStore.getState().activeSession).toBeNull();
    const cleared = await AsyncStorage.getItem(
      Config.storage.ACTIVE_SESSION_KEY
    );
    expect(cleared).toBeNull();
  });

  it('clearSession wipes both store and AsyncStorage', async () => {
    useChecklistStore
      .getState()
      .startSession({ checklistId: 'cl-1', geofenceId: 'gf-1' });
    await Promise.resolve();
    expect(
      await AsyncStorage.getItem(Config.storage.ACTIVE_SESSION_KEY)
    ).toBeTruthy();
    useChecklistStore.getState().clearSession();
    await Promise.resolve();
    expect(useChecklistStore.getState().activeSession).toBeNull();
    expect(
      await AsyncStorage.getItem(Config.storage.ACTIVE_SESSION_KEY)
    ).toBeNull();
  });

  it('mock data is intact for downstream tests', () => {
    expect(MOCK_CHECKLISTS).toHaveLength(2);
    expect(MOCK_CHECKLISTS[0]?.id).toBe('cl-leaving-home');
  });
});
