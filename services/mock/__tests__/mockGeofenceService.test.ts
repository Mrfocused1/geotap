import { mockGeofenceService } from '@/services/mock/mockGeofenceService';
import { MOCK_USER, MOCK_GEOFENCES } from '@/services/mock/mockData';

describe('mockGeofenceService', () => {
  const INPUT = {
    name: 'Test Place',
    address: '1 Test St',
    latitude: 51.5,
    longitude: -0.1,
    radiusMeters: 150,
    isActive: true,
  };

  it('listForUser returns geofences for the correct user', async () => {
    const list = await mockGeofenceService.listForUser(MOCK_USER.id);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((g) => g.userId === MOCK_USER.id)).toBe(true);
  });

  it('listForUser returns empty for unknown user', async () => {
    const list = await mockGeofenceService.listForUser('nobody');
    expect(list).toHaveLength(0);
  });

  it('get returns known geofence', async () => {
    const target = MOCK_GEOFENCES[0]!;
    const result = await mockGeofenceService.get(target.id);
    expect(result?.id).toBe(target.id);
  });

  it('get returns null for unknown id', async () => {
    const result = await mockGeofenceService.get('nope');
    expect(result).toBeNull();
  });

  it('create adds and returns a geofence with an id', async () => {
    const created = await mockGeofenceService.create(MOCK_USER.id, INPUT);
    expect(created.id).toBeTruthy();
    expect(created.name).toBe('Test Place');
    expect(created.userId).toBe(MOCK_USER.id);
  });

  it('update patches fields without replacing the object', async () => {
    const created = await mockGeofenceService.create(MOCK_USER.id, INPUT);
    const updated = await mockGeofenceService.update(created.id, { name: 'Renamed' });
    expect(updated.name).toBe('Renamed');
    expect(updated.address).toBe(INPUT.address);
    expect(updated.id).toBe(created.id);
  });

  it('update throws for unknown id', async () => {
    await expect(mockGeofenceService.update('bad-id', { name: 'x' })).rejects.toThrow();
  });

  it('delete removes the geofence', async () => {
    const created = await mockGeofenceService.create(MOCK_USER.id, INPUT);
    await mockGeofenceService.delete(created.id);
    const result = await mockGeofenceService.get(created.id);
    expect(result).toBeNull();
  });

  it('setActive flips isActive', async () => {
    const created = await mockGeofenceService.create(MOCK_USER.id, { ...INPUT, isActive: true });
    const off = await mockGeofenceService.setActive(created.id, false);
    expect(off.isActive).toBe(false);
    const on = await mockGeofenceService.setActive(created.id, true);
    expect(on.isActive).toBe(true);
  });
});
