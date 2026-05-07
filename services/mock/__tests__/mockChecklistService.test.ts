import { mockChecklistService } from '@/services/mock/mockChecklistService';
import { MOCK_USER, MOCK_CHECKLISTS } from '@/services/mock/mockData';

describe('mockChecklistService', () => {
  it('listForUser returns checklists for the right user', async () => {
    const list = await mockChecklistService.listForUser(MOCK_USER.id);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((c) => c.userId === MOCK_USER.id)).toBe(true);
  });

  it('get returns a checklist by id', async () => {
    const target = MOCK_CHECKLISTS[0]!;
    const result = await mockChecklistService.get(target.id);
    expect(result?.id).toBe(target.id);
  });

  it('get returns null for unknown id', async () => {
    const result = await mockChecklistService.get('non-existent');
    expect(result).toBeNull();
  });

  it('create adds a new checklist', async () => {
    const created = await mockChecklistService.create(MOCK_USER.id, {
      name: 'Test List',
      geofenceIds: [],
      items: [{ name: 'Item A', priority: 'medium', sortOrder: 0 }],
    });
    expect(created.id).toBeTruthy();
    expect(created.name).toBe('Test List');
    expect(created.items).toHaveLength(1);
    expect(created.items[0]?.name).toBe('Item A');
  });

  it('create assigns item ids', async () => {
    const created = await mockChecklistService.create(MOCK_USER.id, {
      name: 'ID Test',
      geofenceIds: [],
      items: [
        { name: 'A', priority: 'low', sortOrder: 0 },
        { name: 'B', priority: 'high', sortOrder: 1 },
      ],
    });
    expect(created.items.every((i) => Boolean(i.id))).toBe(true);
    const ids = new Set(created.items.map((i) => i.id));
    expect(ids.size).toBe(2);
  });

  it('update preserves item ids when provided', async () => {
    const created = await mockChecklistService.create(MOCK_USER.id, {
      name: 'Preserve IDs',
      geofenceIds: [],
      items: [{ name: 'Keep me', priority: 'medium', sortOrder: 0 }],
    });
    const existingId = created.items[0]!.id;
    const updated = await mockChecklistService.update(created.id, {
      items: [{ id: existingId, name: 'Keep me', priority: 'high', sortOrder: 0 }],
    });
    expect(updated.items[0]!.id).toBe(existingId);
  });

  it('update generates new ids for items without an id', async () => {
    const created = await mockChecklistService.create(MOCK_USER.id, {
      name: 'New IDs',
      geofenceIds: [],
      items: [],
    });
    const updated = await mockChecklistService.update(created.id, {
      items: [{ name: 'Brand new', priority: 'low', sortOrder: 0 }],
    });
    expect(updated.items[0]?.id).toBeTruthy();
  });

  it('delete removes the checklist', async () => {
    const created = await mockChecklistService.create(MOCK_USER.id, {
      name: 'Delete me',
      geofenceIds: [],
      items: [],
    });
    await mockChecklistService.delete(created.id);
    const result = await mockChecklistService.get(created.id);
    expect(result).toBeNull();
  });

  it('listForGeofence returns matching checklists', async () => {
    const gfId = 'gf-home';
    const list = await mockChecklistService.listForGeofence(gfId);
    expect(list.every((c) => c.geofenceIds.includes(gfId))).toBe(true);
  });

  it('recordInstance stores and listInstancesForChecklist retrieves it', async () => {
    const instance = await mockChecklistService.recordInstance({
      checklistId: MOCK_CHECKLISTS[0]!.id,
      geofenceId: 'gf-home',
      checkedItemIds: ['it-keys'],
      completionPct: 50,
      triggeredAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    expect(instance.id).toBeTruthy();
    expect(instance.completionPct).toBe(50);

    const list = await mockChecklistService.listInstancesForChecklist(MOCK_CHECKLISTS[0]!.id);
    expect(list.some((i) => i.id === instance.id)).toBe(true);
  });
});
