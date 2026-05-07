import { supabase } from '@/services/supabase/client';
import type { IChecklistService } from '@/services/interfaces/IChecklistService';
import type {
  Checklist,
  ChecklistInput,
  ChecklistInstance,
  ChecklistItem,
  ItemPriority,
  RecurrencePattern,
} from '@/types/checklist';

type ChecklistRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern;
  geofence_ids: string[];
  created_at: string;
  updated_at: string;
  checklist_items: ItemRow[];
};

type ItemRow = {
  id: string;
  checklist_id: string;
  name: string;
  priority: ItemPriority;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type InstanceRow = {
  id: string;
  checklist_id: string;
  geofence_id: string;
  checked_item_ids: string[];
  completion_pct: number;
  triggered_at: string;
  completed_at: string | null;
};

function toItem(row: ItemRow): ChecklistItem {
  return {
    id: row.id,
    checklistId: row.checklist_id,
    name: row.name,
    priority: row.priority,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toChecklist(row: ChecklistRow): Checklist {
  const items = (row.checklist_items ?? [])
    .map(toItem)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    isRecurring: row.is_recurring,
    recurrencePattern: row.recurrence_pattern,
    items,
    geofenceIds: row.geofence_ids ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toInstance(row: InstanceRow): ChecklistInstance {
  return {
    id: row.id,
    checklistId: row.checklist_id,
    geofenceId: row.geofence_id,
    checkedItemIds: row.checked_item_ids ?? [],
    completionPct: row.completion_pct,
    triggeredAt: row.triggered_at,
    completedAt: row.completed_at,
  };
}

const SELECT_CHECKLIST = '*, checklist_items(*)';

export const supabaseChecklistService: IChecklistService = {
  async listForUser(userId): Promise<Checklist[]> {
    const { data, error } = await supabase
      .from('checklists')
      .select(SELECT_CHECKLIST)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .returns<ChecklistRow[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map(toChecklist);
  },

  async get(id): Promise<Checklist | null> {
    const { data, error } = await supabase
      .from('checklists')
      .select(SELECT_CHECKLIST)
      .eq('id', id)
      .single<ChecklistRow>();
    if (error) return null;
    return toChecklist(data);
  },

  async create(userId, input: ChecklistInput): Promise<Checklist> {
    const now = new Date().toISOString();

    const { data: cl, error: clErr } = await supabase
      .from('checklists')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? null,
        is_recurring: input.isRecurring ?? false,
        recurrence_pattern: input.recurrencePattern ?? null,
        geofence_ids: input.geofenceIds,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single<{ id: string }>();
    if (clErr) throw new Error(clErr.message);

    const checklistId = cl.id;
    const itemRows = input.items.map((it, idx) => ({
      checklist_id: checklistId,
      name: it.name,
      priority: it.priority,
      sort_order: it.sortOrder ?? idx,
      created_at: now,
      updated_at: now,
    }));

    if (itemRows.length > 0) {
      const { error: itemErr } = await supabase.from('checklist_items').insert(itemRows);
      if (itemErr) throw new Error(itemErr.message);
    }

    const result = await supabaseChecklistService.get(checklistId);
    if (!result) throw new Error('Failed to fetch created checklist');
    return result;
  },

  async update(id, patch): Promise<Checklist> {
    const now = new Date().toISOString();
    const clUpdate: Record<string, unknown> = { updated_at: now };
    if (patch.name !== undefined) clUpdate.name = patch.name;
    if (patch.description !== undefined) clUpdate.description = patch.description;
    if (patch.isRecurring !== undefined) clUpdate.is_recurring = patch.isRecurring;
    if (patch.recurrencePattern !== undefined) clUpdate.recurrence_pattern = patch.recurrencePattern;
    if (patch.geofenceIds !== undefined) clUpdate.geofence_ids = patch.geofenceIds;

    const { error: clErr } = await supabase
      .from('checklists')
      .update(clUpdate)
      .eq('id', id);
    if (clErr) throw new Error(clErr.message);

    if (patch.items !== undefined) {
      await supabase.from('checklist_items').delete().eq('checklist_id', id);
      const itemRows = patch.items.map((it, idx) => ({
        id: it.id,
        checklist_id: id,
        name: it.name,
        priority: it.priority,
        sort_order: it.sortOrder ?? idx,
        created_at: now,
        updated_at: now,
      }));
      if (itemRows.length > 0) {
        const { error: itemErr } = await supabase.from('checklist_items').insert(itemRows);
        if (itemErr) throw new Error(itemErr.message);
      }
    }

    const result = await supabaseChecklistService.get(id);
    if (!result) throw new Error('Failed to fetch updated checklist');
    return result;
  },

  async delete(id): Promise<void> {
    const { error } = await supabase.from('checklists').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async listForGeofence(geofenceId): Promise<Checklist[]> {
    const { data, error } = await supabase
      .from('checklists')
      .select(SELECT_CHECKLIST)
      .contains('geofence_ids', [geofenceId])
      .returns<ChecklistRow[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map(toChecklist);
  },

  async recordInstance(input: Omit<ChecklistInstance, 'id'>): Promise<ChecklistInstance> {
    const { data, error } = await supabase
      .from('checklist_instances')
      .insert({
        checklist_id: input.checklistId,
        geofence_id: input.geofenceId,
        checked_item_ids: input.checkedItemIds,
        completion_pct: input.completionPct,
        triggered_at: input.triggeredAt,
        completed_at: input.completedAt,
      })
      .select()
      .single<InstanceRow>();
    if (error) throw new Error(error.message);
    return toInstance(data);
  },

  async listInstancesForChecklist(checklistId): Promise<ChecklistInstance[]> {
    const { data, error } = await supabase
      .from('checklist_instances')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('triggered_at', { ascending: false })
      .returns<InstanceRow[]>();
    if (error) throw new Error(error.message);
    return (data ?? []).map(toInstance);
  },
};
