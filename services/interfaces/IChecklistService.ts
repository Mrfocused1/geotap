import type {
  Checklist,
  ChecklistInput,
  ChecklistInstance,
} from '@/types/checklist';

export interface IChecklistService {
  listForUser(userId: string): Promise<Checklist[]>;
  get(id: string): Promise<Checklist | null>;
  create(userId: string, input: ChecklistInput): Promise<Checklist>;
  update(id: string, patch: Partial<ChecklistInput>): Promise<Checklist>;
  delete(id: string): Promise<void>;
  listForGeofence(geofenceId: string): Promise<Checklist[]>;

  recordInstance(
    input: Omit<ChecklistInstance, 'id'>
  ): Promise<ChecklistInstance>;
  listInstancesForChecklist(checklistId: string): Promise<ChecklistInstance[]>;
}
