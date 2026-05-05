import { useGeofenceStore } from '@/stores/useGeofenceStore';
import { mockGeofenceService } from '@/services/mock/mockGeofenceService';
import { MOCK_USER } from '@/services/mock/mockData';

// Mock the services barrel so AsyncStorage (pulled in by mockAuthService) is
// never imported during this test suite.
jest.mock('@/services', () => ({
  geofenceService: require('@/services/mock/mockGeofenceService').mockGeofenceService,
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

describe('useGeofenceStore', () => {
  beforeEach(() => {
    useGeofenceStore.setState({
      geofences: [],
      isLoading: false,
      error: null,
    });
  });

  it('loadGeofences populates from service', async () => {
    await useGeofenceStore.getState().loadGeofences(MOCK_USER.id);
    const state = useGeofenceStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.geofences.length).toBeGreaterThan(0);
    expect(
      state.geofences.every((g) => g.userId === MOCK_USER.id)
    ).toBe(true);
  });

  it('createGeofence inserts into store', async () => {
    const created = await useGeofenceStore.getState().createGeofence(
      MOCK_USER.id,
      {
        name: 'Test',
        address: '1 Test St',
        latitude: 1,
        longitude: 2,
        radiusMeters: 100,
        isActive: true,
      }
    );
    expect(created.id).toBeTruthy();
    expect(useGeofenceStore.getState().geofences).toContainEqual(created);
  });

  it('updateGeofence patches the geofence', async () => {
    const created = await mockGeofenceService.create(MOCK_USER.id, {
      name: 'A',
      address: 'addr',
      latitude: 1,
      longitude: 2,
      radiusMeters: 100,
      isActive: true,
    });
    useGeofenceStore.setState({ geofences: [created] });
    const updated = await useGeofenceStore
      .getState()
      .updateGeofence(created.id, { name: 'B' });
    expect(updated.name).toBe('B');
    expect(
      useGeofenceStore.getState().geofences.find((g) => g.id === created.id)
        ?.name
    ).toBe('B');
  });

  it('deleteGeofence removes from store', async () => {
    const created = await mockGeofenceService.create(MOCK_USER.id, {
      name: 'X',
      address: 'a',
      latitude: 0,
      longitude: 0,
      radiusMeters: 100,
      isActive: true,
    });
    useGeofenceStore.setState({ geofences: [created] });
    await useGeofenceStore.getState().deleteGeofence(created.id);
    expect(useGeofenceStore.getState().geofences).toHaveLength(0);
  });

  it('toggleActive flips isActive', async () => {
    const created = await mockGeofenceService.create(MOCK_USER.id, {
      name: 'X',
      address: 'a',
      latitude: 0,
      longitude: 0,
      radiusMeters: 100,
      isActive: true,
    });
    useGeofenceStore.setState({ geofences: [created] });
    const updated = await useGeofenceStore
      .getState()
      .toggleActive(created.id);
    expect(updated.isActive).toBe(false);
    const updated2 = await useGeofenceStore
      .getState()
      .toggleActive(created.id);
    expect(updated2.isActive).toBe(true);
  });
});
