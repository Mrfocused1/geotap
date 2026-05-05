import type { IChecklistService } from '@/services/interfaces/IChecklistService';
import { MOCK_CHECKLISTS } from '@/services/mock/mockData';
import type {
  Checklist,
  ChecklistInput,
  ChecklistInstance,
} from '@/types/checklist';

const store = new Map<string, Checklist>(
  MOCK_CHECKLISTS.map((c) => [c.id, c])
);
const instances: ChecklistInstance[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

export const mockChecklistService: IChecklistService = {
  async listForUser(userId) {
    return Array.from(store.values()).filter((c) => c.userId === userId);
  },
  async get(id) {
    return store.get(id) ?? null;
  },
  async create(userId, input: ChecklistInput) {
    const id = `cl-${Math.random().toString(36).slice(2)}`;
    const created: Checklist = {
      id,
      userId,
      name: input.name,
      description: input.description ?? null,
      isRecurring: input.isRecurring ?? false,
      recurrencePattern: input.recurrencePattern ?? null,
      items: input.items.map((i, idx) => ({
        id: `it-${Math.random().toString(36).slice(2)}`,
        checklistId: id,
        name: i.name,
        priority: i.priority,
        sortOrder: i.sortOrder ?? idx,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      })),
      geofenceIds: input.geofenceIds,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.set(id, created);
    return created;
  },
  async update(id, patch) {
    const existing = store.get(id);
    if (!existing) throw new Error(`Checklist ${id} not found`);
    const updated: Checklist = {
      ...existing,
      ...patch,
      items: patch.items
        ? patch.items.map((i, idx) => ({
            id: `it-${Math.random().toString(36).slice(2)}`,
            checklistId: id,
            name: i.name,
            priority: i.priority,
            sortOrder: i.sortOrder ?? idx,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          }))
        : existing.items,
      geofenceIds: patch.geofenceIds ?? existing.geofenceIds,
      updatedAt: nowIso(),
    };
    store.set(id, updated);
    return updated;
  },
  async delete(id) {
    store.delete(id);
  },
  async listForGeofence(geofenceId) {
    return Array.from(store.values()).filter((c) =>
      c.geofenceIds.includes(geofenceId)
    );
  },
  async recordInstance(input) {
    const instance: ChecklistInstance = {
      id: `ci-${Math.random().toString(36).slice(2)}`,
      ...input,
    };
    instances.push(instance);
    return instance;
  },
  async listInstancesForChecklist(checklistId) {
    return instances.filter((i) => i.checklistId === checklistId);
  },
};
